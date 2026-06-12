import * as Sentry from '@sentry/node';
import admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { geminiApiKey, getGeminiModel } from '../config/gemini';
import { calculateCategoryBreakdown, getSpendingDataForPeriod } from '../helpers/aiChatContext';
import { buildNotificationPrompt } from '../helpers/aiChatPrompt';
import { extractFirstName } from '../helpers/userHelpers';
import { hasActiveSubscription } from '../stripe/helpers';
import type { Account, AiChatNotificationType } from '../types';

/**
 * Handler function for AI Coach scheduled checks
 * Exported separately for testing
 */
export async function aiCoachScheduledChecksHandler() {
  return Sentry.startSpan(
    { name: 'aiCoachScheduledChecks', op: 'function.pubsub.schedule' },
    async () => {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      const nowDate = now.toDate();

      console.log('Starting AI Coach scheduled checks...');

      try {
        // 1. Query all accounts with AI Chat enabled
        const accountsSnapshot = await db
          .collection('accounts')
          .where('aiChatEnabled', '==', true)
          .get();

        if (accountsSnapshot.empty) {
          console.log('No accounts with AI Chat enabled found.');
          return;
        }

        console.log(`Found ${accountsSnapshot.docs.length} accounts with AI Chat enabled.`);

        let processedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // 2. Process each account
        for (const accountDoc of accountsSnapshot.docs) {
          try {
            const account = accountDoc.data() as Account;
            const userId = account.userId;

            // 2a. Verify premium subscription
            const hasPremium = await hasActiveSubscription(userId);
            if (!hasPremium) {
              console.log(`Skipping ${userId} - no active premium subscription`);
              skippedCount++;
              continue;
            }

            // 2b. Get current active period
            const periodsSnapshot = await db
              .collection('accounts')
              .doc(userId)
              .collection('periods')
              .where('startAt', '<=', now)
              .where('endAt', '>=', now)
              .limit(1)
              .get();

            if (periodsSnapshot.empty) {
              console.log(`Skipping ${userId} - no active period`);
              skippedCount++;
              continue;
            }

            const periodDoc = periodsSnapshot.docs[0];
            const period = periodDoc.data();
            const periodId = periodDoc.id;

            const periodStartDate = period.startAt.toDate();
            const periodEndDate = period.endAt.toDate();
            const periodName = period.name || 'Current Period';

            // 2c. Calculate period progress
            const totalPeriodDuration = periodEndDate.getTime() - periodStartDate.getTime();
            const elapsedDuration = nowDate.getTime() - periodStartDate.getTime();
            const percentElapsed = (elapsedDuration / totalPeriodDuration) * 100;

            const daysRemaining = Math.ceil(
              (periodEndDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            // 2d. Get spending data
            const spendingData = await getSpendingDataForPeriod(userId, periodId);
            const totalSpending = spendingData.reduce((sum, s) => sum + s.amount, 0);
            const categoryBreakdown = calculateCategoryBreakdown(spendingData);

            const periodData = {
              name: periodName,
              startDate: periodStartDate,
              endDate: periodEndDate,
              targetSpend: period.targetSpend,
              targetSavings: period.targetSavings,
              goals: period.goals,
            };

            // Calculate budget percentage (if budget exists)
            let percentOfBudget = 0;
            if (period.targetSpend && period.targetSpend > 0) {
              percentOfBudget = (totalSpending / period.targetSpend) * 100;
            }

            // 2e. Check if we sent a notification in the last 24 hours
            const twentyFourHoursAgo = admin.firestore.Timestamp.fromDate(
              new Date(nowDate.getTime() - 24 * 60 * 60 * 1000),
            );

            const recentNotificationsSnapshot = await db
              .collection('accounts')
              .doc(userId)
              .collection('aiChatNotifications')
              .where('periodId', '==', periodId)
              .where('createdAt', '>=', twentyFourHoursAgo)
              .limit(1)
              .get();

            if (!recentNotificationsSnapshot.empty) {
              console.log(`Skipping ${userId} - notification sent in last 24 hours`);
              skippedCount++;
              continue;
            }

            // 2f. Determine which notification to send (if any)
            let notificationType: AiChatNotificationType | null = null;

            // Priority 1: Period ending (3 days or less remaining)
            if (daysRemaining <= 3 && daysRemaining > 0) {
              notificationType = 'period-ending';
            }
            // Priority 2: Budget warning (75%+ of budget spent)
            else if (period.targetSpend && percentOfBudget >= 75) {
              notificationType = 'budget-warning';
            }
            // Priority 3: Mid-period milestone (45-55% elapsed)
            else if (percentElapsed >= 45 && percentElapsed <= 55) {
              notificationType = 'milestone';
            }

            if (!notificationType) {
              console.log(
                `Skipping ${userId} - no notification conditions met (${percentElapsed.toFixed(1)}% elapsed, ${percentOfBudget.toFixed(1)}% budget, ${daysRemaining} days remaining)`,
              );
              skippedCount++;
              continue;
            }

            console.log(
              `Generating ${notificationType} notification for ${userId} (${periodName})`,
            );

            // 2g. Generate notification content using Gemini
            // Get user's display name for personalization
            const user = await admin.auth().getUser(userId);
            const userName = extractFirstName(user.displayName);
            const prompt = buildNotificationPrompt(
              userName,
              notificationType,
              periodData,
              spendingData,
              categoryBreakdown,
              account.currency || 'USD',
            );

            const model = getGeminiModel();
            const result = await model.generateContent(prompt);
            const response = result.response;
            const content = response.text();
            const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

            // 2h. Store notification in Firestore
            const notificationRef = db
              .collection('accounts')
              .doc(userId)
              .collection('aiChatNotifications')
              .doc();

            await notificationRef.set({
              id: notificationRef.id,
              userId,
              accountId: userId,
              periodId,
              periodName,
              content,
              checkInType: notificationType,
              createdAt: now,
              isRead: false,
              tokensUsed,
              aiModel: 'gemini-2.5-flash',
            });

            console.log(`Successfully created ${notificationType} notification for ${userId}`);
            processedCount++;
          } catch (error) {
            console.error(`Error processing account ${accountDoc.id}:`, error);
            Sentry.captureException(error, {
              extra: { accountId: accountDoc.id },
            });
            errorCount++;
          }
        }

        console.log(
          `AI Coach scheduled checks completed: ${processedCount} notifications sent, ${skippedCount} skipped, ${errorCount} errors`,
        );
      } catch (error) {
        console.error('Error in AI Coach scheduled checks:', error);
        Sentry.captureException(error);
        throw error;
      }
    },
  );
}

/**
 * AI Coach Scheduled Checks - Runs daily to generate proactive notifications
 * Checks for mid-period milestones, budget warnings, and period ending alerts
 */
export const aiCoachScheduledChecks = functions.scheduler.onSchedule(
  {
    schedule: '0 9 * * *', // Daily at 9:00 AM UTC
    timeZone: 'UTC',
    secrets: [geminiApiKey],
    timeoutSeconds: 540, // 9 minutes
    memory: '512MiB',
  },
  aiCoachScheduledChecksHandler,
);
