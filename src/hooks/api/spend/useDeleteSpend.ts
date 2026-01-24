import { useLogging } from '@/hooks';
import { useUpdateWalletBalance } from '@/hooks/api/wallet';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from './spendUtils';

export function useDeleteSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();
  const updateWalletBalance = useUpdateWalletBalance();

  return useMutation({
    mutationFn: async ({ accountId, spendId }: { accountId: string; spendId: string }) => {
      return Sentry.startSpan(
        { name: 'useDeleteSpend', op: 'mutation', attributes: { accountId, spendId } },
        async (span) => {
          // Get the spending record first to know which wallet to update
          const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
          const docSnap = await getDoc(spendRef);

          if (!docSnap.exists()) {
            throw new Error('Spend record not found');
          }

          const existingSpend = mapFromFirestore(spendId, docSnap.data());

          // Delete the spending record from Firestore
          await deleteDoc(spendRef);

          // Update wallet balance if the spend had a wallet
          if (existingSpend.walletId) {
            await updateWalletBalance.mutateAsync({
              accountId: existingSpend.accountId,
              periodId: existingSpend.periodId,
              walletId: existingSpend.walletId,
            });
          }

          span.setAttributes({
            deletedSpendId: spendId,
            walletId: existingSpend.walletId || 'none',
            amount: existingSpend.amount,
            category: existingSpend.category,
          });

          return {
            accountId,
            spendId,
            deletedSpend: existingSpend,
          };
        },
      );
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['useFetchSpendingByAccountId', data.accountId, data.deletedSpend.periodId],
      });
      queryClient.invalidateQueries({
        queryKey: ['useFetchSpendingForCharts'],
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
