import { defineSecret, defineString } from 'firebase-functions/params';
import Stripe from 'stripe';

/**
 * Define Stripe configuration parameters using Firebase Functions v2 params API.
 * These can be set via environment variables (.env for local, Cloud Console for production)
 * or Cloud Secret Manager for sensitive values.
 */
export const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
export const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');
export const stripePriceIdMonthly = defineString('STRIPE_PRICE_ID_MONTHLY');
export const stripePriceIdAnnual = defineString('STRIPE_PRICE_ID_ANNUAL');

/**
 * Get the Stripe secret key from environment variables.
 * For local development: Uses STRIPE_SECRET_KEY from .env file
 * For production: Uses STRIPE_SECRET_KEY from Cloud Secret Manager or environment variables
 */
const getStripeSecretKey = (): string => {
  const key = stripeSecretKey.value();

  if (!key) {
    throw new Error(
      'Stripe secret key not configured. Set STRIPE_SECRET_KEY environment variable.',
    );
  }

  // Trim any whitespace, newlines, or carriage returns that might be in the secret
  return key.trim();
};

/**
 * Lazy-initialized Stripe client instance.
 * This is initialized on first use to avoid errors during deployment analysis.
 */
let stripeClient: Stripe | null = null;

/**
 * Get the Stripe client instance, initializing it if necessary.
 * Uses lazy initialization to avoid errors during deployment analysis.
 */
export const getStripe = (): Stripe => {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      apiVersion: '2025-02-24.acacia',
      appInfo: {
        name: 'Spendless Cloud Functions',
        version: '1.0.0',
      },
    });
  }
  return stripeClient;
};

/**
 * Legacy export for backwards compatibility.
 * @deprecated Use getStripe() instead for lazy initialization.
 */
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

/**
 * Get the Stripe webhook secret for signature verification.
 */
export const getWebhookSecret = (): string => {
  const secret = stripeWebhookSecret.value();

  if (!secret) {
    throw new Error(
      'Stripe webhook secret not configured. Set STRIPE_WEBHOOK_SECRET environment variable.',
    );
  }

  // Trim any whitespace, newlines, or carriage returns that might be in the secret
  return secret.trim();
};

/**
 * Get the monthly subscription price ID.
 */
export const getMonthlyPriceId = (): string => {
  const priceId = stripePriceIdMonthly.value();

  if (!priceId) {
    throw new Error(
      'Stripe monthly price ID not configured. Set STRIPE_PRICE_ID_MONTHLY environment variable.',
    );
  }

  return priceId;
};

/**
 * Get the annual subscription price ID.
 */
export const getAnnualPriceId = (): string => {
  const priceId = stripePriceIdAnnual.value();

  if (!priceId) {
    throw new Error(
      'Stripe annual price ID not configured. Set STRIPE_PRICE_ID_ANNUAL environment variable.',
    );
  }

  return priceId;
};

/**
 * Validate if a price ID is one of the allowed subscription price IDs.
 */
export const isValidPriceId = (priceId: string): boolean => {
  try {
    const monthlyPriceId = getMonthlyPriceId();
    const annualPriceId = getAnnualPriceId();
    return priceId === monthlyPriceId || priceId === annualPriceId;
  } catch {
    return false;
  }
};
