import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { ACCOUNTS_COLLECTION, mapFromFirestore } from './accountUtils';
import { useLogging } from '@/hooks';
import * as Sentry from '@sentry/react';

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (id: string) => {
      return Sentry.startSpan({ name: 'useDeleteAccount', attributes: { id } }, async (span) => {
        const docRef = doc(db, ACCOUNTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Account not found');
        }

        const account = mapFromFirestore(id, docSnap.data());
        await deleteDoc(docRef);
        return account;
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchAccountByUserId', data.id] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
