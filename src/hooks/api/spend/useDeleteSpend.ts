import { doc, deleteDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION } from './spendUtils';

export function useDeleteSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, spendId }: { accountId: string; spendId: string }) => {
      try {
        const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
        await deleteDoc(spendRef);
        return { accountId, spendId };
      } catch (error) {
        console.error('Error deleting spending record:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId] });
    },
  });
}
