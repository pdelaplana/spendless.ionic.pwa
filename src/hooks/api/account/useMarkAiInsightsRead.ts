import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION } from './accountUtils';

export function useMarkAiInsightsRead() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (accountId: string) => {
      return Sentry.startSpan(
        { name: 'useMarkAiInsightsRead', attributes: { accountId } },
        async () => {
          if (!accountId) {
            throw new Error('Account ID is required');
          }
          const docRef = doc(db, ACCOUNTS_COLLECTION, accountId);
          await updateDoc(docRef, {
            lastAiCheckinAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        },
      );
    },
    onSuccess: (_, accountId) => {
      // Invalidate the account query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['useFetchAccountByUserId', accountId] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
