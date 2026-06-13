import * as Sentry from '@sentry/node';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import type Stripe from 'stripe';
import { getWebhookSecret, stripe, stripeSecretKey, stripeWebhookSecret } from '../config/stripe';
import type { Account } from '../types';

/**
 * Firebase HTTP Function to handle Stripe webhook events.
 * This endpoint processes subscription lifecycle events and updates Firestore accordingly.
 *
 * IMPORTANT: This endpoint must be configured in Stripe Dashboard as a webhook endpoint.
 * The webhook URL will be: https://us-central1-<project-id>.cloudfunctions.net/handleStripeWebhook
 *
 * Events handled:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export const handleStripeWebhook = functions.https.onRequest(
  {
    secrets: [stripeSecretKey, stripeWebhookSecret],
  },
  async (request, response) => {
    return Sentry.startSpan(
      {
        name: 'handleStripeWebhook',
        op: 'function.https.request',
      },
      async () => {
        // Only accept POST requests
        if (request.method !== 'POST') {
          response.status(405).send('Method Not Allowed');
          return;
        }

        const sig = request.headers['stripe-signature'];

        if (!sig) {
          console.error('Missing Stripe signature header');
          response.status(400).send('Missing Stripe signature');
          return;
        }

        let event: Stripe.Event;

        try {
          // Verify webhook signature using the raw body
          const webhookSecret = getWebhookSecret();
          event = stripe.webhooks.constructEvent(request.rawBody, sig, webhookSecret);
        } catch (error) {
          console.error('Webhook signature verification failed:', error);
          Sentry.captureException(error);
          response
            .status(400)
            .send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }

        // Log the event for debugging
        console.log(`Received webhook event: ${event.type}`, { eventId: event.id });

        try {
          // Route event to appropriate handler
          switch (event.type) {
            case 'customer.subscription.created':
              await handleSubscriptionCreated(event);
              break;

            case 'customer.subscription.updated':
              await handleSubscriptionUpdated(event);
              break;

            case 'customer.subscription.deleted':
              await handleSubscriptionDeleted(event);
              break;

            case 'invoice.payment_succeeded':
              await handlePaymentSucceeded(event);
              break;

            case 'invoice.payment_failed':
              await handlePaymentFailed(event);
              break;

            default:
              console.log(`Unhandled event type: ${event.type}`);
          }

          // Acknowledge receipt of the event
          response.status(200).json({ received: true });
        } catch (error) {
          console.error('Error processing webhook event:', error);
          Sentry.captureException(error);
          // Still return 200 to prevent Stripe from retrying
          // (we've already logged the error to Sentry for investigation)
          response
            .status(200)
            .json({ received: true, error: 'Processing failed but acknowledged' });
        }
      },
    );
  },
);

/**
 * Handle customer.subscription.created event.
 * This is fired when a new subscription is created.
 */
