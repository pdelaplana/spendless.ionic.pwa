import type { IRecurringSpend } from '@/domain/RecurringSpend';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  RECURRING_SPENDING_SUBCOLLECTION,
  mapFromFirestore,
  mapToFirestore,
} from './recurringSpendUtils';

export function useUpdateRecurringSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({
      accountId,
      recurringSpendId,
      data,
    }: {
      accountId: string;
      recurringSpendId: string;
      data: Partial<IRecurringSpend>;
    }) => {
      return Sentry.startSpan(
        {
          name: 'useUpdateRecurringSpend',
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
          const docSnap = await getDoc(recurringSpendRef);

          if (!docSnap.exists()) {
            throw new Error('Recurring spend record not found');
          }

          const existingRecurringSpend = mapFromFirestore(recurringSpendId, docSnap.data());
          const updatedRecurringSpend = {
            ...existingRecurringSpend,
            ...data,
            updatedAt: new Date(),
          };

          await setDoc(recurringSpendRef, mapToFirestore(updatedRecurringSpend));

          span.setAttributes({
            recurringSpendId: updatedRecurringSpend.id,
            walletId: updatedRecurringSpend.walletId,
          });

          return updatedRecurringSpend;
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
