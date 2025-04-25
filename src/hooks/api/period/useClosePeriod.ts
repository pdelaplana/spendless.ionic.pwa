import { db } from '@/infrastructure/firebase';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  ACCOUNTS_COLLECTION,
  PERIODS_SUBCOLLECTION,
  mapFromFirestore,
  mapToFirestore,
} from './periodUtils';

export function useClosePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, periodId }: { accountId: string; periodId: string }) => {
      try {
        const docRef = doc(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION, periodId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Period not found');
        }

        const period = mapFromFirestore(periodId, docSnap.data());
        const closedPeriod = { ...period, closedAt: new Date(), updatedAt: new Date() };

        await setDoc(docRef, mapToFirestore(closedPeriod));
        return closedPeriod;
      } catch (error) {
        console.error('Error closing period:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ['useFetchPeriods', variables.accountId] });
    },
  });
}
