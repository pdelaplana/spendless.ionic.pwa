import { type CreateSpendDTO, type ISpend, createSpend } from '@/domain/Spend';
import { useLogging } from '@/hooks';
import { useUpdateWalletBalance } from '@/hooks/api/wallet';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapToFirestore } from './spendUtils';

export function useCreateSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();
  const updateWalletBalance = useUpdateWalletBalance();

  return useMutation({
    mutationFn: async (data: CreateSpendDTO) => {
      return Sentry.startSpan({ name: 'useCreateSpend', op: 'mutation' }, async (span) => {
        if (!data.walletId) {
          throw new Error('Wallet ID is required for spending transactions');
        }

        const spendingRef = collection(
          db,
          ACCOUNTS_COLLECTION,
          data.accountId,
          SPENDING_SUBCOLLECTION,
        );
        const newDocRef = doc(spendingRef);
        const spend = createSpend(data);
        const spendWithId = { ...spend, id: newDocRef.id };

        // Save spending transaction (persisted to IndexedDB if offline)
        await setDoc(newDocRef, mapToFirestore(spendWithId));

        // Update wallet balance
        await updateWalletBalance.mutateAsync({
          accountId: data.accountId,
          periodId: data.periodId,
          walletId: data.walletId,
        });

        span.setAttributes({
          spendId: spendWithId.id,
          walletId: data.walletId,
          amount: data.amount,
          category: data.category,
        });

        return spendWithId;
      });
    },
    onMutate: async (data: CreateSpendDTO) => {
      // Optimistically update the cache with the new spend
      const optimisticSpend = {
        ...createSpend(data),
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      };

      // Cancel any outgoing refetches for all spending queries
      await queryClient.cancelQueries({
        queryKey: ['useFetchSpendingByAccountId', data.accountId],
      });

      // Get all matching query keys and update them
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({
        queryKey: ['useFetchSpendingByAccountId', data.accountId, data.periodId],
      });

      const previousValues: Map<string, ISpend[]> = new Map();

      // Update each matching query
      for (const query of queries) {
        const oldData = queryClient.getQueryData<ISpend[]>(query.queryKey);
        if (oldData) {
          previousValues.set(JSON.stringify(query.queryKey), oldData);
          queryClient.setQueryData<ISpend[]>(query.queryKey, [optimisticSpend, ...oldData]);
        }
      }

      // Return context with previous values for rollback
      return { previousValues };
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ['useFetchSpendingByAccountId', data.accountId, data.periodId],
      });
      queryClient.invalidateQueries({ queryKey: ['useFetchSpendingForCharts'] });
    },
    onError: (error, variables, context) => {
      // Rollback all optimistic updates on error
      if (context?.previousValues) {
        context.previousValues.forEach((oldData, queryKeyStr) => {
          const queryKey = JSON.parse(queryKeyStr);
          queryClient.setQueryData<ISpend[]>(queryKey, oldData);
        });
      }
      logError(error);
    },
  });
}
