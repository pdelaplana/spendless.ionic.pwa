import { db } from '@/infrastructure/firebase';
import { deleteDoc, doc } from '@firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ACCOUNTS_COLLECTION, PERIODS_SUBCOLLECTION } from './periodUtils';

export function useDeletePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, periodId }: { accountId: string; periodId: string }) => {
      try {
        const docRef = doc(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION, periodId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting period:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ['useFetchPeriods', variables.accountId] });
    },
  });
}
