import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import type { ISpend } from '@/domain/Spend';
import {
  ACCOUNTS_COLLECTION,
  SPENDING_SUBCOLLECTION,
  mapFromFirestore,
  mapToFirestore,
} from './spendUtils';

export function useUpdateSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      spendId,
      data,
    }: {
      accountId: string;
      spendId: string;
      data: Partial<ISpend>;
    }) => {
      try {
        const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
        const docSnap = await getDoc(spendRef);

        if (!docSnap.exists()) {
          throw new Error('Spend record not found');
        }

        const existingSpend = mapFromFirestore(spendId, docSnap.data());
        const updatedSpend = { ...existingSpend, ...data, updatedAt: new Date() };

        await setDoc(spendRef, mapToFirestore(updatedSpend));
        return updatedSpend;
      } catch (error) {
        console.error('Error updating spending record:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId] });
    },
  });
}
