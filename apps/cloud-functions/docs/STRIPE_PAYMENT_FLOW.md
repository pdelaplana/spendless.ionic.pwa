# Stripe Payment Flow

This document explains the complete end-to-end flow when a user upgrades to Premium subscription in the Spendless application.

## Table of Contents

- [Overview](#overview)
- [Flow Diagram](#flow-diagram)
- [Detailed Step-by-Step Flow](#detailed-step-by-step-flow)
- [Components Involved](#components-involved)
- [Error Handling](#error-handling)
- [Webhook Events](#webhook-events)
- [Testing the Flow](#testing-the-flow)

## Overview

The Spendless application uses **Stripe Checkout** for handling premium subscriptions. The flow involves:

1. User initiates upgrade from the frontend
2. Frontend calls a Cloud Function to create a Stripe Checkout Session
3. User is redirected to Stripe's hosted checkout page
4. After payment, Stripe sends webhook events to update subscription status
5. User is redirected back to the app with success/cancel status

## Flow Diagram

```
┌─────────────┐
│    User     │
│   Clicks    │
│  "Upgrade   │
│ to Premium" │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ UpgradeButton Component                                │ │
│  │ - Shows loading spinner                                │ │
│  │ - Calls useCreateCheckoutSession hook                  │ │
│  │ - Passes: priceId, successUrl, cancelUrl               │ │
│  └────────────────────┬───────────────────────────────────┘ │
└─────────────────────────┼─────────────────────────────────────┘
                        │
                        │ Firebase HTTPS Callable
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloud Functions (Backend)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ createCheckoutSession                                  │ │
│  │ 1. ✓ Validate user authentication                      │ │
│  │ 2. ✓ Validate price ID (monthly/annual)               │ │
│  │ 3. ✓ Check for existing active subscription           │ │
│  │ 4. ✓ Get or create Stripe customer                    │ │
│  │ 5. ✓ Create Stripe Checkout Session                   │ │
│  │ 6. ✓ Return { sessionId, url }                        │ │
│  └────────────────────┬───────────────────────────────────┘ │
└─────────────────────────┼─────────────────────────────────────┘
                        │
                        │ Returns checkout URL
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Redirect to Stripe                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ window.location.href = data.url                        │ │
│  │                                                        │ │
│  │ User is taken to Stripe Checkout hosted page:         │ │
│  │ - Enter payment details (credit card)                 │ │
│  │ - Review subscription details                         │ │
│  │ - Complete purchase                                   │ │
│  └────────────────────┬───────────────────────────────────┘ │
└─────────────────────────┼─────────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
    ┌─────────────┐           ┌─────────────┐
    │   Success   │           │   Cancel    │
    └──────┬──────┘           └──────┬──────┘
           │                         │
           │                         └──────────────┐
           ▼                                        ▼
┌─────────────────────────────────┐    ┌──────────────────────┐
│ Stripe fires webhook:           │    │  Redirect to app:    │
│ customer.subscription.created   │    │  /subscription/cancel│
└──────┬──────────────────────────┘    └──────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloud Functions (Backend)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ handleStripeWebhook                                    │ │
│  │ 1. ✓ Verify webhook signature                         │ │
│  │ 2. ✓ Parse event type                                 │ │
│  │ 3. ✓ Update Firestore account:                        │ │
│  │    - subscriptionTier: 'premium'                      │ │
│  │    - stripeCustomerId                                 │ │
│  │    - stripeSubscriptionId                             │ │
│  │    - stripeSubscriptionStatus: 'active'               │ │
│  │    - expiresAt: period_end date                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│  Redirect to app:       │
│  /subscription/success  │
│                         │
│  User now has premium!  │
└─────────────────────────┘
```

## Detailed Step-by-Step Flow

### Step 1: User Clicks "Upgrade To Premium"

The upgrade button can appear in several locations:

**Location A: Subscription Restricted Banner**
- File: `spendless.ionic.pwa/src/components/subscription/SubscriptionRestrictedBanner.tsx`
- Appears when: User views spending history beyond 30 days
- Message: "You're viewing the last 30 days. Upgrade to Premium for unlimited spending history."

**Location B: Subscription Card**
- File: `spendless.ionic.pwa/src/components/subscription/SubscriptionCard.tsx`
- Appears in: Settings > Subscription page
- Options: Monthly or Annual subscription buttons

### Step 2: Frontend Initiates Checkout

**Component: `UpgradeButton`**
- File: `spendless.ionic.pwa/src/components/subscription/UpgradeButton.tsx`
- Lines: 87-120

When the button is clicked:

```tsx
const handleUpgrade = () => {
  // Validate configuration
  if (!priceId) {
    presentToast({ message: 'Configuration error', color: 'danger' });
    return;
  }

  // Show loading state
  onUpgradeStart?.();

  // Call Cloud Function
  createCheckoutSession(
    {
      priceId,  // Monthly or Annual Stripe Price ID
      successUrl: `${window.location.origin}/subscription/success`,
      cancelUrl: `${window.location.origin}/subscription/cancel`,
    },
    {
      onSuccess: (data) => {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      },
      onError: (error) => {
        presentToast({ message: 'Upgrade error', color: 'danger' });
      },
    },
  );
};
```

**UI Changes:**
- Button text replaced with spinner
- Button disabled during request
- Toast notification shown on error

### Step 3: Cloud Function Called

**Hook: `useCreateCheckoutSession`**
- File: `spendless.ionic.pwa/src/hooks/functions/useCreateCheckoutSession.ts`
- Lines: 41-66

The hook makes a Firebase HTTPS Callable function call:

```typescript
const functions = getFunctions();
const createCheckoutSession = httpsCallable<
  CreateCheckoutSessionParams,
  CreateCheckoutSessionResponse
>(functions, 'createCheckoutSession');

const response = await createCheckoutSession({
  priceId: 'price_xxx...',
  successUrl: 'https://app.spendless.com/subscription/success',
  cancelUrl: 'https://app.spendless.com/subscription/cancel'
});

// Returns: { sessionId: 'cs_xxx...', url: 'https://checkout.stripe.com/...' }
```

### Step 4: Backend Creates Stripe Session

**Cloud Function: `createCheckoutSession`**
- File: `functions/src/stripe/createCheckoutSession.ts`
- Export: `functions/src/index.ts`

The function performs the following validations and operations:

#### 4.1 Authentication Validation
```typescript
if (request?.auth === null) {
  throw new functions.https.HttpsError(
    'unauthenticated',
    'User must be authenticated to create a checkout session.'
  );
}
const userId = request.auth?.uid;
const userEmail = request.auth?.token.email;
```

#### 4.2 Price ID Validation
```typescript
if (!isValidPriceId(data.priceId)) {
  throw new functions.https.HttpsError('invalid-argument', 'Invalid price ID.');
}
```

Validates against configured price IDs:
- `STRIPE_PRICE_ID_MONTHLY` (from config/env)
- `STRIPE_PRICE_ID_ANNUAL` (from config/env)

#### 4.3 Check Existing Subscription
```typescript
const hasActive = await hasActiveSubscription(accountId);
if (hasActive) {
  throw new functions.https.HttpsError(
    'already-exists',
    'User already has an active subscription.'
  );
}
```

Prevents duplicate subscriptions by checking account status.

#### 4.4 Get or Create Stripe Customer
```typescript
const customer = await getOrCreateStripeCustomer(accountId, userId, userEmail);
```

**Helper: `getOrCreateStripeCustomer`** (functions/src/stripe/helpers.ts:103-137)
- Checks Firestore for existing `stripeCustomerId`
- If exists: Returns existing customer
- If not: Creates new Stripe customer with metadata:
  - `accountId`: Firestore account document ID
  - `userId`: Firebase Auth user ID
  - `email`: User email address

#### 4.5 Create Stripe Checkout Session
```typescript
const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  payment_method_types: ['card'],
  mode: 'subscription',
  line_items: [
    {
      price: data.priceId,
      quantity: 1,
    },
  ],
  success_url: successUrl,
  cancel_url: cancelUrl,
  subscription_data: {
    metadata: {
      accountId,
      userId,
    },
  },
});
```

#### 4.6 Return Session Data
```typescript
return {
  sessionId: session.id,
  url: session.url,
};
```

**Response Example:**
```json
{
  "sessionId": "cs_test_a1b2c3...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3..."
}
```

### Step 5: User Redirected to Stripe

**Frontend Redirect** (UpgradeButton.tsx:108)
```typescript
onSuccess: (data) => {
  window.location.href = data.url;
}
```

The user is taken to **Stripe's hosted checkout page** (checkout.stripe.com) where they:

1. **See subscription details:**
   - Product name: "Premium Subscription"
   - Billing frequency: Monthly or Annual
   - Price amount
   - First billing date

2. **Enter payment information:**
   - Card number
   - Expiration date
   - CVC/CVV
   - Billing address (if required)

3. **Complete purchase:**
   - Click "Subscribe" or "Complete Payment"
   - Stripe processes payment
   - User sees confirmation

**Stripe Security:**
- PCI-compliant hosted page
- 3D Secure authentication (if required)
- Payment method verification
- Fraud detection

### Step 6: After Payment

#### Success Path

**6.1 User Redirected**
- URL: `https://app.spendless.com/subscription/success`
- Query params: `?session_id=cs_test_a1b2c3...`

**6.2 Stripe Fires Webhook Event**
- Event type: `customer.subscription.created`
- Sent to: `https://us-central1-<project>.cloudfunctions.net/handleStripeWebhook`
- Payload: Full subscription object with status, dates, customer info

**6.3 Webhook Processed**

**Cloud Function: `handleStripeWebhook`**
- File: `functions/src/stripe/handleStripeWebhook.ts`
- Lines: 27-104

```typescript
// Verify webhook signature
const sig = request.headers['stripe-signature'];
const webhookSecret = getWebhookSecret();
const event = stripe.webhooks.constructEvent(request.rawBody, sig, webhookSecret);

// Route to handler
switch (event.type) {
  case 'customer.subscription.created':
    await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
    break;
  // ... other events
}
```

**Handler: `handleSubscriptionCreated`** (handleStripeWebhook.ts:110-121)

```typescript
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Get account from Stripe customer metadata
  const accountId = await getAccountIdFromStripeCustomer(subscription.customer as string);

  // Update account in Firestore
  await updateAccountSubscription(accountId, subscription);
}
```

**Helper: `updateAccountSubscription`** (stripe/helpers.ts:139-179)

Updates Firestore `accounts/{accountId}` document:

```typescript
const updateData = {
  stripeSubscriptionId: subscription.id,
  stripeSubscriptionStatus: subscription.status, // 'active', 'trialing', etc.
  subscriptionTier: 'premium',  // Upgraded!
  expiresAt: Timestamp.fromMillis(subscription.current_period_end * 1000),
  updatedAt: Timestamp.now(),
};

await db.collection('accounts').doc(accountId).update(updateData);
```

**Firestore Document After Update:**
```json
{
  "id": "account123",
  "userId": "user456",
  "subscriptionTier": "premium",
  "stripeCustomerId": "cus_abc123",
  "stripeSubscriptionId": "sub_def456",
  "stripeSubscriptionStatus": "active",
  "expiresAt": "2024-12-05T00:00:00Z",
  "stripeSubscriptionPaymentFailedAt": null,
  "createdAt": "2024-11-05T12:00:00Z",
  "updatedAt": "2024-11-05T12:05:30Z"
}
```

**6.4 Frontend Updates**
- Firestore listener detects subscription change
- UI updates to show premium features
- Banner/restrictions removed
- Unlimited history access enabled

#### Cancel Path

**User Clicks "Back" or "Cancel" on Stripe Checkout**
- Redirected to: `https://app.spendless.com/subscription/cancel`
- No subscription created
- No webhook fired
- User remains on essentials tier
- Toast message: "Upgrade cancelled. You can try again anytime."

## Components Involved

### Frontend Components

| Component | File | Purpose |
|-----------|------|---------|
| UpgradeButton | `src/components/subscription/UpgradeButton.tsx` | Initiates checkout flow |
| SubscriptionRestrictedBanner | `src/components/subscription/SubscriptionRestrictedBanner.tsx` | Shows upgrade prompt in UI |
| SubscriptionCard | `src/components/subscription/SubscriptionCard.tsx` | Displays subscription status and options |

### Frontend Hooks

| Hook | File | Purpose |
|------|------|---------|
| useCreateCheckoutSession | `src/hooks/functions/useCreateCheckoutSession.ts` | Calls createCheckoutSession cloud function |
| useSubscription | `src/hooks/subscription/useSubscription.ts` | Manages subscription state |

### Backend Functions

| Function | File | Type | Purpose |
|----------|------|------|---------|
| createCheckoutSession | `functions/src/stripe/createCheckoutSession.ts` | HTTPS Callable | Creates Stripe Checkout Session |
| handleStripeWebhook | `functions/src/stripe/handleStripeWebhook.ts` | HTTP Request | Processes Stripe webhook events |

### Backend Helpers

| Helper | File | Purpose |
|--------|------|---------|
| getOrCreateStripeCustomer | `functions/src/stripe/helpers.ts:103-137` | Creates/retrieves Stripe customer |
| hasActiveSubscription | `functions/src/stripe/helpers.ts:52-76` | Checks for existing subscription |
| updateAccountSubscription | `functions/src/stripe/helpers.ts:139-179` | Updates Firestore with subscription data |
| downgradeToEssentials | `functions/src/stripe/helpers.ts:181-201` | Removes premium access |
| getAccountIdFromStripeCustomer | `functions/src/stripe/helpers.ts:203-230` | Retrieves accountId from Stripe metadata |

### Backend Configuration

| Module | File | Purpose |
|--------|------|---------|
| Stripe Config | `functions/src/config/stripe.ts` | Stripe client initialization, lazy loading |
| Types | `functions/src/types.ts` | TypeScript type definitions |

## Error Handling

### Frontend Error Scenarios

| Error | Cause | User Experience |
|-------|-------|----------------|
| Configuration missing | Price ID not configured | Toast: "Configuration error" |
| Network failure | API request fails | Toast: "Upgrade error" |
| Already subscribed | User has active subscription | Toast from backend error |
| Authentication required | User not logged in | HttpsError: 'unauthenticated' |

### Backend Error Scenarios

| Error | Cause | Response |
|-------|-------|----------|
| Unauthenticated | No Firebase Auth token | HttpsError: 'unauthenticated' |
| Invalid price ID | Wrong/unconfigured price | HttpsError: 'invalid-argument' |
| Already exists | Active subscription found | HttpsError: 'already-exists' |
| Stripe API error | Stripe service issue | HttpsError: 'internal' (logged to Sentry) |
| Account not found | Missing Firestore document | HttpsError: 'not-found' |

### Webhook Error Handling

```typescript
try {
  // Process webhook event
  await handleSubscriptionCreated(subscription);

  // Always return 200 to acknowledge receipt
  response.status(200).json({ received: true });
} catch (error) {
  // Log to Sentry
  Sentry.captureException(error);

  // Still return 200 to prevent Stripe retries
  // (investigate via Sentry instead)
  response.status(200).json({
    received: true,
    error: 'Processing failed but acknowledged'
  });
}
```

**Important:** Webhooks always return 200 to prevent Stripe from retrying. Errors are logged to Sentry for investigation.

## Webhook Events

The `handleStripeWebhook` function processes these Stripe events:

### Subscription Lifecycle

| Event | When Fired | Handler | Action |
|-------|-----------|---------|--------|
| `customer.subscription.created` | New subscription created | handleSubscriptionCreated | Upgrade to premium, set expiry date |
| `customer.subscription.updated` | Subscription modified | handleSubscriptionUpdated | Update status and expiry date |
| `customer.subscription.deleted` | Subscription cancelled/expired | handleSubscriptionDeleted | Downgrade to essentials |

### Payment Events

| Event | When Fired | Handler | Action |
|-------|-----------|---------|--------|
| `invoice.payment_succeeded` | Payment successful (renewal) | handlePaymentSucceeded | Update expiry date, clear failure timestamp |
| `invoice.payment_failed` | Payment failed | handlePaymentFailed | Record failure timestamp, keep subscription active (Stripe retries) |

### Webhook Security

**Signature Verification** (handleStripeWebhook.ts:50-61)
```typescript
const sig = request.headers['stripe-signature'];
const webhookSecret = getWebhookSecret();

try {
  event = stripe.webhooks.constructEvent(request.rawBody, sig, webhookSecret);
} catch (error) {
  console.error('Webhook signature verification failed:', error);
  response.status(400).send('Webhook Error: Invalid signature');
  return;
}
```

This prevents:
- ✅ Fake webhook requests
- ✅ Replay attacks
- ✅ Man-in-the-middle tampering

## Testing the Flow

### Local Development Testing

#### 1. Set up Stripe Test Mode

```bash
# In functions/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_test_monthly...
STRIPE_PRICE_ID_ANNUAL=price_test_annual...
```

#### 2. Start Firebase Emulators

```bash
cd functions
npm run serve
```

#### 3. Start Stripe CLI for Webhooks

```bash
stripe listen --forward-to http://localhost:5001/<project-id>/us-central1/handleStripeWebhook
```

This will output a webhook signing secret:
```
> Ready! Your webhook signing secret is whsec_test123...
```

Update your `.env` with this secret.

#### 4. Test the Flow

1. Navigate to subscription page in your app (running on localhost:8100)
2. Click "Upgrade to Premium"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., 12/25)
5. CVC: Any 3 digits (e.g., 123)
6. Complete checkout
7. Verify webhook events in Stripe CLI
8. Check Firestore for updated subscription status

### Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 0077 | Charge succeeds, card has insufficient funds for next billing cycle |

### Production Testing

#### 1. Configure Production Stripe Keys

```bash
# Use the configure-stripe.ps1 script
cd functions/scripts
./configure-stripe.ps1 -Environment prod
```

Or manually:
```bash
firebase use prod
firebase functions:config:set \
  stripe.secret_key="sk_live_..." \
  stripe.webhook_secret="whsec_..." \
  stripe.price_id_monthly="price_..." \
  stripe.price_id_annual="price_..."
```

#### 2. Set Up Production Webhook

In Stripe Dashboard:
1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://us-central1-<project-id>.cloudfunctions.net/handleStripeWebhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret
6. Update Firebase config with the webhook secret

#### 3. Test with Real Card

**Important:** Use a real credit card or Stripe test mode in production (toggle in Dashboard).

### Monitoring

#### Sentry Error Tracking

All errors are logged to Sentry:
- Function invocation errors
- Stripe API errors
- Webhook processing failures
- Payment failures

#### Stripe Dashboard

Monitor in Stripe Dashboard:
- Recent payments (Dashboard > Payments)
- Subscriptions (Dashboard > Subscriptions)
- Webhook deliveries (Developers > Webhooks > Logs)
- Customer details (Dashboard > Customers)

#### Firebase Console

Check Firebase Console:
- Function logs (Functions > Logs)
- Function execution times (Functions > Usage)
- Firestore writes (Firestore > Usage)

## Troubleshooting

### Common Issues

#### Issue: "Configuration error" toast

**Cause:** Stripe Price ID not configured

**Solution:**
```bash
# Check current config
firebase functions:config:get

# Set price IDs
firebase functions:config:set \
  stripe.price_id_monthly="price_..." \
  stripe.price_id_annual="price_..."

# Redeploy
npm run deploy
```

#### Issue: "Webhook signature verification failed"

**Cause:** Webhook secret mismatch

**Solution:**
1. Get webhook signing secret from Stripe Dashboard
2. Update Firebase config:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
npm run deploy
```

#### Issue: User upgraded but still sees essentials features

**Cause:** Firestore not updated or frontend cache

**Solution:**
1. Check Firestore document manually
2. Verify webhook was received (Stripe Dashboard > Webhooks)
3. Check function logs for errors
4. Force refresh frontend (Ctrl+Shift+R)

#### Issue: "Already exists" error when trying to upgrade

**Cause:** User already has an active subscription

**Solution:**
- Direct user to manage subscription instead
- Check `stripeSubscriptionStatus` in Firestore
- Verify in Stripe Dashboard

## Key Security Features

✅ **Authentication Required** - All endpoints validate Firebase Auth
✅ **Webhook Signature Verification** - Prevents fake webhook requests
✅ **Price ID Validation** - Only configured prices accepted
✅ **Duplicate Prevention** - Checks for existing subscriptions
✅ **HTTPS Only** - All communication encrypted
✅ **PCI Compliance** - No card data touches our servers
✅ **Error Logging** - All errors tracked in Sentry
✅ **Audit Trail** - Firestore records all subscription changes

## Related Documentation

- [Stripe Cloud Functions Guide](./STRIPE_CLOUD_FUNCTIONS_GUIDE.md) - Implementation guide
- [Stripe API Documentation](https://stripe.com/docs/api) - Stripe API reference
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout) - Checkout integration guide
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions) - Cloud Functions guide
