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
          console.log('🔄 useGenerateRecurringSpends called with:', { accountId, periodId });

          // Step 1: Fetch the period to get date range
          const periodPath = `${PERIOD_ACCOUNTS_COLLECTION}/${accountId}/${PERIODS_SUBCOLLECTION}/${periodId}`;
          const periodDoc = await getDoc(doc(db, periodPath));

          if (!periodDoc.exists()) {
            throw new Error('Period not found');
          }

          const period = mapPeriodFromFirestore(periodDoc.id, periodDoc.data());
          console.log('📅 Period:', {
            id: period.id,
            startAt: period.startAt,
            endAt: period.endAt,
          });

          // Step 2: Fetch all active recurring spends
          const recurringSpendingPath = `${RECURRING_ACCOUNTS_COLLECTION}/${accountId}/${RECURRING_SPENDING_SUBCOLLECTION}`;
          const recurringSpendingSnapshot = await getDocs(collection(db, recurringSpendingPath));

          const activeRecurringSpends = recurringSpendingSnapshot.docs
            .map((doc) => mapRecurringSpendFromFirestore(doc.id, doc.data()))
            .filter((rs) => rs.isActive);

          console.log(`📊 Found ${activeRecurringSpends.length} active recurring spends`);

          if (activeRecurringSpends.length === 0) {
            console.log('⚠️ No active recurring spends found');
            return { accountId, periodId, generated: 0 };
          }

          // Step 3: Fetch wallets for the period
          const walletsPath = getWalletCollectionPath(accountId, periodId);
          let walletsSnapshot = await getDocs(collection(db, walletsPath));

          // Simple retry logic if no wallets found (wait for Firestore propagation)
          if (walletsSnapshot.empty) {
            console.log('⏳ No wallets found initially, retrying in 500ms...');
            await new Promise((resolve) => setTimeout(resolve, 500));
            walletsSnapshot = await getDocs(collection(db, walletsPath));
          }

          if (walletsSnapshot.empty) {
            console.warn(
              '⚠️ No wallets found even after retry. Recurring spends might not be assigned correctly.',
            );
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

          console.log(`💰 Found ${walletNameToId.size} wallets, default: ${defaultWalletId}`);

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

            console.log(`📆 ${recurringSpend.description}: ${occurrences.length} occurrences`);

            // Map wallet ID by name
            let walletId = '';
            if (recurringSpend.walletId) {
              // Try to find wallet by ID first (in case it's the same wallet)
              const walletDoc = await getDoc(
                doc(db, `${walletsPath}/${recurringSpend.walletId}`),
              ).catch(() => null);

              if (walletDoc?.exists()) {
                walletId = recurringSpend.walletId;
              } else {
                // Wallet not found by ID, try to find by name
                // To do this, we'd need to know which period the old wallet was in.
                // Since we don't store that, we'll try to look it up in the wallets mapping
                // if we can at least get the wallet name from the GLOBAL recurring spend record
                // (Note: Currently we don't store the name in the recurring record,
                // so this fallback is limited. In the future we should store the name).
              }
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
            console.log(`✅ Generated ${generatedCount} spend records`);
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
      console.log('✅ useGenerateRecurringSpends onSuccess:', data);
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
      console.error('❌ useGenerateRecurringSpends onError:', error);
      logError(error);
    },
  });
}
