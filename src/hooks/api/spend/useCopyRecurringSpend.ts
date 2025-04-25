import { type CreateSpendDTO, createSpend } from '@/domain/Spend';
import { db } from '@/infrastructure/firebase';
import { collection, doc, setDoc, query, where, getDocs } from '@firebase/firestore';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  ACCOUNTS_COLLECTION,
  SPENDING_SUBCOLLECTION,
  mapToFirestore,
  mapFromFirestore,
} from './spendUtils';
import { addMonths } from 'date-fns';

export function useCopyRecurringSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fromPeriodId,
      toPeriodId,
      accountId,
    }: { fromPeriodId: string; toPeriodId: string; accountId: string }) => {
      try {
        // Query all recurring spending records from the source period
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

        if (querySnapshot.empty) {
          return { accountId, periodId: toPeriodId, copied: 0 };
        }

        // Clone each recurring spend record
        const newSpends = [];

        for (const docSnapshot of querySnapshot.docs) {
          const existingSpend = mapFromFirestore(docSnapshot.id, docSnapshot.data());

          // Create new spend with updated periodId and date (+1 month)
          const newSpendData: CreateSpendDTO = {
            accountId: existingSpend.accountId,
            date: addMonths(existingSpend.date, 1), // Set date to one month later
            category: existingSpend.category,
            amount: existingSpend.amount,
            description: existingSpend.description,
            notes: '',
            periodId: toPeriodId, // Set the new period ID
            recurring: existingSpend.recurring,
          };

          // Create new spend document
          const newSpendRef = doc(
            collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
          );
          const newSpend = createSpend(newSpendData);
          const spendWithId = { ...newSpend, id: newSpendRef.id };

          // Save to Firestore
          await setDoc(newSpendRef, mapToFirestore(spendWithId));
          newSpends.push(spendWithId);
        }

        return { accountId, periodId: toPeriodId, copied: newSpends.length };
      } catch (error) {
        console.error('Error copying recurring spending records:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
    },
  });
}
