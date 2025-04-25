import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, PERIODS_SUBCOLLECTION, mapFromFirestore } from './periodUtils';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';

export function useFetchCurrentPeriod(accountId: string | undefined) {
  return useQuery({
    queryKey: ['useFetchCurrentPeriod', accountId],
    queryFn: async () => {
      try {
        if (!accountId) return null;

        const q = query(
          collection(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION),
          where('closedAt', '==', null),
          orderBy('startAt', 'desc'),
          limit(1),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return null;
        }

        const doc = querySnapshot.docs[0];
        return mapFromFirestore(doc.id, doc.data());
      } catch (error) {
        console.error('Error fetching current period:', error);
        throw error;
      }
    },
    enabled: !!accountId,
  });
}
