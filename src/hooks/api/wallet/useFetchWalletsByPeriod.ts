import type { IWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useQuery } from '@tanstack/react-query';
import { getWalletCollectionPath, mapWalletFromFirestore } from './walletUtils';

export function useFetchWalletsByPeriod(accountId: string, periodId: string) {
  const { logError } = useLogging();

  return useQuery({
    queryKey: ['wallets', accountId, periodId],
    queryFn: async (): Promise<IWallet[]> => {
      return Sentry.startSpan(
        {
          name: 'useFetchWalletsByPeriod',
          attributes: { accountId, periodId },
        },
        async (span) => {
          if (!accountId || !periodId) {
            throw new Error('Account ID and Period ID are required');
          }

          const walletsCollectionPath = getWalletCollectionPath(accountId, periodId);
          const walletsCollection = collection(db, walletsCollectionPath);

          // Order by isDefault (default wallet first), then by name
          const walletsQuery = query(
            walletsCollection,
            orderBy('isDefault', 'desc'),
            orderBy('name', 'asc'),
          );

          const querySnapshot = await getDocs(walletsQuery);

          const wallets: IWallet[] = [];
          for (const doc of querySnapshot.docs) {
            const wallet = mapWalletFromFirestore(doc.id, doc.data());
            wallets.push(wallet);
          }

          span.setAttributes({
            walletsCount: wallets.length,
            defaultWalletFound: wallets.some((w) => w.isDefault),
          });

          return wallets;
        },
      );
    },
    enabled: !!accountId && !!periodId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
