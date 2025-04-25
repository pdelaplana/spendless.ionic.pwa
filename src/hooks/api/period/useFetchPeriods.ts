import {
  collection,
  query,
  getDocs,
  orderBy,
  getAggregateFromServer,
  limit,
  sum,
  where,
} from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, PERIODS_SUBCOLLECTION, mapFromFirestore } from './periodUtils';
import { db } from '@/infrastructure/firebase';
import { useQuery } from '@tanstack/react-query';

export function useFetchPeriods(accountId: string | undefined) {
  return useQuery({
    queryKey: ['useFetchPeriods', accountId],
    queryFn: async () => {
      if (!accountId) return null;

      const q = query(
        collection(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION),
        orderBy('startAt', 'desc'),
        limit(50),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // First, get all periods
      const periods = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const period = mapFromFirestore(doc.id, doc.data());

          // Query all spends for this period
          const spendQuery = query(
            collection(db, ACCOUNTS_COLLECTION, accountId, 'spending'),
            where('periodId', '==', period.id),
          );

          const aggregateSnapshot = await getAggregateFromServer(spendQuery, {
            actualSpend: sum('amount'),
          });

          // Add actualSpend to the period object
          return {
            ...period,
            actualSpend: aggregateSnapshot.data().actualSpend,
          };
        }),
      );
      return periods;
    },
    enabled: !!accountId,
  });
}
