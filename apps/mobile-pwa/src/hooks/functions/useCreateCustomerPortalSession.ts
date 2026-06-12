import * as Sentry from '@sentry/browser';
import { useMutation } from '@tanstack/react-query';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useLogging } from '../logging';

interface CreateCustomerPortalSessionParams {
  returnUrl?: string;
}

interface CreateCustomerPortalSessionResponse {
  url: string;
}

/**
 * Hook to create a Stripe Customer Portal session for subscription management
 *
 * Allows premium users to:
 * - Update payment method
 * - Cancel subscription
 * - View invoices
 * - View subscription details
 *
 * @example
 * ```tsx
 * const { mutate: createPortalSession, isPending } = useCreateCustomerPortalSession();
 *
 * const handleManageSubscription = () => {
 *   createPortalSession(
 *     {
 *       returnUrl: `${window.location.origin}/settings`,
 *     },
 *     {
 *       onSuccess: (data) => {
 *         // Redirect to Stripe Customer Portal
 *         window.location.href = data.url;
 *       },
 *     }
 *   );
 * };
 * ```
 */
export function useCreateCustomerPortalSession() {
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (params: CreateCustomerPortalSessionParams = {}) => {
      return Sentry.startSpan(
        { name: 'useCreateCustomerPortalSession', attributes: {} },
        async (span) => {
          const functions = getFunctions();

          const createCustomerPortalSession = httpsCallable<
            CreateCustomerPortalSessionParams,
            CreateCustomerPortalSessionResponse
          >(functions, 'createCustomerPortalSession');

          const response = await createCustomerPortalSession(params);
          return response.data;
        },
      );
    },

    onError: (error) => {
      logError(error);
    },
  });
}
