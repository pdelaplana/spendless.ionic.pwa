import { calculateWalletAvailable, getWalletUsagePercentage } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, getDocs, query, where } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useQuery } from '@tanstack/react-query';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from '../spend/spendUtils';

export interface WalletBalance {
  walletId: string;
  currentBalance: number;
  spendingLimit: number;
  availableAmount: number;
  usagePercentage: number;
  transactionCount: number;
  isOverLimit: boolean;
}

export function useFetchWalletBalance(accountId: string, periodId: string, walletId: string) {
  const { logError } = useLogging();

  return useQuery({
    queryKey: ['wallet-balance', accountId, periodId, walletId],
    queryFn: async (): Promise<WalletBalance> => {
      return Sentry.startSpan(
        {
          name: 'useFetchWalletBalance',
          attributes: { accountId, periodId, walletId },
        },
        async (span) => {
          if (!accountId || !periodId || !walletId) {
            throw new Error('Account ID, Period ID, and Wallet ID are required');
          }

          // Get wallet information from wallets cache first
          const walletsQuery = query(
            collection(db, `accounts/${accountId}/periods/${periodId}/wallets`),
            where('__name__', '==', walletId),
          );

          const walletSnapshot = await getDocs(walletsQuery);
          if (walletSnapshot.empty) {
            throw new Error('Wallet not found');
          }

          const walletDoc = walletSnapshot.docs[0];
          const walletData = walletDoc.data();
          const spendingLimit = Number(walletData.spendingLimit || 0);

          // Query all spending transactions for this wallet
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
          let currentBalance = 0;
          let transactionCount = 0;

          for (const doc of spendingSnapshot.docs) {
            const spend = mapFromFirestore(doc.id, doc.data());
            currentBalance += spend.amount;
            transactionCount++;
          }

          // Create a mock wallet object for calculations
          const mockWallet = {
            id: walletId,
            accountId,
            periodId,
            name: walletData.name || '',
            spendingLimit,
            currentBalance,
            isDefault: walletData.isDefault || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const availableAmount = calculateWalletAvailable(mockWallet);
          const usagePercentage = getWalletUsagePercentage(mockWallet);
          const isOverLimit = currentBalance > spendingLimit;

          span.setAttributes({
            currentBalance,
            spendingLimit,
            availableAmount,
            usagePercentage,
            transactionCount,
            isOverLimit,
          });

          return {
            walletId,
            currentBalance,
            spendingLimit,
            availableAmount,
            usagePercentage,
            transactionCount,
            isOverLimit,
          };
        },
      );
    },
    enabled: !!accountId && !!periodId && !!walletId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
