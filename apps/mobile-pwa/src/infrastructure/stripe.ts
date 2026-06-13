import { loadStripe } from '@stripe/stripe-js';

/**
 * Stripe publishable key from environment variables
 * This is safe to expose in the frontend
 */
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

/**
 * Stripe instance promise
 * Load Stripe.js asynchronously to avoid blocking the main thread
 */
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

/**
 * Stripe price IDs from environment variables
 */
export const STRIPE_PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY;
export const STRIPE_PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_ANNUAL;
