import { collection, doc, setDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/browser';
import { db } from '@/infrastructure/firebase';
import { createAccount, type CreateAccountDTO } from '@/domain/Account';
import { ACCOUNTS_COLLECTION, mapToFirestore } from './accountUtils';
import { useLogging } from '@/hooks';

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (data: CreateAccountDTO) => {
      return Sentry.startSpan({ name: 'useCreateAccount', attributes: data }, async (span) => {
        const docRef = doc(collection(db, ACCOUNTS_COLLECTION));
        const account = createAccount(data);
        const accountWithId = { ...account, id: docRef.id };

        await setDoc(docRef, mapToFirestore(accountWithId));
        return accountWithId;
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', data.userId] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
