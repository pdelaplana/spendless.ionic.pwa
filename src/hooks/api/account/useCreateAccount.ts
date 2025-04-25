import { collection, doc, setDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { createAccount, type CreateAccountDTO } from '@/domain/Account';
import { ACCOUNTS_COLLECTION, mapToFirestore } from './accountUtils';

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountDTO) => {
      try {
        const docRef = doc(collection(db, ACCOUNTS_COLLECTION));
        const account = createAccount(data);
        const accountWithId = { ...account, id: docRef.id };

        await setDoc(docRef, mapToFirestore(accountWithId));
        return accountWithId;
      } catch (error) {
        console.error('Error creating account:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', data.userId] });
    },
  });
}
