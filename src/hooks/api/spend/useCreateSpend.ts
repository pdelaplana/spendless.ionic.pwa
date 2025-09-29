import { type CreateSpendDTO, createSpend } from '@/domain/Spend';
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

        // Save spending transaction
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
      queryClient.invalidateQueries({ queryKey: ['useFetchSpendingForCharts'] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
