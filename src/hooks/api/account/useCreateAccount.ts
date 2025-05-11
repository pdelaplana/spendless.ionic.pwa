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
    mutationFn: async ({ userId, data }: { userId: string; data: CreateAccountDTO }) => {
      return Sentry.startSpan({ name: 'useCreateAccount', attributes: data }, async (span) => {
        const docRef = doc(collection(db, ACCOUNTS_COLLECTION), userId);
        const account = createAccount(data);

        await setDoc(docRef, mapToFirestore(account));
        return { ...account, id: docRef.id };
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
