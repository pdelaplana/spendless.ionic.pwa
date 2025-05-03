import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import type { IAccount } from '@/domain/Account';
import { ACCOUNTS_COLLECTION, mapFromFirestore, mapToFirestore } from './accountUtils';
import { useLogging } from '@/hooks';
import * as Sentry from '@sentry/browser';

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IAccount> }) => {
      return Sentry.startSpan(
        { name: 'useUpdateAccount', attributes: { id, data: JSON.stringify(data) } },
        async (span) => {
          if (!id) {
            throw new Error('Account ID is required');
          }
          const docRef = doc(db, ACCOUNTS_COLLECTION, id);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            throw new Error('Account not found');
          }
          const existingAccount = mapFromFirestore(id, docSnap.data());
          const updatedAccount = { ...existingAccount, ...data, updatedAt: new Date() };
          await setDoc(docRef, mapToFirestore(updatedAccount));
          return updatedAccount;
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchAccountByUserId', data.userId] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
