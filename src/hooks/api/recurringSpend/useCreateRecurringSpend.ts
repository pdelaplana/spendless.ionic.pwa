import {
  type CreateRecurringSpendDTO,
  type IRecurringSpend,
  createRecurringSpend,
} from '@/domain/RecurringSpend';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, setDoc } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  RECURRING_SPENDING_SUBCOLLECTION,
  mapToFirestore,
} from './recurringSpendUtils';

export function useCreateRecurringSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (data: CreateRecurringSpendDTO) => {
      return Sentry.startSpan({ name: 'useCreateRecurringSpend', op: 'mutation' }, async (span) => {
        const recurringSpendingRef = collection(
          db,
          ACCOUNTS_COLLECTION,
          data.accountId,
          RECURRING_SPENDING_SUBCOLLECTION,
        );
        const newDocRef = doc(recurringSpendingRef);
        const recurringSpend = createRecurringSpend(data);
        const recurringSpendWithId = { ...recurringSpend, id: newDocRef.id };

        await setDoc(newDocRef, mapToFirestore(recurringSpendWithId));

        span.setAttributes({
          recurringSpendId: recurringSpendWithId.id,
          walletId: data.walletId,
          amount: data.amount,
          scheduleFrequency: data.scheduleFrequency,
        });

        return recurringSpendWithId;
      });
    },
    onMutate: async (data: CreateRecurringSpendDTO) => {
      // Optimistically update the cache
      const optimisticRecurringSpend = {
        ...createRecurringSpend(data),
        id: `temp-${Date.now()}`,
      };

      await queryClient.cancelQueries({
        queryKey: ['recurringSpends', data.accountId],
      });

      const previousData = queryClient.getQueryData<IRecurringSpend[]>([
        'recurringSpends',
        data.accountId,
      ]);

      if (previousData) {
        queryClient.setQueryData<IRecurringSpend[]>(
          ['recurringSpends', data.accountId],
          [...previousData, optimisticRecurringSpend],
        );
      }

      return { previousData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['recurringSpends', data.accountId],
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<IRecurringSpend[]>(
          ['recurringSpends', variables.accountId],
          context.previousData,
        );
      }
      logError(error);
    },
  });
}
