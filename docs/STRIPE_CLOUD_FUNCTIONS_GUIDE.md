# Stripe Cloud Functions Implementation Guide

This guide provides complete instructions for implementing the backend Stripe integration for Spendless Premium subscriptions.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Stripe SDK Installation](#stripe-sdk-installation)
5. [Cloud Functions Implementation](#cloud-functions-implementation)
6. [Webhook Handler](#webhook-handler)
7. [Security Considerations](#security-considerations)
8. [Testing](#testing)
9. [Deployment Checklist](#deployment-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Spendless Premium subscription system requires three Firebase Cloud Functions:

1. **`createCheckoutSession`** - Creates a Stripe Checkout session for upgrading to premium
2. **`createCustomerPortalSession`** - Creates a Stripe Customer Portal session for subscription management
3. **`handleStripeWebhook`** - Handles Stripe webhook events and updates account data in Firestore

### Data Flow

```
Frontend (React) → Cloud Function → Stripe API
                         ↓
                   Session ID/URL
                         ↓
                  Redirect to Stripe
                         ↓
                  User completes payment
                         ↓
              Stripe Webhook → handleStripeWebhook
                         ↓
                Update Firestore (subscriptionTier, expiresAt)
```

---

## Prerequisites

1. **Stripe Account**: Create a Stripe account at https://stripe.com
2. **Products Created**: Create "Spendless Premium" product with Monthly and Annual prices
3. **Firebase Functions**: Ensure Firebase Functions is enabled for your project
4. **Node.js**: Ensure Node.js 18+ is installed in Functions environment

### Stripe Dashboard Setup

#### 1. Create Product

Navigate to: **Stripe Dashboard → Products → Add Product**

```
Product Name: Spendless Premium
Description: Unlimited spending history, advanced features, and priority support
```

#### 2. Create Prices

**Monthly Price:**
```
Amount: $8.99
Billing Period: Monthly
Price ID: Copy this (e.g., price_1ABC123...)
```

**Annual Price:**
```
Amount: $75
Billing Period: Yearly
Price ID: Copy this (e.g., price_1DEF456...)
```

#### 3. Enable Customer Portal

Navigate to: **Stripe Dashboard → Settings → Customer Portal**

```
✅ Enable Customer Portal
✅ Allow customers to update payment methods
✅ Allow customers to cancel subscriptions
✅ Allow customers to view invoices
```

#### 4. Configure Webhooks

Navigate to: **Stripe Dashboard → Developers → Webhooks → Add Endpoint**

```
Endpoint URL: https://your-region-your-project.cloudfunctions.net/handleStripeWebhook
Events to send:
  ✅ customer.subscription.created
  ✅ customer.subscription.updated
  ✅ customer.subscription.deleted
  ✅ invoice.payment_succeeded
  ✅ invoice.payment_failed
```

**Important:** Copy the **Webhook Signing Secret** (starts with `whsec_...`)

---

## Environment Setup

### Firebase Functions Configuration

Add environment variables to your Firebase Functions:

```bash
# Set Firebase environment variables
firebase functions:config:set \
  stripe.secret_key="sk_test_your_secret_key" \
  stripe.webhook_secret="whsec_your_webhook_signing_secret" \
  stripe.price_id_monthly="price_your_monthly_price_id" \
  stripe.price_id_annual="price_your_annual_price_id"

# For production, use live keys instead of test keys
```

Alternatively, for Firebase Functions Gen 2 with .env files:

```bash
# functions/.env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
STRIPE_PRICE_ID_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_ID_ANNUAL=price_your_annual_price_id
```

---

## Stripe SDK Installation

Navigate to your Functions directory and install Stripe:

```bash
cd functions
npm install stripe
npm install --save-dev @types/stripe
```

---

## Cloud Functions Implementation

### File Structure

```
functions/
├── src/
│   ├── index.ts                    # Export all functions
│   ├── stripe/
│   │   ├── createCheckoutSession.ts
│   │   ├── createCustomerPortalSession.ts
│   │   ├── handleStripeWebhook.ts
│   │   └── helpers.ts              # Shared utilities
│   └── config/
│       └── stripe.ts               # Stripe client initialization
```

### 1. Stripe Client Configuration

**File:** `functions/src/config/stripe.ts`

```typescript
import Stripe from 'stripe';
import * as functions from 'firebase-functions';

// Initialize Stripe with secret key
const stripeSecretKey = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key not configured');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia', // Use latest API version
  typescript: true,
});

export const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;
```

### 2. Create Checkout Session Function

**File:** `functions/src/stripe/createCheckoutSession.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { stripe } from '../config/stripe';
import { HttpsError } from 'firebase-functions/v2/https';

interface CreateCheckoutSessionData {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const createCheckoutSession = functions.https.onCall(
  async (data: CreateCheckoutSessionData, context) => {
    // 1. Verify user is authenticated
    if (!context.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email;

    if (!userEmail) {
      throw new HttpsError('invalid-argument', 'User email is required');
    }

    // 2. Validate input
    const { priceId, successUrl, cancelUrl } = data;

    if (!priceId) {
      throw new HttpsError('invalid-argument', 'Price ID is required');
    }

    // 3. Fetch user's account from Firestore
    const accountsSnapshot = await admin
      .firestore()
      .collection('accounts')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      throw new HttpsError('not-found', 'Account not found');
    }

    const accountDoc = accountsSnapshot.docs[0];
    const accountId = accountDoc.id;

    // 4. Check if user already has active subscription
    const accountData = accountDoc.data();
    if (accountData.subscriptionTier === 'premium') {
      const expiresAt = accountData.expiresAt?.toDate();
      if (expiresAt && expiresAt > new Date()) {
        throw new HttpsError(
          'already-exists',
          'User already has an active premium subscription'
        );
      }
    }

    // 5. Check for existing Stripe customer
    let customerId: string | undefined;

    if (accountData.stripeCustomerId) {
      customerId = accountData.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUserId: userId,
          accountId: accountId,
        },
      });
      customerId = customer.id;

      // Store customer ID in Firestore
      await accountDoc.ref.update({
        stripeCustomerId: customerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 6. Create Checkout Session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.APP_URL}/subscription/cancel`,
        subscription_data: {
          metadata: {
            firebaseUserId: userId,
            accountId: accountId,
          },
        },
        metadata: {
          firebaseUserId: userId,
          accountId: accountId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new HttpsError('internal', 'Failed to create checkout session');
    }
  }
);
```

### 3. Create Customer Portal Session Function

**File:** `functions/src/stripe/createCustomerPortalSession.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { stripe } from '../config/stripe';
import { HttpsError } from 'firebase-functions/v2/https';

interface CreateCustomerPortalSessionData {
  returnUrl?: string;
}

export const createCustomerPortalSession = functions.https.onCall(
  async (data: CreateCustomerPortalSessionData, context) => {
    // 1. Verify user is authenticated
    if (!context.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // 2. Fetch user's account from Firestore
    const accountsSnapshot = await admin
      .firestore()
      .collection('accounts')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      throw new HttpsError('not-found', 'Account not found');
    }

    const accountDoc = accountsSnapshot.docs[0];
    const accountData = accountDoc.data();

    // 3. Verify user has Stripe customer ID
    if (!accountData.stripeCustomerId) {
      throw new HttpsError('failed-precondition', 'No Stripe customer found');
    }

    // 4. Create Customer Portal Session
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: accountData.stripeCustomerId,
        return_url: data.returnUrl || `${process.env.APP_URL}/settings`,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw new HttpsError('internal', 'Failed to create customer portal session');
    }
  }
);
```

### 4. Webhook Handler Function

**File:** `functions/src/stripe/handleStripeWebhook.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { stripe, webhookSecret } from '../config/stripe';
import Stripe from 'stripe';

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  // 1. Verify webhook signature
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    console.error('Missing stripe-signature header');
    res.status(400).send('Missing signature');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // 2. Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).send('Webhook handler error');
  }
});

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const accountId = subscription.metadata.accountId;

  if (!accountId) {
    console.error('No accountId in subscription metadata');
    return;
  }

  // Calculate expiration date
  const expiresAt = new Date(subscription.current_period_end * 1000);

  // Determine subscription tier based on status
  const isActive = ['active', 'trialing'].includes(subscription.status);
  const subscriptionTier = isActive ? 'premium' : 'essentials';

  // Update account in Firestore
  await admin.firestore().collection('accounts').doc(accountId).update({
    subscriptionTier,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: subscription.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Updated account ${accountId} to ${subscriptionTier}, expires at ${expiresAt}`);
}

/**
 * Handle subscription deletion (cancellation)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const accountId = subscription.metadata.accountId;

  if (!accountId) {
    console.error('No accountId in subscription metadata');
    return;
  }

  // Downgrade to essentials
  await admin.firestore().collection('accounts').doc(accountId).update({
    subscriptionTier: 'essentials',
    expiresAt: null,
    stripeSubscriptionStatus: 'canceled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Account ${accountId} downgraded to essentials (subscription canceled)`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return;
  }

  // Fetch subscription to get metadata
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const accountId = subscription.metadata.accountId;

  if (!accountId) {
    console.error('No accountId in subscription metadata');
    return;
  }

  // Ensure account is premium and update expiration
  const expiresAt = new Date(subscription.current_period_end * 1000);

  await admin.firestore().collection('accounts').doc(accountId).update({
    subscriptionTier: 'premium',
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    stripeSubscriptionStatus: subscription.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Payment succeeded for account ${accountId}, updated expiration to ${expiresAt}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return;
  }

  // Fetch subscription to get metadata
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const accountId = subscription.metadata.accountId;

  if (!accountId) {
    console.error('No accountId in subscription metadata');
    return;
  }

  // Log the failure (don't downgrade immediately, Stripe will retry)
  console.warn(`Payment failed for account ${accountId}, subscription ${subscription.id}`);

  // Optionally send notification to user (implement email/push notification)
  // You might want to add a 'paymentFailedAt' timestamp to track issues
  await admin.firestore().collection('accounts').doc(accountId).update({
    lastPaymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

### 5. Helper Functions (Optional)

**File:** `functions/src/stripe/helpers.ts`

```typescript
import * as admin from 'firebase-admin';

/**
 * Get account document by user ID
 */
export async function getAccountByUserId(userId: string) {
  const snapshot = await admin
    .firestore()
    .collection('accounts')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return {
    id: snapshot.docs[0].id,
    data: snapshot.docs[0].data(),
    ref: snapshot.docs[0].ref,
  };
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  return expiresAt > new Date();
}
```

### 6. Main Index File

**File:** `functions/src/index.ts`

```typescript
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
export { createCheckoutSession } from './stripe/createCheckoutSession';
export { createCustomerPortalSession } from './stripe/createCustomerPortalSession';
export { handleStripeWebhook } from './stripe/handleStripeWebhook';
```

---

## Security Considerations

### 1. Authentication

- ✅ Always verify `context.auth` in callable functions
- ✅ Use Firebase Auth tokens for user identification
- ✅ Never trust client-provided user IDs

### 2. Authorization

- ✅ Verify user owns the account they're modifying
- ✅ Check subscription status before allowing upgrades
- ✅ Validate price IDs against allowed values

### 3. Webhook Security

- ✅ Always verify webhook signatures using `stripe.webhooks.constructEvent`
- ✅ Use webhook signing secret from Stripe Dashboard
- ✅ Log all webhook events for auditing

### 4. Data Validation

- ✅ Validate all input parameters
- ✅ Use TypeScript interfaces for type safety
- ✅ Handle edge cases (missing metadata, invalid states)

### 5. Error Handling

- ✅ Use Firebase Functions error codes (unauthenticated, invalid-argument, etc.)
- ✅ Log errors with context for debugging
- ✅ Don't expose sensitive error details to clients

### 6. Environment Variables

- ✅ Never commit secret keys to version control
- ✅ Use Firebase Functions config or .env files
- ✅ Separate test and production keys

---

## Firestore Schema Updates

Add the following fields to the `accounts` collection documents:

```typescript
interface Account {
  // Existing fields
  id: string;
  userId: string;
  name: string;
  currency: string;
  subscriptionTier: 'essentials' | 'premium';
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // New Stripe-related fields
  stripeCustomerId?: string;           // Stripe customer ID
  stripeSubscriptionId?: string;       // Current subscription ID
  stripeSubscriptionStatus?: string;   // active, canceled, past_due, etc.
  lastPaymentFailedAt?: Timestamp;     // Track payment failures
}
```

### Firestore Security Rules

Update your `firestore.rules` to protect subscription data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /accounts/{accountId} {
      // Users can read their own account
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;

      // Users cannot directly modify subscription fields
      allow update: if request.auth != null &&
                       resource.data.userId == request.auth.uid &&
                       !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['subscriptionTier', 'expiresAt', 'stripeCustomerId',
                                 'stripeSubscriptionId', 'stripeSubscriptionStatus']);
    }
  }
}
```

---

## Testing

### 1. Local Testing (Emulators)

```bash
# Start Firebase emulators
firebase emulators:start

# Test functions locally
curl -X POST http://localhost:5001/your-project/us-central1/createCheckoutSession \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -d '{"data": {"priceId": "price_test_123"}}'
```

### 2. Stripe CLI for Webhook Testing

Install Stripe CLI and forward webhooks to local emulator:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local function
stripe listen --forward-to localhost:5001/your-project/us-central1/handleStripeWebhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### 3. Test with Stripe Test Cards

Use Stripe test cards for checkout testing:

```
Successful payment: 4242 4242 4242 4242
Payment requires authentication: 4000 0025 0000 3155
Payment is declined: 4000 0000 0000 9995

Any future expiration date, any 3-digit CVC, any zip code
```

### 4. Integration Testing Checklist

- [ ] Create checkout session with valid price ID
- [ ] Create checkout session with invalid price ID (should fail)
- [ ] Complete checkout flow with test card
- [ ] Verify account upgraded to premium in Firestore
- [ ] Verify expiresAt is set correctly
- [ ] Access customer portal as premium user
- [ ] Cancel subscription in customer portal
- [ ] Verify account downgraded to essentials after cancellation
- [ ] Test webhook signature verification
- [ ] Test subscription renewal (payment succeeded)
- [ ] Test payment failure handling

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Stripe products and prices created
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Firestore security rules updated
- [ ] Error logging and monitoring enabled

### Deployment

```bash
# Deploy functions
firebase deploy --only functions

# Verify deployment
firebase functions:log --only createCheckoutSession
firebase functions:log --only handleStripeWebhook
```

### Post-Deployment

- [ ] Test createCheckoutSession in production
- [ ] Test createCustomerPortalSession in production
- [ ] Complete test purchase in production mode
- [ ] Verify webhook receives events
- [ ] Monitor logs for errors
- [ ] Test subscription cancellation flow

### Production Environment Variables

**Important:** Switch to live Stripe keys for production:

```bash
firebase functions:config:set \
  stripe.secret_key="sk_live_your_live_secret_key" \
  stripe.webhook_secret="whsec_your_live_webhook_signing_secret" \
  stripe.price_id_monthly="price_your_live_monthly_price_id" \
  stripe.price_id_annual="price_your_live_annual_price_id"
```

---

## Troubleshooting

### Issue: "Webhook signature verification failed"

**Solution:**
- Verify webhook secret matches Stripe Dashboard
- Ensure using `req.rawBody` (not `req.body`)
- Check webhook endpoint URL is correct

### Issue: "Account not found"

**Solution:**
- Verify user is authenticated
- Check account exists in Firestore
- Verify userId matches authenticated user

### Issue: "Stripe customer not found"

**Solution:**
- Ensure customer was created in createCheckoutSession
- Verify stripeCustomerId is stored in Firestore
- Check customer exists in Stripe Dashboard

### Issue: "Subscription not updating after payment"

**Solution:**
- Check webhook events are being received
- Verify webhook signature is valid
- Check metadata contains accountId
- Review Cloud Functions logs for errors

### Issue: "User still showing essentials after upgrade"

**Solution:**
- Check Firestore for updated subscriptionTier
- Verify frontend is refetching account data
- Check expiresAt is in the future
- Review webhook handler logs

---

## Monitoring and Logging

### Firebase Console

Monitor Cloud Functions in Firebase Console:
- Functions → Dashboard (view invocations, errors)
- Functions → Logs (view detailed logs)
- Functions → Health (view performance)

### Stripe Dashboard

Monitor subscription activity in Stripe Dashboard:
- Customers → View customer details
- Subscriptions → View subscription status
- Events → View all webhook events
- Logs → View API request logs

### Recommended Logging

Add structured logging throughout functions:

```typescript
console.log('Checkout session created', {
  sessionId: session.id,
  userId,
  accountId,
  priceId,
});

console.warn('Payment failed', {
  invoiceId: invoice.id,
  accountId,
  attemptCount: invoice.attempt_count,
});

console.error('Webhook processing error', {
  eventId: event.id,
  eventType: event.type,
  error: error.message,
});
```

---

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal Documentation](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Functions Config Documentation](https://firebase.google.com/docs/functions/config-env)

---

## Support

If you encounter issues implementing these cloud functions:

1. Check Firebase Functions logs: `firebase functions:log`
2. Review Stripe Dashboard → Developers → Events
3. Test webhooks locally with Stripe CLI
4. Refer to Stripe API documentation
5. Contact Stripe Support for Stripe-specific issues

---

**Last Updated:** 2025-01-03
**Version:** 1.0.0
