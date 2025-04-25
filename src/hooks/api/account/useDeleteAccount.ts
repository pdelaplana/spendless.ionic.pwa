import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { ACCOUNTS_COLLECTION, mapFromFirestore } from './accountUtils';

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const docRef = doc(db, ACCOUNTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Account not found');
        }

        const account = mapFromFirestore(id, docSnap.data());
        await deleteDoc(docRef);
        return account;
      } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', data.userId] });
    },
  });
}
