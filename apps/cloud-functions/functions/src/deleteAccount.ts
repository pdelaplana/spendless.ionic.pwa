import * as functions from 'firebase-functions/v2';

import { deleteAccount as deleteAccountJob } from './jobs/deleteAccount';

// Firebase Function to delete an account and all associated data
export const deleteAccount = functions.https.onCall(async (request) => {
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

  return deleteAccountJob({ userId, userEmail });
});
