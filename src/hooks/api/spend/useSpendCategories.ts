import { db } from '@/infrastructure/firebase';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION } from './spendUtils';

export function useSpendCategories() {
  return useQuery({
    queryKey: ['spendCategories'],
    queryFn: async () => {
      try {
        const spendingRef = collection(db, ACCOUNTS_COLLECTION);
        const q = query(spendingRef);
        const querySnapshot = await getDocs(q);

        const categories = new Set<string>();
        for (const doc of querySnapshot.docs) {
          const spendingSnapshot = await getDocs(collection(doc.ref, SPENDING_SUBCOLLECTION));
          for (const spendDoc of spendingSnapshot.docs) {
            const data = spendDoc.data();
            if (data.category) {
              categories.add(data.category);
            }
          }
        }

        return Array.from(categories);
      } catch (error) {
        console.error('Error fetching spend categories:', error);
        throw error;
      }
    },
  });
}
