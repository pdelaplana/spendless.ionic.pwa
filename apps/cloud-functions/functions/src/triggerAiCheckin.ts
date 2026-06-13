import * as Sentry from '@sentry/node';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v2';
import { geminiApiKey } from './config/gemini';
import { hasActiveSubscription } from './stripe/helpers';
import type { Account, Job } from './types';

/**
 * Trigger AI Checkin generation for the authenticated user.
 * This function queues a job that will generate AI insights for the user's spending data.
 *
 * Input (optional):
 * - analysisType: 'weekly' | 'period-end' (optional) - Type of analysis. Defaults to 'weekly'.
 * - date: string (optional) - For 'weekly' analysis: end date of the week to analyze (ISO format). Defaults to current date.
 * - periodId: string (required for 'period-end') - Specific period to analyze for period-end analysis.
 *
 * Returns:
 * - success: boolean
 * - message: string
 * - jobId: string (if successful)
 */
export const triggerAiCheckin = functions.https.onCall(
  {
    secrets: [geminiApiKey],
  },
  async (request) => {
    return Sentry.startSpan({ name: 'triggerAiCheckin', op: 'function.https.onCall' }, async () => {
      // Check if user is authenticated
      if (request?.auth === null) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated to use this function.',
        );
      }

      const userId = request.auth?.uid;
      const userEmail = request.auth?.token.email || '';

      if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID is required.');
      }

      try {
        // Get account data
        const db = admin.firestore();
        const accountRef = db.collection('accounts').doc(userId);
        const accountSnapshot = await accountRef.get();

        if (!accountSnapshot.exists) {
          throw new functions.https.HttpsError('not-found', 'Account not found.');
        }

        const account = accountSnapshot.data() as Account;
        // Use document ID (userId) as accountId since they are the same in the accounts collection
        const accountId = userId;

        // Check if user has active premium subscription
        const hasPremium = await hasActiveSubscription(accountId);
        if (!hasPremium) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'AI Checkin is only available for premium subscribers. Please upgrade to access this feature.',
          );
        }

        // Check if AI Checkin is enabled for this account
        if (account.aiCheckinEnabled === false) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'AI Checkin is disabled for your account. Please enable it in settings.',
          );
        }

        // Extract optional parameters
        const { periodId, analysisType, date } = request.data || {};

        // Validate analysisType if provided
        const finalAnalysisType: 'weekly' | 'period-end' = analysisType || 'weekly';
        if (finalAnalysisType !== 'weekly' && finalAnalysisType !== 'period-end') {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Analysis type must be either "weekly" or "period-end".',
          );
        }

        // Validate parameters based on analysis type
        if (finalAnalysisType === 'period-end' && !periodId) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Period ID is required for period-end analysis.',
          );
        }

        // For weekly analysis, use provided date or default to current date
        let analysisDate: string | undefined;
        if (finalAnalysisType === 'weekly') {
          if (date) {
            // Validate date format (ISO string)
            const parsedDate = new Date(date);
            if (Number.isNaN(parsedDate.getTime())) {
              throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid date format. Please provide an ISO date string.',
              );
            }
            analysisDate = date;
          } else {
            // Default to current date
            analysisDate = new Date().toISOString();
          }
        }

        // Create job
        const job: Job & {
          periodId?: string;
          analysisType?: 'weekly' | 'period-end';
          date?: string;
        } = {
          userId,
          userEmail,
          jobType: 'generateAiCheckin',
          status: 'pending',
          priority: 1,
          createdAt: Timestamp.now(),
          completedAt: null,
          errors: [],
          attempts: 0,
          analysisType: finalAnalysisType,
        };

        // Add optional fields only if provided (Firestore doesn't accept undefined values)
        if (periodId) {
          job.periodId = periodId;
        }
        if (analysisDate) {
          job.date = analysisDate;
        }

        // Queue the job
        const jobRef = await db.collection('jobs').add(job);
        const jobId = jobRef.id;

        console.log(`AI Checkin job queued: ${jobId} for user ${userId}`);

        return {
          success: true,
          message: "Your AI Checkin is being generated. You will receive an email when it's ready.",
          jobId,
        };
      } catch (error) {
        Sentry.captureException(error);

        // Re-throw HttpsErrors as-is
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        // Wrap other errors
        throw new functions.https.HttpsError('internal', `Error triggering AI Checkin: ${error}`);
      }
    });
  },
);
