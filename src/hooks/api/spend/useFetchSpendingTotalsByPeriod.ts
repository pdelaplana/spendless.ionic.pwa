import { db } from '@/infrastructure/firebase';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION } from './spendUtils';

export function useFetchSpendingTotalsByPeriod(
  accountId: string | undefined,
  periodId: string | undefined,
) {
  return useQuery({
    queryKey: ['spendingTotals', accountId, periodId],
    queryFn: async () => {
      if (!accountId || !periodId) return { total: 0, categories: {} };

      const q = query(
        collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
        where('periodId', '==', periodId),
        orderBy('date', 'desc'),
      );
      const querySnapshot = await getDocs(q);

      let total = 0;
      const categories: Record<string, number> = {};

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        total += data.amount;

        if (categories[data.category]) {
          categories[data.category] += data.amount;
        } else {
          categories[data.category] = data.amount;
        }
      }

      return { total, categories };
    },
    enabled: !!accountId && !!periodId,
  });
}
