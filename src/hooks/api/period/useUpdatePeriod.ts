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
    onSuccess: async (updatedPeriod, variables) => {
      console.log('useUpdatePeriod: Mutation successful, updated period:', updatedPeriod);
      console.log('useUpdatePeriod: Refetching queries for accountId:', variables.accountId);

      // Use refetchQueries to immediately fetch fresh data instead of just invalidating
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] }),
        queryClient.refetchQueries({ queryKey: ['useFetchPeriods', variables.accountId] })
      ]);

      console.log('useUpdatePeriod: Query refetch completed');
    },
    onError: (error) => {
      console.error('Error updating period:', error);
    },
  });
}
