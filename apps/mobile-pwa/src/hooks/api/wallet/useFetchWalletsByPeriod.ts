import type { IWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { SPAN_STATUS_ERROR } from '@sentry/core';
import * as Sentry from '@sentry/react';
import { useQuery } from '@tanstack/react-query';
import { getWalletCollectionPath, mapWalletFromFirestore } from './walletUtils';

export function useFetchWalletsByPeriod(accountId: string, periodId: string) {
  const { logError } = useLogging();

  console.log('🔨 useFetchWalletsByPeriod called with:', { accountId, periodId });
  console.log('📋 Query key will be:', ['wallets', accountId, periodId]);

  const queryResult = useQuery({
    queryKey: ['wallets', accountId, periodId],
    queryFn: async (): Promise<IWallet[]> => {
      console.log('Fetching wallets for accountId:', accountId, 'periodId:', periodId);

      return Sentry.startSpan(
        {
          name: 'useFetchWalletsByPeriod',
          attributes: { accountId, periodId },
        },
        async (span) => {
          try {
            if (!accountId || !periodId) {
              throw new Error('Account ID and Period ID are required');
            }

            const walletsCollectionPath = getWalletCollectionPath(accountId, periodId);
            console.log('Fetching from collection path:', walletsCollectionPath);

            const walletsCollection = collection(db, walletsCollectionPath);

            // Order by isDefault (default wallet first), then by name
            const walletsQuery = query(
              walletsCollection,
              orderBy('isDefault', 'desc'),
              orderBy('name', 'asc'),
            );

            const querySnapshot = await getDocs(walletsQuery);
            console.log('Query snapshot size:', querySnapshot.size);

            const wallets: IWallet[] = [];
            for (const doc of querySnapshot.docs) {
              const wallet = mapWalletFromFirestore(doc.id, doc.data());
              console.log('Mapped wallet from Firestore:', wallet);
              wallets.push(wallet);
            }

            console.log('Final wallets array:', wallets);

            span.setAttributes({
              walletsCount: wallets.length,
              defaultWalletFound: wallets.some((w) => w.isDefault),
            });

            return wallets;
          } catch (error) {
            console.error('Error fetching wallets:', error);
            span.setStatus({ code: SPAN_STATUS_ERROR, message: (error as Error).message });

            throw error;
          }
        },
      );
    },
    enabled: !!accountId && !!periodId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Log when query is enabled/disabled
  console.log('Wallet query enabled:', !!accountId && !!periodId);

  return queryResult;
}
