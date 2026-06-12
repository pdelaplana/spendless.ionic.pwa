import path from 'node:path';
import Sentry from '@sentry/node';
import admin from 'firebase-admin';
import {
  type HistoricalDataForAi,
  type PeriodInfoForAi,
  type SpendingDataForAi,
  generateAiInsights,
} from '../helpers/aiInsights';
import { convertMarkdownToHtml, replaceTemplateVariables } from '../helpers/emailMarkdown';
import { sendEmailNotification } from '../helpers/sendEmail';
import { extractFirstName } from '../helpers/userHelpers';
import { hasActiveSubscription } from '../stripe/helpers';
import type { Account, AiInsight } from '../types';

/**
 * Load and process email template for AI Checkin
 */
async function loadAiCheckinEmailTemplate(
  insights: string,
  periodName: string,
  userName: string,
): Promise<{ subject: string; html: string }> {
  try {
    const fs = await import('node:fs/promises');
    const templatePath = path.join(__dirname, 'templates', 'emails', 'ai-checkin.md');
    const template = await fs.readFile(templatePath, 'utf-8');

    // Simple template processing - split by ## headers
    const sections = template.split('##').filter((s) => s.trim());

    let subject = '';
    let body = '';

    for (const section of sections) {
      const lines = section.trim().split('\n');
      const header = lines[0].trim();

      if (header.toLowerCase().includes('subject')) {
        subject = lines.slice(1).join('\n').trim();
      } else if (header.toLowerCase().includes('body')) {
        body = lines.slice(1).join('\n').trim();
      }
    }

    // Replace variables using shared helper
    const variables = {
      periodName,
      userName,
      insights,
    };

    subject = replaceTemplateVariables(subject, variables);
    body = replaceTemplateVariables(body, variables);

    // Convert markdown to HTML using shared helper
    const html = await convertMarkdownToHtml(body);

    return { subject, html };
  } catch (_error) {
    // Fallback if template doesn't exist
    console.warn('AI checkin email template not found, using fallback');
    return {
      subject: `Check in with your spending for ${periodName}`,
      html: await convertMarkdownToHtml(`

Hi ${userName},

Here are some insights about your spending for ${periodName}:

${insights}

Keep up the great work managing your spending!
      `),
    };
  }
}

/**
 * Generate AI Checkin for a user
 * This job fetches spending data, analyzes it with AI, stores insights, and sends an email
 *
 * @param userId - User ID
 * @param userEmail - User email
 * @param analysisType - Type of analysis ('weekly' or 'period-end')
 * @param date - For weekly analysis: end date of the week to analyze (ISO string)
 * @param periodId - For period-end analysis: ID of the period to analyze
 */
