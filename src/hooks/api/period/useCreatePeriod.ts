import { type CreatePeriodDTO, createPeriod, validatePeriod } from '@/domain/Period';
import { createWalletFromSetup } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getWalletCollectionPath, mapWalletToFirestore } from '../wallet/walletUtils';
import { ACCOUNTS_COLLECTION, PERIODS_SUBCOLLECTION, mapToFirestore } from './periodUtils';

export function useCreatePeriod() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, data }: { accountId: string; data: CreatePeriodDTO }) => {
      return Sentry.startSpan(
        {
          name: 'useCreatePeriod',
          attributes: {
            accountId,
            hasWalletSetup: !!(data.walletSetup && data.walletSetup.length > 0),
          },
        },
        async (span) => {
          if (!accountId) {
            throw new Error('Account ID is required');
          }

          // Create period
          const periodDocRef = doc(
            collection(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION),
          );
          const period = createPeriod(data);
          const periodWithId = { ...period, id: periodDocRef.id };

          // Validate period including wallet setup
          const validationErrors = validatePeriod(periodWithId);
          if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
          }

          // Use a batch to create period and wallets atomically
          const batch = writeBatch(db);

          // Add period to batch
          batch.set(periodDocRef, mapToFirestore(periodWithId));

          // Create wallets from setup if provided
          if (periodWithId.walletSetup && periodWithId.walletSetup.length > 0 && periodWithId.id) {
            const walletCollectionPath = getWalletCollectionPath(accountId, periodWithId.id);

            for (const walletSetup of periodWithId.walletSetup) {
              const walletDocRef = doc(collection(db, walletCollectionPath));
              const wallet = createWalletFromSetup(walletSetup, accountId, periodWithId.id);
              const walletWithId = { ...wallet, id: walletDocRef.id };

              batch.set(walletDocRef, mapWalletToFirestore(walletWithId));
            }

            span.setAttributes({
              walletsCreated: periodWithId.walletSetup.length,
              defaultWalletIncluded: periodWithId.walletSetup.some((w) => w.isDefault),
            });
          }

          // Commit the batch
          await batch.commit();

          span.setAttributes({
            periodId: periodWithId.id,
            periodName: periodWithId.name,
          });

          return periodWithId;
        },
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ['useFetchPeriods', variables.accountId] });

      // Also invalidate wallet queries for the new period
      queryClient.invalidateQueries({ queryKey: ['wallets', variables.accountId] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
