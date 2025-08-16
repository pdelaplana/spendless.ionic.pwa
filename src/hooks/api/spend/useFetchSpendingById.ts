import { db } from '@/infrastructure/firebase';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from './spendUtils';

export function useFetchSpendingById(accountId: string | undefined, spendId: string | undefined) {
  return useQuery({
    queryKey: ['spending', accountId, spendId],
    queryFn: async () => {
      try {
        if (!accountId || !spendId) return null;

        const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
        const docSnap = await getDoc(spendRef);

        if (!docSnap.exists()) {
          throw new Error('Spending record not found');
        }

        return mapFromFirestore(spendId, docSnap.data());
      } catch (error) {
        console.error('Error fetching spending record:', error);
        throw error;
      }
    },
    enabled: !!accountId && !!spendId,
  });
}