export const generateAiCheckin = async ({
  userId,
  userEmail,
  periodId,
  analysisType,
  date,
}: {
  userId: string;
  userEmail: string;
  periodId?: string;
  analysisType?: 'weekly' | 'period-end';
  date?: string;
}) => {
  return Sentry.startSpan(
    { name: 'generateAiCheckin', op: 'function.job.generateAiCheckin' },
    async () => {
      if (!userId) {
        throw new Error('User ID is required.');
      }

      try {
        const db = admin.firestore();
        const accountRef = db.collection('accounts').doc(userId);

        // Get account data
        const accountSnapshot = await accountRef.get();
        if (!accountSnapshot.exists) {
          throw new Error(`Account with ID ${userId} not found.`);
        }

        const account = accountSnapshot.data() as Account;
        // Use document ID (userId) as accountId since they are the same in the accounts collection
        const accountId = userId;

        // Check if user has active premium subscription
        const hasPremium = await hasActiveSubscription(accountId);
        if (!hasPremium) {
          throw new Error('AI Checkin is only available for premium subscribers.');
        }

        // Check if AI Checkin is enabled for this account
        if (account.aiCheckinEnabled === false) {
          throw new Error('AI Checkin is disabled for this account.');
        }

        // Determine analysis type
        const finalAnalysisType: 'weekly' | 'period-end' = analysisType || 'weekly';

        // Get periods for context
        const periodsSnapshot = await accountRef
          .collection('periods')
          .orderBy('startAt', 'desc')
          .get();
        const periods = periodsSnapshot.docs;

        if (periods.length === 0) {
          throw new Error('No periods found for this account.');
        }

        // Variables to be set based on analysis type
        let spendingSnapshot: FirebaseFirestore.QuerySnapshot;
        let periodName: string;
        let analyzedPeriodId: string;
        let periodStartDate: Date;
        let periodEndDate: Date;
        let targetSpend: number | undefined;
        let targetSavings: number | undefined;
        let goals: string | undefined;

        if (finalAnalysisType === 'weekly') {
          // WEEKLY ANALYSIS: Analyze spending from the last 7 days

          // Get the analysis date (end of week)
          const endDate = date ? new Date(date) : new Date();

          // Calculate start date (7 days before end date)
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 7);

          // Format period name as "Week of [start] - [end]"
          const formatDate = (d: Date) => {
            const month = d.toLocaleDateString('en-US', { month: 'short' });
            const day = d.getDate();
            return `${month} ${day}`;
          };
          periodName = `Week of ${formatDate(startDate)} - ${formatDate(endDate)}`;

          // Query spending by date range (not by periodId)
          const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
          const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

          spendingSnapshot = await accountRef
            .collection('spending')
            .where('date', '>=', startTimestamp)
            .where('date', '<=', endTimestamp)
            .orderBy('date', 'desc')
            .get();

          // Use most recent period for context (goals, targets, etc.)
          const contextPeriod = periods[0];
          const contextPeriodData = contextPeriod.data();
          analyzedPeriodId = contextPeriod.id;
          periodStartDate = startDate;
          periodEndDate = endDate;
          targetSpend = contextPeriodData.targetSpend;
          targetSavings = contextPeriodData.targetSavings;
          goals = contextPeriodData.goals;
        } else {
          // PERIOD-END ANALYSIS: Analyze all spending for a specific period

          if (!periodId) {
            throw new Error('Period ID is required for period-end analysis.');
          }

          // Find the specific period
          const found = periods.find((p) => p.id === periodId);
          if (!found) {
            throw new Error(`Period ${periodId} not found.`);
          }

          const periodData = found.data();
          analyzedPeriodId = found.id;
          periodName = periodData.name;
          periodStartDate = periodData.startAt.toDate();
          periodEndDate = periodData.endAt.toDate();
          targetSpend = periodData.targetSpend;
          targetSavings = periodData.targetSavings;
          goals = periodData.goals;

          // Query all spending for this period
          spendingSnapshot = await accountRef
            .collection('spending')
            .where('periodId', '==', periodId)
            .orderBy('date', 'desc')
            .get();
        }

        if (spendingSnapshot.empty) {
          throw new Error('No spending data found for the analysis period.');
        }

        // Format spending data for AI
        const spendingData: SpendingDataForAi[] = spendingSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            date: data.date.toDate(),
            amount: data.amount,
            description: data.description,
            category: data.category,
            notes: data.notes,
            tags: data.tags || [],
            recurring: data.recurring || false,
          };
        });

        // Prepare period info
        const periodInfo: PeriodInfoForAi = {
          name: periodName,
          startDate: periodStartDate,
          endDate: periodEndDate,
          targetSpend,
          targetSavings,
          goals,
        };

        // Get historical data for comparison
        let historicalData: HistoricalDataForAi | undefined;

        if (finalAnalysisType === 'weekly') {
          // WEEKLY: Compare with the previous week (7 days before the analyzed week)
          const prevWeekEndDate = new Date(periodStartDate);
          prevWeekEndDate.setDate(prevWeekEndDate.getDate() - 1); // Day before the analyzed week starts

          const prevWeekStartDate = new Date(prevWeekEndDate);
          prevWeekStartDate.setDate(prevWeekStartDate.getDate() - 6); // 7 days total (inclusive)

          const prevWeekStartTimestamp = admin.firestore.Timestamp.fromDate(prevWeekStartDate);
          const prevWeekEndTimestamp = admin.firestore.Timestamp.fromDate(prevWeekEndDate);

          const prevWeekSpendingSnapshot = await accountRef
            .collection('spending')
            .where('date', '>=', prevWeekStartTimestamp)
            .where('date', '<=', prevWeekEndTimestamp)
            .get();

          if (!prevWeekSpendingSnapshot.empty) {
            const prevSpending = prevWeekSpendingSnapshot.docs.map((doc) => doc.data());
            const prevTotal = prevSpending.reduce((sum, s) => sum + s.amount, 0);

            // Calculate top categories
            const categoryTotals = prevSpending.reduce(
              (acc, s) => {
                acc[s.category] = (acc[s.category] || 0) + s.amount;
                return acc;
              },
              {} as Record<string, number>,
            );
            const topCategories = Object.entries(categoryTotals)
              .map(([category, amount]) => ({ category, amount }))
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5);

            // Calculate top tags
            const tagTotals = prevSpending.reduce(
              (acc, s) => {
                if (s.tags && Array.isArray(s.tags)) {
                  for (const tag of s.tags) {
                    acc[tag] = (acc[tag] || 0) + s.amount;
                  }
                }
                return acc;
              },
              {} as Record<string, number>,
            );
            const topTags = Object.entries(tagTotals)
              .map(([tag, amount]) => ({ tag, amount }))
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5);

            historicalData = {
              totalSpending: prevTotal,
              transactionCount: prevSpending.length,
              topCategories,
              topTags,
            };
          }
        } else {
          // PERIOD-END: Compare with the previous period
          if (periods.length > 1) {
            const previousPeriod = periods[1];
            const prevSpendingSnapshot = await accountRef
              .collection('spending')
              .where('periodId', '==', previousPeriod.id)
              .get();

            if (!prevSpendingSnapshot.empty) {
              const prevSpending = prevSpendingSnapshot.docs.map((doc) => doc.data());
              const prevTotal = prevSpending.reduce((sum, s) => sum + s.amount, 0);

              // Calculate top categories
              const categoryTotals = prevSpending.reduce(
                (acc, s) => {
                  acc[s.category] = (acc[s.category] || 0) + s.amount;
                  return acc;
                },
                {} as Record<string, number>,
              );
              const topCategories = Object.entries(categoryTotals)
                .map(([category, amount]) => ({ category, amount }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);

              // Calculate top tags
              const tagTotals = prevSpending.reduce(
                (acc, s) => {
                  if (s.tags && Array.isArray(s.tags)) {
                    for (const tag of s.tags) {
                      acc[tag] = (acc[tag] || 0) + s.amount;
                    }
                  }
                  return acc;
                },
                {} as Record<string, number>,
              );
              const topTags = Object.entries(tagTotals)
                .map(([tag, amount]) => ({ tag, amount }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);

              historicalData = {
                totalSpending: prevTotal,
                transactionCount: prevSpending.length,
                topCategories,
                topTags,
              };
            }
          }
        }

        // Get user's display name for personalization
        const user = await admin.auth().getUser(userId);
        const userFirstName = extractFirstName(user.displayName);

        // Generate AI insights
        console.log('Generating AI insights for user', userId);
        const { insights, formattedInsights, keyTakeaway, tokensUsed } = await generateAiInsights(
          spendingData,
          periodInfo,
          historicalData,
          account.currency || 'USD',
          finalAnalysisType,
          userFirstName,
        );

        // Calculate metadata
        const totalSpending = spendingData.reduce((sum, s) => sum + s.amount, 0);
        const categoriesAnalyzed = [...new Set(spendingData.map((s) => s.category))];
        const tagsAnalyzed = [...new Set(spendingData.flatMap((s) => s.tags || []))];

        // Create AI Insight document
        const insightData: Omit<AiInsight, 'id'> = {
          userId,
          accountId,
          periodId: analyzedPeriodId,
          periodName,
          periodStartDate: admin.firestore.Timestamp.fromDate(periodStartDate),
          periodEndDate: admin.firestore.Timestamp.fromDate(periodEndDate),
          analysisType: finalAnalysisType,
          totalSpendingAnalyzed: totalSpending,
          transactionCount: spendingData.length,
          categoriesAnalyzed,
          tagsAnalyzed,
          insights,
          formattedInsights,
          keyTakeaway, // Store key takeaway for messaging/notification system
          generatedAt: admin.firestore.Timestamp.now(),
          emailStatus: 'pending',
          aiModel: 'gemini-2.5-flash',
          tokensUsed,
        };

        // Store in Firestore
        const insightRef = await accountRef.collection('aiInsights').add(insightData);
        console.log('AI insight stored with ID:', insightRef.id);

        // Send email
        try {
          // Use the display name we already fetched
          const userName = user.displayName || 'Hey there';

          const { subject, html } = await loadAiCheckinEmailTemplate(
            formattedInsights,
            periodName,
            userName,
          );

          await sendEmailNotification({
            from: '"Spendless AI Insights" <no-reply@getspendless.com>',
            to: userEmail,
            subject,
            html,
          });

          // Update email status
          await insightRef.update({
            emailStatus: 'sent',
            emailSentAt: admin.firestore.Timestamp.now(),
          });

          console.log('AI checkin email sent to', userEmail);
        } catch (emailError) {
          // Log but don't fail the job if email fails
          console.error('Failed to send AI checkin email:', emailError);
          Sentry.captureException(emailError);

          await insightRef.update({
            emailStatus: 'failed',
          });
        }

        // Update lastAiCheckinAt in account
        await accountRef.update({
          lastAiCheckinAt: admin.firestore.Timestamp.now(),
        });

        return {
          success: true,
          message: `AI Checkin generated successfully for ${userEmail}.`,
          insightId: insightRef.id,
        };
      } catch (error) {
        Sentry.captureException(error);
        console.error('Error generating AI checkin:', error);
        return {
          success: false,
          message: `${error}`,
        };
      }
    },
  );
};