async function handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const webhookSubscription = event.data.object as Stripe.Subscription;
  console.log(`Processing subscription created: ${webhookSubscription.id}`);

  try {
    const customerId = webhookSubscription.customer as string;
    const db = admin.firestore();

    // Quick check if event already processed (outside transaction for performance)
    const processedEventRef = db.collection('processedWebhookEvents').doc(event.id);
    const processedEventDoc = await processedEventRef.get();

    if (processedEventDoc.exists) {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Fetch fresh subscription data from Stripe API to ensure all fields are populated
    const subscription = await stripe.subscriptions.retrieve(webhookSubscription.id);

    console.log('Subscription details from API:', {
      id: subscription.id,
      customer: subscription.customer,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      created: subscription.created,
      eventId: event.id,
    });

    // Find account by stripeCustomerId
    const accountsSnapshot = await db
      .collection('accounts')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      console.warn(`No account found for Stripe customer ${customerId}`);
      return;
    }

    const accountDoc = accountsSnapshot.docs[0];
    const accountId = accountDoc.id;

    // Process in transaction for atomicity
    await db.runTransaction(async (transaction) => {
      // Re-read account in transaction
      const currentAccountDoc = await transaction.get(accountDoc.ref);
      const accountData = currentAccountDoc.data() as Account;

      // Double-check if event was processed by another concurrent function
      const processedCheck = await transaction.get(processedEventRef);
      if (processedCheck.exists) {
        console.log(`Event ${event.id} was processed by concurrent function, skipping`);
        return;
      }

      // Check event ordering - only process if this event is newer
      if (
        accountData.stripeSubscriptionLastEvent &&
        event.created <= accountData.stripeSubscriptionLastEvent
      ) {
        console.log(
          `Discarding older subscription.created event (${event.created} <= ${accountData.stripeSubscriptionLastEvent})`,
        );
        // Still mark as processed to prevent reprocessing
        transaction.set(processedEventRef, {
          eventId: event.id,
          eventType: event.type,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }

      // Determine tier and expiration based on status
      let subscriptionTier: 'premium' | 'essentials' = 'essentials';
      let expiresAt: admin.firestore.Timestamp | null = null;

      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Active or trialing subscriptions get premium access
        subscriptionTier = 'premium';

        if (subscription.current_period_end) {
          expiresAt = admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000);
          console.log('Set expiresAt from current_period_end:', {
            current_period_end: subscription.current_period_end,
            expiresAt: expiresAt.toDate().toISOString(),
            subscriptionId: subscription.id,
          });
        } else {
          console.error(
            '[CRITICAL] current_period_end is undefined for active/trialing subscription',
            {
              subscriptionId: subscription.id,
              status: subscription.status,
              apiVersion: '2025-02-24.acacia',
            },
          );
          Sentry.captureMessage('Subscription missing current_period_end', {
            level: 'error',
            extra: {
              subscriptionId: subscription.id,
              status: subscription.status,
            },
          });
        }
      } else if (subscription.status === 'past_due') {
        // Keep premium access during payment retry period
        subscriptionTier = 'premium';

        if (subscription.current_period_end) {
          expiresAt = admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000);
          console.log('Keeping premium access for past_due subscription:', {
            current_period_end: subscription.current_period_end,
            expiresAt: expiresAt.toDate().toISOString(),
            subscriptionId: subscription.id,
          });
        }
      } else if (
        subscription.status === 'canceled' ||
        subscription.status === 'unpaid' ||
        subscription.status === 'incomplete_expired'
      ) {
        // Downgrade to essentials for canceled/failed subscriptions
        subscriptionTier = 'essentials';
        expiresAt = null;
        console.log('Downgrading to essentials due to status:', {
          status: subscription.status,
          subscriptionId: subscription.id,
        });
      }

      console.log('Final values before update:', {
        accountId,
        subscriptionTier,
        expiresAt: expiresAt ? expiresAt.toDate().toISOString() : null,
      });

      // Atomically update account
      transaction.update(accountDoc.ref, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscription.status,
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        subscriptionCancelled:
          subscription.cancel_at_period_end || subscription.status === 'canceled',
        stripeSubscriptionLastEvent: event.created,
        subscriptionTier,
        expiresAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark event as processed
      transaction.set(processedEventRef, {
        eventId: event.id,
        eventType: event.type,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Successfully processed subscription.created for account ${accountId}: tier=${subscriptionTier}, status=${subscription.status}, expiresAt=${expiresAt ? expiresAt.toDate().toISOString() : null}`,
      );
    });

    // Note: Premium subscription email will be sent automatically by the Firestore trigger
    // when the subscriptionTier field is updated to 'premium'
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event.
 * This is fired when a subscription is modified (e.g., plan change, status change).
 */
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const webhookSubscription = event.data.object as Stripe.Subscription;
  console.log(`Processing subscription updated: ${webhookSubscription.id}`);

  try {
    const customerId = webhookSubscription.customer as string;
    const db = admin.firestore();

    // Quick check if event already processed (outside transaction for performance)
    const processedEventRef = db.collection('processedWebhookEvents').doc(event.id);
    const processedEventDoc = await processedEventRef.get();

    if (processedEventDoc.exists) {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Fetch fresh subscription data from Stripe API to ensure all fields are populated
    const subscription = await stripe.subscriptions.retrieve(webhookSubscription.id);

    console.log('Subscription details from API:', {
      id: subscription.id,
      customer: subscription.customer,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      created: subscription.created,
      eventId: event.id,
    });

    // Find account by stripeCustomerId
    const accountsSnapshot = await db
      .collection('accounts')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      console.warn(`No account found for Stripe customer ${customerId}`);
      return;
    }

    const accountDoc = accountsSnapshot.docs[0];
    const accountId = accountDoc.id;

    // Process in transaction for atomicity
    await db.runTransaction(async (transaction) => {
      // Re-read account in transaction
      const currentAccountDoc = await transaction.get(accountDoc.ref);
      const accountData = currentAccountDoc.data() as Account;

      // Double-check if event was processed by another concurrent function
      const processedCheck = await transaction.get(processedEventRef);
      if (processedCheck.exists) {
        console.log(`Event ${event.id} was processed by concurrent function, skipping`);
        return;
      }

      // Check event ordering - only process if this event is newer
      if (
        accountData.stripeSubscriptionLastEvent &&
        event.created <= accountData.stripeSubscriptionLastEvent
      ) {
        console.log(
          `Discarding older subscription.updated event (${event.created} <= ${accountData.stripeSubscriptionLastEvent})`,
        );
        // Still mark as processed to prevent reprocessing
        transaction.set(processedEventRef, {
          eventId: event.id,
          eventType: event.type,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }

      // Determine tier and expiration based on status
      let subscriptionTier: 'premium' | 'essentials' = 'essentials';
      let expiresAt: admin.firestore.Timestamp | null = null;

      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Active or trialing subscriptions get premium access
        subscriptionTier = 'premium';

        if (subscription.current_period_end) {
          expiresAt = admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000);
          console.log('Set expiresAt from current_period_end:', {
            current_period_end: subscription.current_period_end,
            expiresAt: expiresAt.toDate().toISOString(),
            subscriptionId: subscription.id,
          });
        } else {
          console.error(
            '[CRITICAL] current_period_end is undefined for active/trialing subscription',
            {
              subscriptionId: subscription.id,
              status: subscription.status,
              apiVersion: '2025-02-24.acacia',
            },
          );
          Sentry.captureMessage('Subscription missing current_period_end', {
            level: 'error',
            extra: {
              subscriptionId: subscription.id,
              status: subscription.status,
            },
          });
        }
      } else if (subscription.status === 'past_due') {
        // Keep premium access during payment retry period
        subscriptionTier = 'premium';

        if (subscription.current_period_end) {
          expiresAt = admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000);
          console.log('Keeping premium access for past_due subscription:', {
            current_period_end: subscription.current_period_end,
            expiresAt: expiresAt.toDate().toISOString(),
            subscriptionId: subscription.id,
          });
        }
      } else if (
        subscription.status === 'canceled' ||
        subscription.status === 'unpaid' ||
        subscription.status === 'incomplete_expired'
      ) {
        // Downgrade to essentials for canceled/failed subscriptions
        subscriptionTier = 'essentials';
        expiresAt = null;
        console.log('Downgrading to essentials due to status:', {
          status: subscription.status,
          subscriptionId: subscription.id,
        });
      }

      console.log('Final values before update:', {
        accountId,
        subscriptionTier,
        expiresAt: expiresAt ? expiresAt.toDate().toISOString() : null,
      });

      // Atomically update account
      transaction.update(accountDoc.ref, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscription.status,
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        subscriptionCancelled:
          subscription.cancel_at_period_end || subscription.status === 'canceled',
        stripeSubscriptionLastEvent: event.created,
        subscriptionTier,
        expiresAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark event as processed
      transaction.set(processedEventRef, {
        eventId: event.id,
        eventType: event.type,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Successfully processed subscription.updated for account ${accountId}: tier=${subscriptionTier}, status=${subscription.status}, expiresAt=${expiresAt ? expiresAt.toDate().toISOString() : null}`,
      );
    });
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event.
 * This is fired when a subscription is canceled or expires.
 */
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(`Processing subscription deleted: ${subscription.id}`, { eventId: event.id });

  try {
    const customerId = subscription.customer as string;
    const db = admin.firestore();

    // Quick check if event already processed (outside transaction for performance)
    const processedEventRef = db.collection('processedWebhookEvents').doc(event.id);
    const processedEventDoc = await processedEventRef.get();

    if (processedEventDoc.exists) {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Find account by stripeCustomerId
    const accountsSnapshot = await db
      .collection('accounts')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      console.warn(`No account found for Stripe customer ${customerId}`);
      return;
    }

    const accountDoc = accountsSnapshot.docs[0];
    const accountId = accountDoc.id;

    // Process in transaction for atomicity
    await db.runTransaction(async (transaction) => {
      // Double-check if event was processed by another concurrent function
      const processedCheck = await transaction.get(processedEventRef);
      if (processedCheck.exists) {
        console.log(`Event ${event.id} was processed by concurrent function, skipping`);
        return;
      }

      // Downgrade account to essentials
      transaction.update(accountDoc.ref, {
        subscriptionTier: 'essentials',
        expiresAt: null,
        stripeSubscriptionStatus: 'canceled',
        stripeCancelAtPeriodEnd: false,
        subscriptionCancelled: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark event as processed
      transaction.set(processedEventRef, {
        eventId: event.id,
        eventType: event.type,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Successfully downgraded account ${accountId} to essentials`);
    });
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event.
 * This is fired when a subscription payment succeeds (including renewals).
 * Updates payment status AND refreshes subscription expiration date for renewals.
 */
async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  console.log(`Processing payment succeeded: ${invoice.id}`, { eventId: event.id });

  // Log invoice details for debugging
  console.log('Invoice details:', {
    id: invoice.id,
    customer: invoice.customer,
    subscription: invoice.subscription,
    billing_reason: invoice.billing_reason,
    status: invoice.status,
  });

  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string | null;
    const db = admin.firestore();

    // Quick check if event already processed (outside transaction for performance)
    const processedEventRef = db.collection('processedWebhookEvents').doc(event.id);
    const processedEventDoc = await processedEventRef.get();

    if (processedEventDoc.exists) {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Find account by stripeCustomerId
    const accountsSnapshot = await db
      .collection('accounts')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      console.warn(`No account found for Stripe customer ${customerId}`);
      return;
    }

    const accountDoc = accountsSnapshot.docs[0];
    const accountId = accountDoc.id;

    // Fetch fresh subscription data if this is a subscription payment
    let expiresAt: admin.firestore.Timestamp | null = null;
    let subscriptionTier: 'premium' | 'essentials' | null = null;

    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        console.log('Fetched subscription for payment renewal:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        });

        // Update expiration if subscription is active
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          subscriptionTier = 'premium';
          if (subscription.current_period_end) {
            expiresAt = admin.firestore.Timestamp.fromMillis(
              subscription.current_period_end * 1000,
            );
            console.log('Updated expiresAt from subscription renewal:', {
              current_period_end: subscription.current_period_end,
              expiresAt: expiresAt.toDate().toISOString(),
              billingReason: invoice.billing_reason,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching subscription for payment renewal:', error);
        // Continue processing payment even if subscription fetch fails
      }
    }

    // Process in transaction for atomicity
    await db.runTransaction(async (transaction) => {
      // Double-check if event was processed by another concurrent function
      const processedCheck = await transaction.get(processedEventRef);
      if (processedCheck.exists) {
        console.log(`Event ${event.id} was processed by concurrent function, skipping`);
        return;
      }

      // Prepare update fields
      const updateFields: Partial<Account> = {
        stripeSubscriptionPaid: true,
        stripeSubscriptionPayment: invoice.amount_paid,
        stripeSubscriptionPaymentFailedAt: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      };

      // Include expiration and tier if we successfully fetched subscription data
      if (expiresAt !== null) {
        updateFields.expiresAt = expiresAt;
      }
      if (subscriptionTier !== null) {
        updateFields.subscriptionTier = subscriptionTier;
      }

      transaction.update(accountDoc.ref, updateFields);

      // Mark event as processed
      transaction.set(processedEventRef, {
        eventId: event.id,
        eventType: event.type,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Successfully recorded payment success for account ${accountId}${expiresAt ? ` and updated expiresAt to ${expiresAt.toDate().toISOString()}` : ''}`,
      );
    });
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event.
 * This is fired when a subscription payment fails.
 * Only tracks payment status - subscription tier is managed by subscription events.
 */
async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  console.log(`Processing payment failed: ${invoice.id}`, { eventId: event.id });

  // Log invoice details for debugging
  console.log('Invoice details:', {
    id: invoice.id,
    customer: invoice.customer,
    billing_reason: invoice.billing_reason,
    status: invoice.status,
  });

  try {
    const customerId = invoice.customer as string;
    const db = admin.firestore();

    // Quick check if event already processed (outside transaction for performance)
    const processedEventRef = db.collection('processedWebhookEvents').doc(event.id);
    const processedEventDoc = await processedEventRef.get();

    if (processedEventDoc.exists) {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Find account by stripeCustomerId
    const accountsSnapshot = await db
      .collection('accounts')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      console.warn(`No account found for Stripe customer ${customerId}`);
      return;
    }

    const accountDoc = accountsSnapshot.docs[0];
    const accountId = accountDoc.id;

    // Process in transaction for atomicity
    await db.runTransaction(async (transaction) => {
      // Double-check if event was processed by another concurrent function
      const processedCheck = await transaction.get(processedEventRef);
      if (processedCheck.exists) {
        console.log(`Event ${event.id} was processed by concurrent function, skipping`);
        return;
      }

      // Update only payment tracking fields
      transaction.update(accountDoc.ref, {
        stripeSubscriptionPaid: false,
        stripeSubscriptionPaymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark event as processed
      transaction.set(processedEventRef, {
        eventId: event.id,
        eventType: event.type,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Successfully recorded payment failure for account ${accountId}`);
      // Note: We don't downgrade here - subscription events will handle tier changes if needed
    });
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}
