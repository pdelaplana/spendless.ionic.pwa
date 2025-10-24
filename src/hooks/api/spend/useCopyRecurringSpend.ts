import { type CreateSpendDTO, createSpend } from '@/domain/Spend';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, differenceInDays } from 'date-fns';
import {
  PERIODS_SUBCOLLECTION,
  ACCOUNTS_COLLECTION as PERIOD_ACCOUNTS_COLLECTION,
  mapFromFirestore as mapPeriodFromFirestore,
} from '../period/periodUtils';
import {
  getWalletCollectionPath,
  getWalletDocumentPath,
  mapWalletFromFirestore,
} from '../wallet/walletUtils';
import {
  ACCOUNTS_COLLECTION,
  SPENDING_SUBCOLLECTION,
  mapFromFirestore,
  mapToFirestore,
} from './spendUtils';

export function useCopyRecurringSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({
      fromPeriodId,
      toPeriodId,
      accountId,
    }: { fromPeriodId: string; toPeriodId: string; accountId: string }) => {
      return Sentry.startSpan(
        {
          name: 'useCopyRecurringSpend',
          attributes: { fromPeriodId, toPeriodId, accountId },
        },
        async (span) => {
          console.log('🔄 useCopyRecurringSpend called with:', {
            fromPeriodId,
            toPeriodId,
            accountId,
          });

          // Step 1: Fetch periods and wallets from both periods
          const oldWalletsPath = getWalletCollectionPath(accountId, fromPeriodId);
          const newWalletsPath = getWalletCollectionPath(accountId, toPeriodId);

          const oldPeriodPath = `${PERIOD_ACCOUNTS_COLLECTION}/${accountId}/${PERIODS_SUBCOLLECTION}/${fromPeriodId}`;
          const newPeriodPath = `${PERIOD_ACCOUNTS_COLLECTION}/${accountId}/${PERIODS_SUBCOLLECTION}/${toPeriodId}`;

          const [oldWalletsSnapshot, newWalletsSnapshot, oldPeriodDoc, newPeriodDoc] =
            await Promise.all([
              getDocs(collection(db, oldWalletsPath)),
              getDocs(collection(db, newWalletsPath)),
              getDoc(doc(db, oldPeriodPath)),
              getDoc(doc(db, newPeriodPath)),
            ]);

          if (!oldPeriodDoc.exists() || !newPeriodDoc.exists()) {
            throw new Error('Period documents not found');
          }

          const oldPeriod = mapPeriodFromFirestore(oldPeriodDoc.id, oldPeriodDoc.data());
          const newPeriod = mapPeriodFromFirestore(newPeriodDoc.id, newPeriodDoc.data());

          // Create mapping: old wallet name -> old wallet ID
          const oldWalletNameToId = new Map<string, string>();
          for (const doc of oldWalletsSnapshot.docs) {
            const wallet = mapWalletFromFirestore(doc.id, doc.data());
            oldWalletNameToId.set(wallet.name.toLowerCase().trim(), wallet.id || '');
          }

          // Create mapping: new wallet name -> new wallet ID
          const newWalletNameToId = new Map<string, string>();
          let defaultNewWalletId = '';
          for (const doc of newWalletsSnapshot.docs) {
            const wallet = mapWalletFromFirestore(doc.id, doc.data());
            newWalletNameToId.set(wallet.name.toLowerCase().trim(), wallet.id || '');
            if (wallet.isDefault) {
              defaultNewWalletId = wallet.id || '';
            }
          }

          span.setAttributes({
            oldWalletsCount: oldWalletNameToId.size,
            newWalletsCount: newWalletNameToId.size,
          });

          // Step 2: Query all recurring spending records from the source period
          const spendingCollection = collection(
            db,
            ACCOUNTS_COLLECTION,
            accountId,
            SPENDING_SUBCOLLECTION,
          );
          const recurringQuery = query(
            spendingCollection,
            where('periodId', '==', fromPeriodId),
            where('recurring', '==', true),
          );

          const querySnapshot = await getDocs(recurringQuery);

          console.log('📊 Query results:', {
            isEmpty: querySnapshot.empty,
            docCount: querySnapshot.docs.length,
          });

          if (querySnapshot.empty) {
            console.log('⚠️ No recurring spends found in old period');
            return { accountId, periodId: toPeriodId, copied: 0 };
          }

          // Step 3: Clone each recurring spend record with mapped wallet IDs
          const newSpends = [];

          console.log(`🔁 Processing ${querySnapshot.docs.length} recurring spends`);

          for (const docSnapshot of querySnapshot.docs) {
            const existingSpend = mapFromFirestore(docSnapshot.id, docSnapshot.data());

            console.log('💰 Processing spend:', {
              id: existingSpend.id,
              description: existingSpend.description,
              amount: existingSpend.amount,
              walletId: existingSpend.walletId,
              recurring: existingSpend.recurring,
            });

            // Map the wallet ID from old to new period
            let newWalletId = '';
            if (existingSpend.walletId) {
              // Find the old wallet to get its name
              const oldWallet = oldWalletsSnapshot.docs
                .map((d) => mapWalletFromFirestore(d.id, d.data()))
                .find((w) => w.id === existingSpend.walletId);

              if (oldWallet) {
                // Look up the new wallet ID by name
                const walletName = oldWallet.name.toLowerCase().trim();
                newWalletId = newWalletNameToId.get(walletName) || '';
              }
            }

            // Fall back to default wallet if no mapping found
            if (!newWalletId && defaultNewWalletId) {
              newWalletId = defaultNewWalletId;
            }

            // Calculate the new date based on period start dates
            // This preserves the relative position of the spend within the period
            const daysFromOldPeriodStart = differenceInDays(existingSpend.date, oldPeriod.startAt);
            const newDate = addDays(newPeriod.startAt, daysFromOldPeriodStart);

            console.log('🗓️ Date calculation:', {
              oldPeriodStart: oldPeriod.startAt,
              oldSpendDate: existingSpend.date,
              daysFromStart: daysFromOldPeriodStart,
              newPeriodStart: newPeriod.startAt,
              calculatedDate: newDate,
              mappedWalletId: newWalletId,
            });

            // Create new spend with updated periodId, date, and mapped walletId
            // Copy all relevant fields from the existing spend to maintain data integrity
            const newSpendData: CreateSpendDTO = {
              accountId: existingSpend.accountId,
              date: newDate, // Calculated based on offset from old period start
              category: existingSpend.category,
              amount: existingSpend.amount,
              description: existingSpend.description,
              notes: existingSpend.notes || '',
              periodId: toPeriodId, // Set the new period ID
              walletId: newWalletId, // Use the mapped wallet ID
              recurring: existingSpend.recurring,
              tags: existingSpend.tags || [],
              emotionalState: existingSpend.emotionalState,
              satisfactionRating: existingSpend.satisfactionRating,
              necessityRating: existingSpend.necessityRating,
              personalReflections: existingSpend.personalReflections || [],
            };

            // Create new spend document
            const newSpendRef = doc(
              collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
            );
            const newSpend = createSpend(newSpendData);
            const spendWithId = { ...newSpend, id: newSpendRef.id };

            // Save to Firestore
            await setDoc(newSpendRef, mapToFirestore(spendWithId));
            console.log('✅ Created new spend:', {
              id: spendWithId.id,
              description: spendWithId.description,
              date: spendWithId.date,
              walletId: spendWithId.walletId,
            });
            newSpends.push(spendWithId);
          }

          console.log(`✨ Successfully copied ${newSpends.length} recurring spends`);

          // Step 4: Update wallet balances for all affected wallets
          const affectedWalletIds = new Set(
            newSpends.map((spend) => spend.walletId).filter(Boolean),
          );

          console.log(`💳 Updating balances for ${affectedWalletIds.size} wallets`);

          for (const walletId of affectedWalletIds) {
            if (!walletId) continue;

            // Calculate new balance for this wallet from all spending in the new period
            const walletSpendingQuery = query(
              collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
              where('periodId', '==', toPeriodId),
              where('walletId', '==', walletId),
            );

            const walletSpendingSnapshot = await getDocs(walletSpendingQuery);

            let newBalance = 0;
            for (const doc of walletSpendingSnapshot.docs) {
              const spend = mapFromFirestore(doc.id, doc.data());
              newBalance += spend.amount;
            }

            // Update wallet document with new balance
            const walletPath = getWalletDocumentPath(accountId, toPeriodId, walletId);
            const walletRef = doc(db, walletPath);

            await updateDoc(walletRef, {
              currentBalance: newBalance,
              updatedAt: new Date(),
            });

            console.log(`✅ Updated wallet ${walletId} balance to ${newBalance}`);
          }

          span.setAttributes({
            recurringSpendsCopied: newSpends.length,
            walletsUpdated: affectedWalletIds.size,
          });

          return { accountId, periodId: toPeriodId, copied: newSpends.length };
        },
      );
    },
    onSuccess: (data) => {
      console.log('✅ useCopyRecurringSpend onSuccess:', data);
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
      // Invalidate wallet queries to ensure fresh balance data
      queryClient.invalidateQueries({ queryKey: ['wallets', data.accountId, data.periodId] });
      // Invalidate chart spending queries to ensure scheduled spending displays correctly
      queryClient.invalidateQueries({
        queryKey: ['useFetchSpendingForCharts', data.accountId, data.periodId],
      });
    },
    onError: (error) => {
      console.error('❌ useCopyRecurringSpend onError:', error);
      logError(error);
    },
  });
}
