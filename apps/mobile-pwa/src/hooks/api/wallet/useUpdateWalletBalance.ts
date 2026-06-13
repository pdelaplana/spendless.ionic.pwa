import type { IWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, doc, getDocs, query, updateDoc, where } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from '../spend/spendUtils';
import { getWalletDocumentPath } from './walletUtils';

interface UpdateWalletBalanceParams {
  accountId: string;
  periodId: string;
  walletId: string;
}

export function useUpdateWalletBalance() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, periodId, walletId }: UpdateWalletBalanceParams) => {
      return Sentry.startSpan(
        {
          name: 'useUpdateWalletBalance',
          attributes: { accountId, periodId, walletId },
        },
        async (span) => {
          if (!accountId || !periodId || !walletId) {
            throw new Error('Account ID, Period ID, and Wallet ID are required');
          }

          // Query all spending transactions for this wallet to calculate new balance
          const spendingCollection = collection(
            db,
            ACCOUNTS_COLLECTION,
            accountId,
            SPENDING_SUBCOLLECTION,
          );
          const spendingQuery = query(
            spendingCollection,
            where('periodId', '==', periodId),
            where('walletId', '==', walletId),
          );

          const spendingSnapshot = await getDocs(spendingQuery);

          // Calculate current balance from spending transactions
          let newBalance = 0;
          let transactionCount = 0;

          for (const doc of spendingSnapshot.docs) {
            const spend = mapFromFirestore(doc.id, doc.data());
            newBalance += spend.amount;
            transactionCount++;
          }

          // Update wallet document with new balance
          const walletPath = getWalletDocumentPath(accountId, periodId, walletId);
          const walletRef = doc(db, walletPath);

          await updateDoc(walletRef, {
            currentBalance: newBalance,
            updatedAt: new Date(),
          });

          span.setAttributes({
            newBalance,
            transactionCount,
            balanceUpdated: true,
          });

          return {
            walletId,
            newBalance,
            transactionCount,
            updatedAt: new Date(),
          };
        },
      );
    },
    onSuccess: (result, { accountId, periodId, walletId }) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });
      queryClient.invalidateQueries({
        queryKey: ['wallet-balance', accountId, periodId, walletId],
      });

      // Update the wallets cache directly if available
      queryClient.setQueryData(
        ['wallets', accountId, periodId],
        (oldWallets: IWallet[] | undefined) => {
          if (!oldWallets) return oldWallets;

          return oldWallets.map((wallet) =>
            wallet.id === walletId
              ? { ...wallet, currentBalance: result.newBalance, updatedAt: result.updatedAt }
              : wallet,
          );
        },
      );
    },
    onError: (error) => {
      logError(error);
    },
  });
}

/**
 * Utility function to update multiple wallet balances at once
 * Useful for batch operations or when multiple wallets are affected
 */
export function useUpdateMultipleWalletBalances() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (wallets: UpdateWalletBalanceParams[]) => {
      return Sentry.startSpan(
        {
          name: 'useUpdateMultipleWalletBalances',
          attributes: { walletsCount: wallets.length },
        },
        async (span) => {
          const results = [];

          for (const { accountId, periodId, walletId } of wallets) {
            if (!accountId || !periodId || !walletId) {
              continue; // Skip invalid entries
            }

            try {
              // Calculate new balance for this wallet
              const spendingCollection = collection(
                db,
                ACCOUNTS_COLLECTION,
                accountId,
                SPENDING_SUBCOLLECTION,
              );
              const spendingQuery = query(
                spendingCollection,
                where('periodId', '==', periodId),
                where('walletId', '==', walletId),
              );

              const spendingSnapshot = await getDocs(spendingQuery);

              let newBalance = 0;
              for (const doc of spendingSnapshot.docs) {
                const spend = mapFromFirestore(doc.id, doc.data());
                newBalance += spend.amount;
              }

              // Update wallet document
              const walletPath = getWalletDocumentPath(accountId, periodId, walletId);
              const walletRef = doc(db, walletPath);

              await updateDoc(walletRef, {
                currentBalance: newBalance,
                updatedAt: new Date(),
              });

              results.push({
                walletId,
                accountId,
                periodId,
                newBalance,
                success: true,
              });
            } catch (error) {
              results.push({
                walletId,
                accountId,
                periodId,
                newBalance: 0,
                success: false,
                error,
              });
            }
          }

          span.setAttributes({
            walletsProcessed: results.length,
            successfulUpdates: results.filter((r) => r.success).length,
            failedUpdates: results.filter((r) => !r.success).length,
          });

          return results;
        },
      );
    },
    onSuccess: (results) => {
      // Invalidate queries for all affected periods
      const uniquePeriods = new Set(results.map((r) => `${r.accountId}-${r.periodId}`));

      for (const periodKey of uniquePeriods) {
        const [accountId, periodId] = periodKey.split('-');
        queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });
      }

      // Invalidate individual wallet balance queries
      for (const result of results.filter((r) => r.success)) {
        queryClient.invalidateQueries({
          queryKey: ['wallet-balance', result.accountId, result.periodId, result.walletId],
        });
      }
    },
    onError: (error) => {
      logError(error);
    },
  });
}
