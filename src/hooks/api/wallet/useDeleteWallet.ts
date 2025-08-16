import type { IWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, deleteDoc, doc, getDocs, query, where } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION } from '../spend/spendUtils';
import { getWalletDocumentPath } from './walletUtils';

interface DeleteWalletParams {
  accountId: string;
  periodId: string;
  walletId: string;
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, periodId, walletId }: DeleteWalletParams) => {
      return Sentry.startSpan(
        {
          name: 'useDeleteWallet',
          attributes: { accountId, periodId, walletId },
        },
        async (span) => {
          if (!accountId || !periodId || !walletId) {
            throw new Error('Account ID, Period ID, and Wallet ID are required');
          }

          // Get current wallet data from cache
          const walletsCache = queryClient.getQueryData<IWallet[]>([
            'wallets',
            accountId,
            periodId,
          ]);
          const walletToDelete = walletsCache?.find((w) => w.id === walletId);

          if (!walletToDelete) {
            throw new Error('Wallet not found');
          }

          // Business rule: Cannot delete default wallet
          if (walletToDelete.isDefault) {
            throw new Error(
              'Cannot delete the default wallet. Please set another wallet as default first.',
            );
          }

          // Business rule: Cannot delete wallet with transactions
          const spendingCollection = collection(
            db,
            ACCOUNTS_COLLECTION,
            accountId,
            SPENDING_SUBCOLLECTION,
          );
          const spendingQuery = query(spendingCollection, where('walletId', '==', walletId));

          const spendingSnapshot = await getDocs(spendingQuery);
          if (!spendingSnapshot.empty) {
            throw new Error(
              'Cannot delete wallet with existing transactions. Please move or delete all transactions first.',
            );
          }

          // Business rule: Cannot delete the last wallet
          if (walletsCache && walletsCache.length <= 1) {
            throw new Error(
              'Cannot delete the last wallet. Each period must have at least one wallet.',
            );
          }

          // Delete the wallet from Firestore
          const walletPath = getWalletDocumentPath(accountId, periodId, walletId);
          const walletRef = doc(db, walletPath);
          await deleteDoc(walletRef);

          span.setAttributes({
            walletName: walletToDelete.name,
            wasDefault: walletToDelete.isDefault,
          });

          return walletToDelete;
        },
      );
    },
    onSuccess: (deletedWallet, { accountId, periodId }) => {
      // Invalidate wallet cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });

      // Remove wallet balance cache for deleted wallet
      queryClient.removeQueries({
        queryKey: ['wallet-balance', accountId, periodId, deletedWallet.id],
      });

      // Invalidate spending cache as wallet filtering may be affected
      queryClient.invalidateQueries({ queryKey: ['spending', accountId, periodId] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
