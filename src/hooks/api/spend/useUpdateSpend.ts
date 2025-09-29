import type { ISpend } from '@/domain/Spend';
import { useLogging } from '@/hooks';
import { useUpdateMultipleWalletBalances } from '@/hooks/api/wallet';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  SPENDING_SUBCOLLECTION,
  mapFromFirestore,
  mapToFirestore,
} from './spendUtils';

export function useUpdateSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();
  const updateMultipleWalletBalances = useUpdateMultipleWalletBalances();

  return useMutation({
    mutationFn: async ({
      accountId,
      spendId,
      data,
    }: {
      accountId: string;
      spendId: string;
      data: Partial<ISpend>;
    }) => {
      return Sentry.startSpan(
        { name: 'useUpdateSpend', op: 'mutation', attributes: { accountId, spendId } },
        async (span) => {
          const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
          const docSnap = await getDoc(spendRef);

          if (!docSnap.exists()) {
            throw new Error('Spend record not found');
          }

          const existingSpend = mapFromFirestore(spendId, docSnap.data());
          const updatedSpend = { ...existingSpend, ...data, updatedAt: new Date() };

          // Save updated spending transaction
          await setDoc(spendRef, mapToFirestore(updatedSpend));

          // Determine which wallets need balance updates
          const walletsToUpdate: Array<{ accountId: string; periodId: string; walletId: string }> =
            [];

          // Always update the current wallet (after the change)
          if (updatedSpend.walletId) {
            walletsToUpdate.push({
              accountId: updatedSpend.accountId,
              periodId: updatedSpend.periodId,
              walletId: updatedSpend.walletId,
            });
          }

          // If wallet changed, also update the previous wallet
          if (existingSpend.walletId && existingSpend.walletId !== updatedSpend.walletId) {
            walletsToUpdate.push({
              accountId: existingSpend.accountId,
              periodId: existingSpend.periodId,
              walletId: existingSpend.walletId,
            });
          }

          // Update wallet balances for affected wallets
          if (walletsToUpdate.length > 0) {
            await updateMultipleWalletBalances.mutateAsync(walletsToUpdate);
          }

          span.setAttributes({
            spendId: updatedSpend.id,
            oldWalletId: existingSpend.walletId || 'none',
            newWalletId: updatedSpend.walletId || 'none',
            walletChanged: existingSpend.walletId !== updatedSpend.walletId,
            walletsUpdated: walletsToUpdate.length,
          });

          return updatedSpend;
        },
      );
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
