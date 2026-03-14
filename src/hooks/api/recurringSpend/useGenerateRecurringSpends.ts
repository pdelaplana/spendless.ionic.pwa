import { calculateOccurrencesInPeriod } from '@/domain/RecurringSpend';
import { type CreateSpendDTO, createSpend } from '@/domain/Spend';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, doc, getDoc, getDocs, writeBatch } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PERIODS_SUBCOLLECTION,
  ACCOUNTS_COLLECTION as PERIOD_ACCOUNTS_COLLECTION,
  mapFromFirestore as mapPeriodFromFirestore,
} from '../period/periodUtils';
import {
  ACCOUNTS_COLLECTION as RECURRING_ACCOUNTS_COLLECTION,
  RECURRING_SPENDING_SUBCOLLECTION,
  mapFromFirestore as mapRecurringSpendFromFirestore,
} from '../recurringSpend/recurringSpendUtils';
import {
  ACCOUNTS_COLLECTION,
  SPENDING_SUBCOLLECTION,
  mapToFirestore as mapSpendToFirestore,
} from '../spend/spendUtils';
import { getWalletCollectionPath, mapWalletFromFirestore } from '../wallet/walletUtils';

export function useGenerateRecurringSpends() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, periodId }: { accountId: string; periodId: string }) => {
      return Sentry.startSpan(
        {
          name: 'useGenerateRecurringSpends',
          attributes: { accountId, periodId },
        },
        async (span) => {
          // Step 1: Fetch the period to get date range
          const periodPath = `${PERIOD_ACCOUNTS_COLLECTION}/${accountId}/${PERIODS_SUBCOLLECTION}/${periodId}`;
          const periodDoc = await getDoc(doc(db, periodPath));

          if (!periodDoc.exists()) {
            throw new Error('Period not found');
          }

          const period = mapPeriodFromFirestore(periodDoc.id, periodDoc.data());

          // Step 2: Fetch all active recurring spends
          const recurringSpendingPath = `${RECURRING_ACCOUNTS_COLLECTION}/${accountId}/${RECURRING_SPENDING_SUBCOLLECTION}`;
          const recurringSpendingSnapshot = await getDocs(collection(db, recurringSpendingPath));

          const activeRecurringSpends = recurringSpendingSnapshot.docs
            .map((doc) => mapRecurringSpendFromFirestore(doc.id, doc.data()))
            .filter((rs) => rs.isActive);

          if (activeRecurringSpends.length === 0) {
            return { accountId, periodId, generated: 0 };
          }

          // Step 3: Fetch wallets for the period
          const walletsPath = getWalletCollectionPath(accountId, periodId);
          let walletsSnapshot = await getDocs(collection(db, walletsPath));

          // Simple retry logic if no wallets found (wait for Firestore propagation)
          if (walletsSnapshot.empty) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            walletsSnapshot = await getDocs(collection(db, walletsPath));
          }

          // Create mapping: wallet name -> wallet ID
          const walletNameToId = new Map<string, string>();
          let defaultWalletId = '';

          for (const doc of walletsSnapshot.docs) {
            const wallet = mapWalletFromFirestore(doc.id, doc.data());
            walletNameToId.set(wallet.name.toLowerCase().trim(), wallet.id || '');
            if (wallet.isDefault) {
              defaultWalletId = wallet.id || '';
            }
          }

          // Step 4: Generate spend records
          const batch = writeBatch(db);
          let generatedCount = 0;

          for (const recurringSpend of activeRecurringSpends) {
            // Calculate all occurrences within the period
            const occurrences = calculateOccurrencesInPeriod(
              recurringSpend,
              period.startAt,
              period.endAt,
            );

            // Map wallet ID by name using the stable walletName property
            let walletId = '';
            if (recurringSpend.walletName) {
              const normalizedName = recurringSpend.walletName.toLowerCase().trim();
              walletId = walletNameToId.get(normalizedName) ?? '';
            }

            // Fallback to default wallet if no mapping found
            if (!walletId && defaultWalletId) {
              walletId = defaultWalletId;
            }

            // Create a spend record for each occurrence
            for (const occurrenceDate of occurrences) {
              const spendData: CreateSpendDTO = {
                accountId,
                periodId,
                walletId,
                date: occurrenceDate,
                description: recurringSpend.description,
                amount: recurringSpend.amount,
                category: recurringSpend.category,
                tags: recurringSpend.tags || [],
                notes: '',
                recurring: false, // Deprecated field, set to false
              };

              const spendRef = doc(
                collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
              );
              const spend = createSpend(spendData);
              const spendWithId = { ...spend, id: spendRef.id };

              batch.set(spendRef, mapSpendToFirestore(spendWithId));
              generatedCount++;
            }
          }

          // Commit the batch
          if (generatedCount > 0) {
            await batch.commit();
          }

          span.setAttributes({
            recurringSpendCount: activeRecurringSpends.length,
            generatedSpendCount: generatedCount,
          });

          return { accountId, periodId, generated: generatedCount };
        },
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate all spend-related queries for this account and period
      // We use partial keys to match queries with different date ranges
      queryClient.invalidateQueries({
        queryKey: ['useFetchSpendingByAccountId', variables.accountId, variables.periodId],
      });
      queryClient.invalidateQueries({
        queryKey: ['useFetchSpendingForCharts', variables.accountId, variables.periodId],
      });
      queryClient.invalidateQueries({
        queryKey: ['spending', variables.accountId, variables.periodId],
      });
      queryClient.invalidateQueries({
        queryKey: ['spendingTotals', variables.accountId, variables.periodId],
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
