import * as admin from 'firebase-admin';
import type Stripe from 'stripe';
import { stripe } from '../config/stripe';
import type { Account, StripeSubscriptionStatus } from '../types';

/**
 * Get or create a Stripe customer for a given user.
 * If the account already has a stripeCustomerId, retrieves that customer.
 * Otherwise, creates a new customer and updates the account document.
 *
 * @param accountId - The Firestore account document ID
 * @param userId - The Firebase Auth user ID
 * @param email - The user's email address
 * @returns The Stripe customer object
 */
export async function getOrCreateStripeCustomer(
  accountId: string,
  userId: string,
  email: string,
): Promise<Stripe.Customer> {
  const db = admin.firestore();
  const accountRef = db.collection('accounts').doc(accountId);
  const accountDoc = await accountRef.get();

  if (!accountDoc.exists) {
    throw new Error('Account not found');
  }

  const accountData = accountDoc.data() as Account;

  // If customer already exists, retrieve and return it
  if (accountData.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(accountData.stripeCustomerId);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
      // If customer was deleted, fall through to create a new one
    } catch (_error) {
      // If customer doesn't exist in Stripe, fall through to create a new one
      console.warn(`Stripe customer ${accountData.stripeCustomerId} not found, creating new one`);
    }
  }

  // Create new customer in Stripe
  const customer = await stripe.customers.create({
    email,
    metadata: {
      accountId,
      userId,
    },
  });

  // Update account document with new customer ID
  await accountRef.update({
    stripeCustomerId: customer.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return customer;
}

/**
 * Get the account ID from a Firestore query by user ID.
 *
 * @deprecated This function is no longer needed since userId is the same as accountId.
 * Use userId directly as the account document ID instead.
 *
 * @param userId - The Firebase Auth user ID
 * @returns The account document ID
 * @throws Error if no account is found
 */
export async function getAccountIdByUserId(userId: string): Promise<string> {
  const db = admin.firestore();
  const accountsSnapshot = await db
    .collection('accounts')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (accountsSnapshot.empty) {
    throw new Error('Account not found');
  }

  return accountsSnapshot.docs[0].id;
}

/**
 * Check if a user already has an active subscription.
 *
 * @param accountId - The Firestore account document ID
 * @returns True if the user has an active subscription
 */
export async function hasActiveSubscription(accountId: string): Promise<boolean> {
  const db = admin.firestore();
  const accountRef = db.collection('accounts').doc(accountId);
  const accountDoc = await accountRef.get();

  if (!accountDoc.exists) {
    throw new Error('Account not found');
  }

  const accountData = accountDoc.data() as Account;

  // Check if subscription tier is premium and subscription is active
  if (accountData.subscriptionTier === 'premium') {
    // Check if subscription is still valid (not expired)
    if (accountData.expiresAt) {
      const now = admin.firestore.Timestamp.now();
      if (accountData.expiresAt.toMillis() > now.toMillis()) {
        return true;
      }
    }

    // Check Stripe subscription status
    if (
      accountData.stripeSubscriptionStatus === 'active' ||
      accountData.stripeSubscriptionStatus === 'trialing'
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Safely get expiration timestamp from subscription current_period_end.
 * Returns null if current_period_end is not available.
 *
 * @deprecated No longer needed - subscription events handle expiration directly.
 */
function getExpirationTimestamp(
  subscription: Stripe.Subscription,
): admin.firestore.Timestamp | null {
  const currentPeriodEnd = subscription.current_period_end;

  if (!currentPeriodEnd || typeof currentPeriodEnd !== 'number') {
    console.warn(
      `Invalid current_period_end for subscription ${subscription.id}: ${currentPeriodEnd}`,
    );
    return null;
  }

  return admin.firestore.Timestamp.fromMillis(currentPeriodEnd * 1000);
}

/**
 * Update account subscription status based on Stripe subscription.
 *
 * @deprecated Subscription events now update subscription data directly in handleStripeWebhook.
 * This function is no longer used and may be removed in a future version.
 *
 * @param accountId - The Firestore account document ID
 * @param subscription - The Stripe subscription object
 */
export async function updateAccountSubscription(
  accountId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const db = admin.firestore();
  const accountRef = db.collection('accounts').doc(accountId);

  const updateData: Partial<Account> = {
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: subscription.status as StripeSubscriptionStatus,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  // Set subscription tier based on status
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    updateData.subscriptionTier = 'premium';
    // Set expiration date to the end of the current period
    updateData.expiresAt = getExpirationTimestamp(subscription);
    console.log(
      `Setting subscription tier to premium for account ${accountId} (status: ${subscription.status})`,
    );
  } else if (subscription.status === 'incomplete') {
    // Handle incomplete subscriptions that have been paid
    // This can happen due to webhook timing - payment succeeds before subscription.updated event
    // We'll upgrade to premium and let the subscription.updated event confirm it
    updateData.subscriptionTier = 'premium';
    updateData.expiresAt = getExpirationTimestamp(subscription);
    console.log(
      `Setting subscription tier to premium for incomplete subscription ${accountId} - payment succeeded`,
    );
  } else if (
    subscription.status === 'canceled' ||
    subscription.status === 'unpaid' ||
    subscription.status === 'incomplete_expired'
  ) {
    updateData.subscriptionTier = 'essentials';
    updateData.expiresAt = null;
    console.log(
      `Setting subscription tier to essentials for account ${accountId} (status: ${subscription.status})`,
    );
  } else if (subscription.status === 'past_due') {
    // Keep as premium during payment retry period
    updateData.subscriptionTier = 'premium';
    updateData.expiresAt = getExpirationTimestamp(subscription);
    updateData.stripeSubscriptionPaymentFailedAt = admin.firestore.Timestamp.now();
    console.log(
      `Setting subscription tier to premium (past_due) for account ${accountId} (status: ${subscription.status})`,
    );
  } else {
    // Log unhandled subscription status
    console.warn(
      `Unhandled subscription status for account ${accountId}: ${subscription.status}. Tier will not be updated.`,
    );
  }

  console.log(`Updating account ${accountId} with data:`, updateData);
  await accountRef.update(updateData);
}

/**
 * Downgrade account to essentials tier.
 *
 * @param accountId - The Firestore account document ID
 */
export async function downgradeToEssentials(accountId: string): Promise<void> {
  const db = admin.firestore();
  const accountRef = db.collection('accounts').doc(accountId);

  await accountRef.update({
    subscriptionTier: 'essentials',
    expiresAt: null,
    stripeSubscriptionStatus: 'canceled',
    updatedAt: admin.firestore.Timestamp.now(),
  });
}

/**
 * Get account ID from Stripe customer metadata.
 *
 * @deprecated Use Firestore query by stripeCustomerId instead to avoid extra Stripe API call.
 * This function makes an unnecessary API call to Stripe and may be removed in a future version.
 *
 * @param customerId - The Stripe customer ID
 * @returns The account document ID
 * @throws Error if customer not found or metadata is missing
 */
export async function getAccountIdFromStripeCustomer(customerId: string): Promise<string> {
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    throw new Error('Customer has been deleted');
  }

  const accountId = customer.metadata?.accountId;

  if (!accountId) {
    throw new Error('Customer metadata does not contain accountId');
  }

  return accountId;
}
