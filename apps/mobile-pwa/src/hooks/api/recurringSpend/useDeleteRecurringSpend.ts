import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDoc, doc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, RECURRING_SPENDING_SUBCOLLECTION } from './recurringSpendUtils';

export function useDeleteRecurringSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({
      accountId,
      recurringSpendId,
    }: {
      accountId: string;
      recurringSpendId: string;
    }) => {
      return Sentry.startSpan(
        {
          name: 'useDeleteRecurringSpend',
          op: 'mutation',
          attributes: { accountId, recurringSpendId },
        },
        async (span) => {
          const recurringSpendRef = doc(
            db,
            ACCOUNTS_COLLECTION,
            accountId,
            RECURRING_SPENDING_SUBCOLLECTION,
            recurringSpendId,
          );

          await deleteDoc(recurringSpendRef);

          span.setAttributes({
            deletedRecurringSpendId: recurringSpendId,
          });

          return {
            accountId,
            recurringSpendId,
          };
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['recurringSpends', data.accountId],
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
