import admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import type { RateLimit } from '../types';

/**
 * Rate limit constants
 */
export const RATE_LIMITS = {
  maxMessagesPerHour: 30,
  maxMessagesPerDay: 100,
};

/**
 * Check and enforce rate limits for AI Chat
 * @param userId - The user ID to check rate limits for
 * @returns void - Throws HttpsError if rate limit exceeded
 */
export async function checkRateLimit(userId: string): Promise<void> {
  const db = admin.firestore();
  const rateLimitRef = db.collection('rateLimits').doc(userId);
  const now = admin.firestore.Timestamp.now();

  try {
    await db.runTransaction(async (transaction) => {
      const rateLimitDoc = await transaction.get(rateLimitRef);

      if (!rateLimitDoc.exists) {
        // First message ever - create rate limit document
        const newRateLimit: RateLimit = {
          userId,
          hourlyCount: 1,
          dailyCount: 1,
          lastHourReset: now,
          lastDayReset: now,
        };
        transaction.set(rateLimitRef, newRateLimit);
        return;
      }

      const rateLimit = rateLimitDoc.data() as RateLimit;

      // Check if we need to reset hourly counter (1 hour = 3600 seconds)
      const hoursSinceLastReset = (now.seconds - rateLimit.lastHourReset.seconds) / 3600;

      const resetHourly = hoursSinceLastReset >= 1;

      // Check if we need to reset daily counter (1 day = 86400 seconds)
      const daysSinceLastReset = (now.seconds - rateLimit.lastDayReset.seconds) / 86400;

      const resetDaily = daysSinceLastReset >= 1;

      // Calculate new counts
      const newHourlyCount = resetHourly ? 1 : rateLimit.hourlyCount + 1;
      const newDailyCount = resetDaily ? 1 : rateLimit.dailyCount + 1;

      // Check limits BEFORE incrementing
      if (!resetHourly && rateLimit.hourlyCount >= RATE_LIMITS.maxMessagesPerHour) {
        const minutesUntilReset = Math.ceil((1 - hoursSinceLastReset) * 60);
        throw new functions.https.HttpsError(
          'resource-exhausted',
          `Rate limit exceeded. You can send ${RATE_LIMITS.maxMessagesPerHour} messages per hour. Please try again in ${minutesUntilReset} minutes.`,
        );
      }

      if (!resetDaily && rateLimit.dailyCount >= RATE_LIMITS.maxMessagesPerDay) {
        const hoursUntilReset = Math.ceil((1 - daysSinceLastReset) * 24);
        throw new functions.https.HttpsError(
          'resource-exhausted',
          `Daily rate limit exceeded. You can send ${RATE_LIMITS.maxMessagesPerDay} messages per day. Please try again in ${hoursUntilReset} hours.`,
        );
      }

      // Update rate limit
      const updatedRateLimit: RateLimit = {
        userId,
        hourlyCount: newHourlyCount,
        dailyCount: newDailyCount,
        lastHourReset: resetHourly ? now : rateLimit.lastHourReset,
        lastDayReset: resetDaily ? now : rateLimit.lastDayReset,
      };

      transaction.set(rateLimitRef, updatedRateLimit);
    });
  } catch (error) {
    // Re-throw HttpsErrors (rate limit exceeded)
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Log and throw unexpected errors
    console.error('Error checking rate limit:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to check rate limit. Please try again.',
    );
  }
}
