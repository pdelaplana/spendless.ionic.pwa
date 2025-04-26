import { doc, deleteDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION } from './spendUtils';
import { useLogging } from '@/hooks';
import * as Sentry from '@sentry/react';

export function useDeleteSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, spendId }: { accountId: string; spendId: string }) => {
      return Sentry.startSpan(
        { name: 'useDeleteSpend', op: 'mutation', attributes: { accountId, spendId } },
        async (span) => {
          // Delete the spending record from Firestore
          const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
          await deleteDoc(spendRef);
          return { accountId, spendId };
        },
      );
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
