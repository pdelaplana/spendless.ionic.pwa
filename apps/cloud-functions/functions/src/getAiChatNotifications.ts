import * as Sentry from '@sentry/node';
import admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import type {
  AiChatNotification,
  GetAiChatNotificationsRequest,
  GetAiChatNotificationsResponse,
} from './types';

/**
 * Get AI Chat Notifications - Retrieves unread notifications for the user
 * Marks notifications as read when retrieved
 */
export const getAiChatNotifications = functions.https.onCall<
  GetAiChatNotificationsRequest,
  Promise<GetAiChatNotificationsResponse>
>(async (request): Promise<GetAiChatNotificationsResponse> => {
  return Sentry.startSpan(
    { name: 'getAiChatNotifications', op: 'function.https.onCall' },
    async () => {
      // 1. Authenticate user
      if (request?.auth === null) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated to view notifications.',
        );
      }

      const userId = request.auth?.uid;

      if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID is required.');
      }

      // 2. Validate request data
      const data = (request.data as GetAiChatNotificationsRequest) || {};
      const limit = data.limit || 50; // Default to 50 notifications

      if (limit > 100) {
        throw new functions.https.HttpsError('invalid-argument', 'Limit cannot exceed 100.');
      }

      // 3. Query notifications
      const db = admin.firestore();
      const notificationsRef = db
        .collection('accounts')
        .doc(userId)
        .collection('aiChatNotifications');

      const notificationsSnapshot = await notificationsRef
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      if (notificationsSnapshot.empty) {
        return { notifications: [] };
      }

      // 4. Convert to AiChatNotification format and mark as read
      const notifications: AiChatNotification[] = [];
      const batch = db.batch();
      const now = admin.firestore.Timestamp.now();

      for (const doc of notificationsSnapshot.docs) {
        const data = doc.data();
        const notification: AiChatNotification = {
          id: doc.id,
          userId: data.userId,
          accountId: data.accountId,
          periodId: data.periodId,
          periodName: data.periodName,
          content: data.content,
          checkInType: data.checkInType,
          createdAt: data.createdAt,
          readAt: data.readAt,
          isRead: data.isRead || false,
          tokensUsed: data.tokensUsed || 0,
          aiModel: data.aiModel || 'gemini-2.5-flash',
        };

        notifications.push(notification);

        // Mark as read if not already read
        if (!data.isRead) {
          batch.update(doc.ref, {
            isRead: true,
            readAt: now,
          });
        }
      }

      // 5. Commit batch update
      try {
        await batch.commit();
      } catch (error) {
        // Log error but don't fail the request if marking as read fails
        console.error('Error marking notifications as read:', error);
        Sentry.captureException(error);
      }

      // 6. Return notifications
      return { notifications };
    },
  );
});
