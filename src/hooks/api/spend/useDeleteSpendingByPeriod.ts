import { collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION } from './spendUtils';

export function useDeleteSpendingByPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, periodId }: { accountId: string; periodId: string }) => {
      try {
        if (!accountId || !periodId) {
          throw new Error('Account ID and period ID are required');
        }

        // First, query all spending documents for this period
        const q = query(
          collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
          where('periodId', '==', periodId),
        );

        const querySnapshot = await getDocs(q);

        // Check if there are any documents to delete
        if (querySnapshot.empty) {
          return { success: true, count: 0 };
        }

        // Delete each document in a batch
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

        await Promise.all(deletePromises);

        return {
          success: true,
          count: querySnapshot.size,
          accountId,
          periodId,
        };
      } catch (error) {
        console.error('Error deleting spending records by period:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId] });
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
      queryClient.invalidateQueries({
        queryKey: ['spendingTotals', data.accountId, data.periodId],
      });
    },
  });
}
