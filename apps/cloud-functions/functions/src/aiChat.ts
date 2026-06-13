import * as Sentry from '@sentry/node';
import admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { geminiApiKey, getGeminiModel } from './config/gemini';
import {
  calculateCategoryBreakdown,
  calculateTagAnalysis,
  getCurrentActivePeriod,
  getSpendingDataForPeriod,
  selectContextForMessage,
} from './helpers/aiChatContext';
import { buildAiChatPrompt } from './helpers/aiChatPrompt';
import type { PeriodInfoForAi, SpendingDataForAi } from './helpers/aiInsights';
import { checkRateLimit } from './helpers/rateLimit';
import { extractFirstName } from './helpers/userHelpers';
import { hasActiveSubscription } from './stripe/helpers';
import type { Account, AiChatRequest, AiChatResponse } from './types';

/**
 * AI Chat - Main conversational AI financial coach function
 * Provides real-time responses to user questions about their spending
 */
export const aiChat = functions.https.onCall<AiChatRequest, Promise<AiChatResponse>>(
  {
    secrets: [geminiApiKey],
  },
  async (request): Promise<AiChatResponse> => {
    return Sentry.startSpan({ name: 'aiChat', op: 'function.https.onCall' }, async () => {
      // 1. Authenticate user
      if (request?.auth === null) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated to use AI Chat.',
        );
      }

      const userId = request.auth?.uid;

      if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID is required.');
      }

      // 2. Validate request data
      const data = request.data as AiChatRequest;
      const { message, periodId, sessionHistory = [] } = data;

      if (!message || typeof message !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Message is required.');
      }

      if (message.length > 1000) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Message must be 1000 characters or less.',
        );
      }

      // Validate session history format
      if (sessionHistory && !Array.isArray(sessionHistory)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Session history must be an array.',
        );
      }

      // Limit session history to last 10 messages
      const limitedHistory = sessionHistory.slice(-10);

      // 3. Get account data
      const db = admin.firestore();
      const accountRef = db.collection('accounts').doc(userId);
      const accountSnapshot = await accountRef.get();

      if (!accountSnapshot.exists) {
        throw new functions.https.HttpsError('not-found', 'Account not found.');
      }

      // Get user's display name for personalization
      const user = await admin.auth().getUser(userId);
      const userName = extractFirstName(user.displayName);

      const account = accountSnapshot.data() as Account;

      // 4. Validate premium subscription
      const hasPremium = await hasActiveSubscription(userId);
      if (!hasPremium) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'AI Chat is only available for premium subscribers. Upgrade to premium to chat with your AI financial coach!',
        );
      }

      // 5. Check aiChatEnabled flag
      if (!account.aiChatEnabled) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'AI Chat is not enabled for your account. Please enable it in your settings.',
        );
      }

      // 6. Check rate limits
      await checkRateLimit(userId);

      // 7. Get current period or use provided periodId
      let currentPeriodId: string;
      let periodData: PeriodInfoForAi;

      if (periodId) {
        // Use provided period
        currentPeriodId = periodId;
        const periodRef = accountRef.collection('periods').doc(periodId);
        const periodSnapshot = await periodRef.get();

        if (!periodSnapshot.exists) {
          throw new functions.https.HttpsError('not-found', 'Period not found.');
        }

        const period = periodSnapshot.data();
        periodData = {
          name: period?.name || 'Period',
          startDate: period?.startAt?.toDate(),
          endDate: period?.endAt?.toDate(),
          targetSpend: period?.targetSpend,
          targetSavings: period?.targetSavings,
          goals: period?.goals,
        };
      } else {
        // Get current active period
        const currentPeriod = await getCurrentActivePeriod(userId);

        if (!currentPeriod) {
          throw new functions.https.HttpsError(
            'not-found',
            'No active spending period found. Please create a period first.',
          );
        }

        currentPeriodId = currentPeriod.periodId;
        periodData = currentPeriod.periodData;
      }

      // 8. Smart context selection based on message
      const context = selectContextForMessage(message);

      // 9. Fetch spending data if needed
      let spendingData: SpendingDataForAi[] | undefined;
      let categoryBreakdown: Array<{ category: string; amount: number; count: number }> | undefined;
      let tagAnalysis: Array<{ tag: string; amount: number; count: number }> | undefined;

      if (context.includeRecentSpending) {
        spendingData = await getSpendingDataForPeriod(
          userId,
          currentPeriodId,
          context.spendingLimit,
        );
      }

      // Always get summary data for better responses
      const allSpending = await getSpendingDataForPeriod(userId, currentPeriodId);

      if (context.includeCategoryBreakdown || allSpending.length > 0) {
        categoryBreakdown = calculateCategoryBreakdown(allSpending);
      }

      if (context.includeTagAnalysis) {
        tagAnalysis = calculateTagAnalysis(allSpending);
      }

      // 10. Build AI prompt
      const prompt = buildAiChatPrompt(
        message,
        userName,
        periodData,
        limitedHistory,
        spendingData,
        categoryBreakdown,
        tagAnalysis,
        account.currency,
      );

      // 11. Call Gemini API
      try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text();

        // Get token usage
        const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

        // 12. Return response (no storage - session-based)
        return {
          response: responseText,
          tokensUsed,
        };
      } catch (error) {
        Sentry.captureException(error);
        console.error('Error calling Gemini API:', error);

        throw new functions.https.HttpsError(
          'internal',
          'Failed to generate AI response. Please try again.',
        );
      }
    });
  },
);
