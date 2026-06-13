import * as Sentry from '@sentry/node';
import * as functions from 'firebase-functions/v2';
import { isValidPriceId, stripe, stripeSecretKey } from '../config/stripe';
import type { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse } from '../types';
import { getOrCreateStripeCustomer, hasActiveSubscription } from './helpers';

/**
 * Firebase HTTPS Callable Function to create a Stripe Checkout Session.
 * This allows authenticated users to upgrade to a premium subscription.
 *
 * @param request - Contains priceId, optional successUrl, and optional cancelUrl
 * @returns sessionId and checkout URL
 */
export const createCheckoutSession = functions.https.onCall(
  {
    secrets: [stripeSecretKey],
  },
  async (request): Promise<CreateCheckoutSessionResponse> => {
    return Sentry.startSpan(
      {
        name: 'createCheckoutSession',
        op: 'function.https.callable',
      },
      async () => {
        // Check if user is authenticated
        if (request?.auth === null) {
          throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to create a checkout session.',
          );
        }

        const userId = request.auth?.uid;
        const userEmail = request.auth?.token.email;

        if (!userId || !userEmail) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'User ID and email are required.',
          );
        }

        // Validate request data
        const data = request.data as CreateCheckoutSessionRequest;

        if (!data.priceId) {
          throw new functions.https.HttpsError('invalid-argument', 'Price ID is required.');
        }

        // Validate that the price ID is one of the allowed subscription prices
        if (!isValidPriceId(data.priceId)) {
          throw new functions.https.HttpsError('invalid-argument', 'Invalid price ID.');
        }

        try {
          // Use userId directly as accountId (they are the same)
          const accountId = userId;
          console.log('Creating checkout session for account:', accountId, userEmail);

          // Check if user already has an active subscription
          const hasActive = await hasActiveSubscription(accountId);
          if (hasActive) {
            throw new functions.https.HttpsError(
              'already-exists',
              'User already has an active subscription. Please manage your existing subscription instead.',
            );
          }

          // Get or create Stripe customer
          const customer = await getOrCreateStripeCustomer(accountId, userId, userEmail);

          // Default URLs if not provided
          const successUrl =
            data.successUrl ||
            `${process.env.FRONTEND_URL || 'http://localhost:8100'}/success?session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl =
            data.cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:8100'}/pricing`;

          // Create Stripe Checkout session
          const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
              {
                price: data.priceId,
                quantity: 1,
              },
            ],
            allow_promotion_codes: true,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
              accountId,
              userId,
            },
            subscription_data: {
              metadata: {
                accountId,
                userId,
              },
            },
          });

          if (!session.id || !session.url) {
            throw new functions.https.HttpsError('internal', 'Failed to create checkout session.');
          }

          return {
            sessionId: session.id,
            url: session.url,
          };
        } catch (error) {
          // Re-throw HttpsErrors as-is
          if (error instanceof functions.https.HttpsError) {
            throw error;
          }

          // Log other errors to Sentry and throw as internal error
          Sentry.captureException(error);
          console.error('Error creating checkout session:', error);
          throw new functions.https.HttpsError(
            'internal',
            'An error occurred while creating the checkout session. Please try again later.',
          );
        }
      },
    );
  },
);
