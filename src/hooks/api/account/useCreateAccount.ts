import { type CreateAccountDTO, createAccount } from '@/domain/Account';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, mapToFirestore } from './accountUtils';

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: CreateAccountDTO }) => {
      return Sentry.startSpan({ name: 'useCreateAccount' }, async (span) => {
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
