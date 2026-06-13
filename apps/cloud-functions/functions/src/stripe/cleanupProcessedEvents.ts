import * as Sentry from '@sentry/node';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';

/**
 * Scheduled function to clean up old processed webhook events.
 * Runs daily to delete events older than 30 days to prevent unbounded growth
 * of the processedWebhookEvents collection.
 *
 * Schedule: Every day at 2:00 AM UTC
 */
export const cleanupProcessedEvents = functions.scheduler.onSchedule(
  {
    schedule: 'every day 02:00',
    timeZone: 'UTC',
  },
  async () => {
    return Sentry.startSpan(
      {
        name: 'cleanupProcessedEvents',
        op: 'function.scheduled',
      },
      async () => {
        try {
          const db = admin.firestore();

          // Calculate cutoff date (30 days ago)
          const cutoffDate = admin.firestore.Timestamp.fromMillis(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          );

          console.log(`Starting cleanup of processed events older than ${cutoffDate.toDate()}`);

          // Query old events (limit to 500 per run to stay within Firestore batch limits)
          const oldEventsSnapshot = await db
            .collection('processedWebhookEvents')
            .where('processedAt', '<', cutoffDate)
            .limit(500)
            .get();

          if (oldEventsSnapshot.empty) {
            console.log('No old events to clean up');
            return;
          }

          // Delete in batches of 500 (Firestore batch write limit)
          const batch = db.batch();
          let deleteCount = 0;

          for (const doc of oldEventsSnapshot.docs) {
            batch.delete(doc.ref);
            deleteCount++;
          }

          await batch.commit();

          console.log(`Successfully deleted ${deleteCount} old processed events`);

          // If we hit the limit, there might be more events to delete
          if (deleteCount === 500) {
            console.log('Hit batch limit, more events may need cleanup on next run');
          }
        } catch (error) {
          console.error('Error cleaning up processed events:', error);
          Sentry.captureException(error);
          throw error;
        }
      },
    );
  },
);
