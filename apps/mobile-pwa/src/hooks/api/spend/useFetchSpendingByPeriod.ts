import { db } from '@/infrastructure/firebase';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from './spendUtils';

export function useFetchSpendingByPeriod(
  accountId: string | undefined,
  periodId: string | undefined,
) {
  return useQuery({
    queryKey: ['spending', accountId, periodId],
    queryFn: async () => {
      if (!accountId || !periodId) return [];

      const q = query(
        collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
        where('periodId', '==', periodId),
        orderBy('date', 'desc'),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => mapFromFirestore(doc.id, doc.data()));
    },
    enabled: !!accountId && !!periodId,
  });
}
