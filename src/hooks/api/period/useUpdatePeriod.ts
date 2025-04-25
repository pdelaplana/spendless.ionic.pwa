import type { IPeriod } from '@/domain/Period';
import { db } from '@/infrastructure/firebase';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ACCOUNTS_COLLECTION,
  PERIODS_SUBCOLLECTION,
  mapFromFirestore,
  mapToFirestore,
} from './periodUtils';

export function useUpdatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      periodId,
      data,
    }: { accountId: string; periodId: string; data: Partial<IPeriod> }) => {
      const docRef = doc(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION, periodId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Period not found');
      }

      const existingPeriod = mapFromFirestore(periodId, docSnap.data());
      const updatedPeriod = { ...existingPeriod, ...data, updatedAt: new Date() };

      await setDoc(docRef, mapToFirestore(updatedPeriod));
      return updatedPeriod;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] });
    },
    onError: (error) => {
      console.error('Error updating period:', error);
    },
  });
}
