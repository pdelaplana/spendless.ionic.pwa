import { collection, doc, setDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { createPeriod, type CreatePeriodDTO } from '@/domain/Period';
import { ACCOUNTS_COLLECTION, PERIODS_SUBCOLLECTION, mapToFirestore } from './periodUtils';

export function useCreatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, data }: { accountId: string; data: CreatePeriodDTO }) => {
      const docRef = doc(collection(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION));
      const period = createPeriod(data);
      const periodWithId = { ...period, id: docRef.id };

      await setDoc(docRef, mapToFirestore(periodWithId));
      return periodWithId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ['useFetchPeriods', variables.accountId] });
    },
  });
}
