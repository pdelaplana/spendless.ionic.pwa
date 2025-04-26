import { collection, doc, setDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { createSpend, type CreateSpendDTO } from '@/domain/Spend';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapToFirestore } from './spendUtils';
import { useLogging } from '@/hooks';
import * as Sentry from '@sentry/browser';

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
