import { type CreateSpendDTO, createSpend } from '@/domain/Spend';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapToFirestore } from './spendUtils';

export function useCreateSpend() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (data: CreateSpendDTO) => {
      return Sentry.startSpan({ name: 'useCreateSpend', op: 'mutation' }, async (span) => {
        const spendingRef = collection(
          db,
          ACCOUNTS_COLLECTION,
          data.accountId,
          SPENDING_SUBCOLLECTION,
        );
        const newDocRef = doc(spendingRef);
        const spend = createSpend(data);
        const spendWithId = { ...spend, id: newDocRef.id };

        await setDoc(newDocRef, mapToFirestore(spendWithId));
        return spendWithId;
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
