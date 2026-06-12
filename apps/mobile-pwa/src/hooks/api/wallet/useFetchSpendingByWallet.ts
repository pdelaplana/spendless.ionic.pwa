import type { ISpend } from '@/domain/Spend';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, getDocs, orderBy, query, where } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useQuery } from '@tanstack/react-query';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from '../spend/spendUtils';

export function useFetchSpendingByWallet(accountId: string, periodId: string, walletId: string) {
  const { logError } = useLogging();

  return useQuery({
    queryKey: ['spending-by-wallet', accountId, periodId, walletId],
    queryFn: async (): Promise<ISpend[]> => {
      return Sentry.startSpan(
        {
          name: 'useFetchSpendingByWallet',
          attributes: { accountId, periodId, walletId },
        },
        async (span) => {
          if (!accountId || !periodId || !walletId) {
            throw new Error('Account ID, Period ID, and Wallet ID are required');
          }

          const spendingCollection = collection(
            db,
            ACCOUNTS_COLLECTION,
            accountId,
            SPENDING_SUBCOLLECTION,
          );

          // Query spending filtered by period and wallet
          const spendingQuery = query(
            spendingCollection,
            where('periodId', '==', periodId),
            where('walletId', '==', walletId),
            orderBy('date', 'desc'), // Most recent first
          );

          const querySnapshot = await getDocs(spendingQuery);

          const spending: ISpend[] = [];
          for (const doc of querySnapshot.docs) {
            const spend = mapFromFirestore(doc.id, doc.data());
            spending.push(spend);
          }

          // Calculate totals for span attributes
          const totalAmount = spending.reduce((sum, spend) => sum + spend.amount, 0);
          const categoryCounts = spending.reduce(
            (counts, spend) => {
              counts[spend.category] = (counts[spend.category] || 0) + 1;
              return counts;
            },
            {} as Record<string, number>,
          );

          span.setAttributes({
            spendingCount: spending.length,
            totalAmount,
            categoryCounts: JSON.stringify(categoryCounts),
          });

          return spending;
        },
      );
    },
    enabled: !!accountId && !!periodId && !!walletId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch spending for all wallets in a period (for comparison)
export function useFetchSpendingByAllWallets(accountId: string, periodId: string) {
  const { logError } = useLogging();

  return useQuery({
    queryKey: ['spending-by-all-wallets', accountId, periodId],
    queryFn: async (): Promise<Record<string, ISpend[]>> => {
      return Sentry.startSpan(
        {
          name: 'useFetchSpendingByAllWallets',
          attributes: { accountId, periodId },
        },
        async (span) => {
          if (!accountId || !periodId) {
            throw new Error('Account ID and Period ID are required');
          }

          const spendingCollection = collection(
            db,
            ACCOUNTS_COLLECTION,
            accountId,
            SPENDING_SUBCOLLECTION,
          );

          // Query all spending for the period
          const spendingQuery = query(
            spendingCollection,
            where('periodId', '==', periodId),
            orderBy('date', 'desc'),
          );

          const querySnapshot = await getDocs(spendingQuery);

          // Group spending by wallet ID
          const spendingByWallet: Record<string, ISpend[]> = {};
          let totalSpending = 0;

          for (const doc of querySnapshot.docs) {
            const spend = mapFromFirestore(doc.id, doc.data());
            const walletId = spend.walletId || 'unassigned';

            if (!spendingByWallet[walletId]) {
              spendingByWallet[walletId] = [];
            }

            spendingByWallet[walletId].push(spend);
            totalSpending += spend.amount;
          }

          span.setAttributes({
            totalSpending,
            walletCount: Object.keys(spendingByWallet).length,
            totalTransactions: querySnapshot.size,
          });

          return spendingByWallet;
        },
      );
    },
    enabled: !!accountId && !!periodId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
