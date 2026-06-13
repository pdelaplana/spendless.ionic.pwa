import * as Sentry from '@sentry/node';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { stripe, stripeSecretKey } from '../config/stripe';
import type {
  Account,
  CreateCustomerPortalSessionRequest,
  CreateCustomerPortalSessionResponse,
} from '../types';

/**
 * Firebase HTTPS Callable Function to create a Stripe Customer Portal Session.
 * This allows authenticated users to manage their existing subscription
 * (update payment method, cancel subscription, view invoices, etc.).
 *
 * @param request - Contains optional returnUrl
 * @returns Customer Portal URL
 */
export const createCustomerPortalSession = functions.https.onCall(
  {
    secrets: [stripeSecretKey],
  },
  async (request): Promise<CreateCustomerPortalSessionResponse> => {
    return Sentry.startSpan(
      {
        name: 'createCustomerPortalSession',
        op: 'function.https.callable',
      },
      async () => {
        // Check if user is authenticated
        if (request?.auth === null) {
          throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to access the customer portal.',
          );
        }

        const userId = request.auth?.uid;

        if (!userId) {
          throw new functions.https.HttpsError('invalid-argument', 'User ID is required.');
        }

        try {
          // Use userId directly as accountId (they are the same)
          const accountId = userId;

          // Get the account document to retrieve the Stripe customer ID
          const db = admin.firestore();
          const accountDoc = await db.collection('accounts').doc(accountId).get();

          if (!accountDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Account not found.');
          }

          const accountData = accountDoc.data() as Account;

          // Check if account has a Stripe customer ID
          if (!accountData.stripeCustomerId) {
            throw new functions.https.HttpsError(
              'failed-precondition',
              'No Stripe customer found. Please create a subscription first.',
            );
          }

          // Get request data
          const data = (request.data as CreateCustomerPortalSessionRequest) || {};

          // Default return URL if not provided
          const returnUrl =
            data.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:8100'}/settings`;

          // Create Stripe Customer Portal session
          const session = await stripe.billingPortal.sessions.create({
            customer: accountData.stripeCustomerId,
            return_url: returnUrl,
          });

          if (!session.url) {
            throw new functions.https.HttpsError(
              'internal',
              'Failed to create customer portal session.',
            );
          }

          return {
            url: session.url,
          };
        } catch (error) {
          // Re-throw HttpsErrors as-is
          if (error instanceof functions.https.HttpsError) {
            throw error;
          }

          // Log other errors to Sentry and throw as internal error
          Sentry.captureException(error);
          console.error('Error creating customer portal session:', error);
          throw new functions.https.HttpsError(
            'internal',
            'An error occurred while creating the customer portal session. Please try again later.',
          );
        }
      },
    );
  },
);
