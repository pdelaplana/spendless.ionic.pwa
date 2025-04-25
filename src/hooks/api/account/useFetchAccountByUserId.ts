import { collection, getDocs, query, where } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { ACCOUNTS_COLLECTION, mapFromFirestore } from './accountUtils';

export function useFetchAccountByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['account', userId],
    queryFn: async () => {
      try {
        if (!userId) return null;

        const q = query(collection(db, ACCOUNTS_COLLECTION), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return null;
        }

        const doc = querySnapshot.docs[0];
        return mapFromFirestore(doc.id, doc.data());
      } catch (error) {
        console.error('Error fetching account:', error);
        throw error;
      }
    },
    enabled: !!userId,
  });
}
