import * as Sentry from '@sentry/browser';
import { useMutation } from '@tanstack/react-query';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useLogging } from '../logging';

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Hook to create a Stripe Checkout session for premium subscription upgrade
 *
 * @example
 * ```tsx
 * const { mutate: createCheckoutSession, isPending } = useCreateCheckoutSession();
 *
 * const handleUpgrade = () => {
 *   createCheckoutSession(
 *     {
 *       priceId: STRIPE_PRICE_ID_MONTHLY,
 *       successUrl: `${window.location.origin}/subscription/success`,
 *       cancelUrl: `${window.location.origin}/subscription/cancel`,
 *     },
 *     {
 *       onSuccess: (data) => {
 *         // Redirect to Stripe Checkout
 *         window.location.href = data.url;
 *       },
 *     }
 *   );
 * };
 * ```
 */
export function useCreateCheckoutSession() {
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (params: CreateCheckoutSessionParams) => {
      return Sentry.startSpan(
        { name: 'useCreateCheckoutSession', attributes: {} },
        async (span) => {
          const functions = getFunctions();

          const createCheckoutSession = httpsCallable<
            CreateCheckoutSessionParams,
            CreateCheckoutSessionResponse
          >(functions, 'createCheckoutSession');

          console.log('Calling createCheckoutSession with params:', params);
          const response = await createCheckoutSession(params);
          return response.data;
        },
      );
    },

    onError: (error) => {
      logError(error);
    },
  });
}
