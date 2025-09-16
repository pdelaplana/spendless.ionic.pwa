import type { CreateWalletDTO } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  SPENDING_SUBCOLLECTION,
  mapFromFirestore as mapSpendFromFirestore,
  mapToFirestore as mapSpendToFirestore,
} from '../spend/spendUtils';
import { useCreateWallet } from './useCreateWallet';
import { getWalletCollectionPath } from './walletUtils';

interface MigrateSpendingParams {
  accountId: string;
  periodId: string;
  targetSpend?: number;
}

export function useMigrateSpendingToWallets() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();
  const createWallet = useCreateWallet();

  return useMutation({
    mutationFn: async ({ accountId, periodId, targetSpend = 1000 }: MigrateSpendingParams) => {
      return Sentry.startSpan(
        {
          name: 'useMigrateSpendingToWallets',
          attributes: { accountId, periodId },
        },
        async (span) => {
          if (!accountId || !periodId) {
            throw new Error('Account ID and Period ID are required');
          }

          // Check if any spending exists without walletId
          const spendingQuery = query(
            collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
            where('periodId', '==', periodId),
          );

          const spendingSnapshot = await getDocs(spendingQuery);
          const spendingWithoutWallet = spendingSnapshot.docs
            .map((doc) => ({ id: doc.id, ...mapSpendFromFirestore(doc.id, doc.data()) }))
            .filter((spend) => !spend.walletId || spend.walletId === '');

          if (spendingWithoutWallet.length === 0) {
            span.setAttributes({ migrationsNeeded: 0, result: 'no-migration-needed' });
            return { migrationsNeeded: 0, walletCreated: false };
          }

          // Check if a default wallet already exists for this period
          const walletCollectionPath = getWalletCollectionPath(accountId, periodId);
          const walletQuery = query(
            collection(db, walletCollectionPath),
            where('isDefault', '==', true),
          );

          const walletSnapshot = await getDocs(walletQuery);
          let defaultWalletId: string;

          if (walletSnapshot.empty) {
            // Create a default wallet
            const defaultWalletData: CreateWalletDTO = {
              name: 'General',
              spendingLimit: targetSpend,
              isDefault: true,
              accountId,
              periodId,
            };

            const createdWallet = await createWallet.mutateAsync({
              accountId,
              periodId,
              data: defaultWalletData,
            });

            defaultWalletId = createdWallet.id || '';
            span.setAttributes({ walletCreated: true, defaultWalletId });
          } else {
            defaultWalletId = walletSnapshot.docs[0].id;
            span.setAttributes({ walletCreated: false, defaultWalletId });
          }

          // Update all spending without walletId to use the default wallet
          const batch = writeBatch(db);

          for (const spend of spendingWithoutWallet) {
            if (!spend.id) continue;

            const spendRef = doc(
              db,
              ACCOUNTS_COLLECTION,
              accountId,
              SPENDING_SUBCOLLECTION,
              spend.id,
            );
            const updatedSpend = {
              ...spend,
              walletId: defaultWalletId,
              updatedAt: new Date(),
            };

            batch.set(spendRef, mapSpendToFirestore(updatedSpend));
          }

          await batch.commit();

          span.setAttributes({
            migrationsNeeded: spendingWithoutWallet.length,
            result: 'migration-completed',
          });

          return {
            migrationsNeeded: spendingWithoutWallet.length,
            walletCreated: walletSnapshot.empty,
            defaultWalletId,
          };
        },
      );
    },
    onSuccess: (result, { accountId, periodId }) => {
      // Invalidate spending and wallet caches
      queryClient.invalidateQueries({ queryKey: ['spending', accountId, periodId] });
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });

      if (result.walletCreated) {
        queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });
      }
    },
    onError: (error) => {
      logError(error);
    },
  });
}
