import * as Sentry from '@sentry/node';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { geminiApiKey } from '../config/gemini';
import type { Account, Job } from '../types';

/**
 * Firestore trigger that generates AI Check-ins when a period ends.
 * Triggers when a period document is updated and detects period closure.
 *
 * Trigger: Firestore onDocumentUpdated for accounts/{userId}/periods/{periodId}
 */
export const periodEndAiCheckin = onDocumentUpdated(
  {
    document: 'accounts/{userId}/periods/{periodId}',
    secrets: [geminiApiKey],
  },
  async (event) => {
    return Sentry.startSpan(
      {
        name: 'periodEndAiCheckin',
        op: 'function.firestore.onDocumentUpdated',
      },
      async () => {
        const userId = event.params.userId;
        const periodId = event.params.periodId;

        const beforeData = event.data?.before.data();
        const afterData = event.data?.after.data();

        console.log(`Period update detected for user ${userId}, period ${periodId}`);

        try {
          // Check if period has ended (closedAt was set or endAt has passed)
          const beforeClosedAt = beforeData?.closedAt;
          const afterClosedAt = afterData?.closedAt;
          const afterEndAt = afterData?.endAt;

          // Period is considered ended if:
          // 1. closedAt was just set (went from null/undefined to a value)
          // 2. Or endAt is in the past
          const periodJustClosed = !beforeClosedAt && afterClosedAt;
          const periodEnded = afterEndAt && afterEndAt.toMillis() < Date.now();

          if (!periodJustClosed && !periodEnded) {
            console.log('Period has not ended yet. Skipping AI checkin.');
            return null;
          }

          console.log('Period has ended. Checking if user is eligible for AI checkin...');

          // Get account data
          const db = admin.firestore();
          const accountRef = db.collection('accounts').doc(userId);
          const accountSnapshot = await accountRef.get();

          if (!accountSnapshot.exists) {
            console.warn(`Account ${userId} not found. Skipping AI checkin.`);
            return null;
          }

          const account = accountSnapshot.data() as Account;

          // Check if user is eligible for period-end AI checkins
          const isPremium = account.subscriptionTier === 'premium';
          const isEnabled = account.aiCheckinEnabled === true;

          if (!isPremium) {
            console.log(`User ${userId} is not premium. Skipping AI checkin.`);
            return null;
          }

          if (!isEnabled) {
            console.log(`AI checkin is disabled for user ${userId}. Skipping.`);
            return null;
          }

          // User is eligible! Queue an AI checkin job
          console.log(`Queueing period-end AI checkin for user ${userId}, period ${periodId}`);

          // Get user email from Firebase Auth
          let userEmail = '';
          try {
            const userRecord = await admin.auth().getUser(userId);
            userEmail = userRecord.email || `user-${userId}@spendless.app`;
          } catch (authError) {
            console.warn(`Could not fetch email for user ${userId}:`, authError);
            userEmail = `user-${userId}@spendless.app`;
          }

          // Create job
          const job: Job = {
            userId,
            userEmail,
            jobType: 'generateAiCheckin',
            status: 'pending',
            priority: 1,
            createdAt: Timestamp.now(),
            completedAt: null,
            errors: [],
            attempts: 0,
            // Task-specific data
            periodId,
            analysisType: 'period-end',
          } as Job & { periodId: string; analysisType: 'period-end' };

          // Queue the job
          const jobRef = await db.collection('jobs').add(job);

          console.log(
            `Period-end AI checkin job ${jobRef.id} queued for user ${userId}, period ${periodId}`,
          );

          return null;
        } catch (error) {
          // Log error but don't throw - this is a background trigger
          console.error(`Error in period-end AI checkin trigger for user ${userId}:`, error);
          Sentry.captureException(error, {
            extra: {
              userId,
              periodId,
              operation: 'periodEndAiCheckin',
            },
          });

          return null;
        }
      },
    );
  },
);
