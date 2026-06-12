import type { IAccount } from '@/domain/Account';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION } from './aiInsightsUtils';

interface UpdateAiSettingsParams {
  accountId: string;
  aiCheckinEnabled?: boolean;
  lastAiCheckinAt?: Date;
}

/**
 * Hook to update AI Checkin settings on an account
 *
 * @example
 * ```tsx
 * const { mutate: updateAiSettings } = useUpdateAccountAiSettings();
 *
 * const handleToggle = (enabled: boolean) => {
 *   updateAiSettings(
 *     {
 *       accountId: account.id,
 *       aiCheckinEnabled: enabled,
 *     },
 *     {
 *       onSuccess: () => {
 *         toast.success(enabled ? 'AI Checkin enabled' : 'AI Checkin disabled');
 *       },
 *     }
 *   );
 * };
 * ```
 */
export function useUpdateAccountAiSettings() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (params: UpdateAiSettingsParams) => {
      return Sentry.startSpan(
        {
          name: 'useUpdateAccountAiSettings',
          attributes: {
            accountId: params.accountId,
            aiCheckinEnabled: params.aiCheckinEnabled,
          },
        },
        async () => {
          if (!params.accountId) {
            throw new Error('Account ID is required');
          }

          const docRef = doc(db, ACCOUNTS_COLLECTION, params.accountId);

          // Prepare Firestore update data
          const firestoreData: {
            updatedAt: Timestamp;
            aiCheckinEnabled?: boolean;
            lastAiCheckinAt?: Timestamp;
          } = {
            updatedAt: Timestamp.fromDate(new Date()),
          };

          if (params.aiCheckinEnabled !== undefined) {
            firestoreData.aiCheckinEnabled = params.aiCheckinEnabled;
          }

          if (params.lastAiCheckinAt !== undefined) {
            firestoreData.lastAiCheckinAt = Timestamp.fromDate(params.lastAiCheckinAt);
          }

          await updateDoc(docRef, firestoreData);

          // Return the updates for cache invalidation
          return {
            aiCheckinEnabled: params.aiCheckinEnabled,
            lastAiCheckinAt: params.lastAiCheckinAt,
          };
        },
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate account queries
      queryClient.invalidateQueries({
        queryKey: ['useFetchAccountByUserId', variables.accountId],
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
