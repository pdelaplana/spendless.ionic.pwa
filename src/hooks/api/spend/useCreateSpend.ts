import { collection, doc, setDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { createSpend, type CreateSpendDTO } from '@/domain/Spend';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapToFirestore } from './spendUtils';

export function useCreateSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSpendDTO) => {
      try {
        const spendingRef = collection(
          db,
          ACCOUNTS_COLLECTION,
          data.accountId,
          SPENDING_SUBCOLLECTION,
        );
        const newDocRef = doc(spendingRef);
        const spend = createSpend(data);
        const spendWithId = { ...spend, id: newDocRef.id };

        await setDoc(newDocRef, mapToFirestore(spendWithId));
        return spendWithId;
      } catch (error) {
        console.error('Error creating spending record:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
    },
  });
}
