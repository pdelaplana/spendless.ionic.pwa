import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
  type DocumentData,
  deleteDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import { createPeriod, type IPeriod, type CreatePeriodDTO } from '@/domain/Period';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const ACCOUNTS_COLLECTION = 'accounts';
const PERIODS_SUBCOLLECTION = 'periods';

const mapToFirestore = (period: IPeriod): DocumentData => ({
  name: period.name,
  goals: period.goals,
  targetSpend: Number(period.targetSpend),
  targetSavings: Number(period.targetSavings),
  startAt: Timestamp.fromDate(period.startAt),
  endAt: Timestamp.fromDate(period.endAt),
  closedAt: period.closedAt ? Timestamp.fromDate(period.closedAt) : null,
  reflection: period.reflection,
  createdAt: Timestamp.fromDate(period.createdAt),
  updatedAt: Timestamp.fromDate(period.updatedAt),
});

const mapFromFirestore = (id: string, data: DocumentData): IPeriod => {
  const period = createPeriod({
    name: data.name,
    goals: data.goals,
    targetSpend: data.targetSpend,
    targetSavings: data.targetSavings,
    startAt: data.startAt.toDate(),
    endAt: data.endAt.toDate(),
    reflection: data.reflection,
  });

  return {
    ...period,
    id,
    closedAt: data.closedAt?.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

export function useFetchCurrentPeriod(accountId: string | undefined) {
  return useQuery({
    queryKey: ['useFetchCurrentPeriod', accountId],
    queryFn: async () => {
      try {
        if (!accountId) return null;

        const q = query(
          collection(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION),
          where('closedAt', '==', null),
          orderBy('startAt', 'desc'),
          limit(1),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return null;
        }

        const doc = querySnapshot.docs[0];
        return mapFromFirestore(doc.id, doc.data());
      } catch (error) {
        console.error('Error fetching current period:', error);
        throw error;
      }
    },
    enabled: !!accountId,
  });
}

export function useFetchPeriods(accountId: string | undefined) {
  return useQuery({
    queryKey: ['useFetchPeriods', accountId],
    queryFn: async () => {
      if (!accountId) return null;

      const q = query(
        collection(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION),
        orderBy('startAt', 'desc'),
        limit(50),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs.map((doc) => mapFromFirestore(doc.id, doc.data()));
    },
    enabled: !!accountId,
  });
}

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
    },
  });
}

export function useUpdatePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      periodId,
      data,
    }: { accountId: string; periodId: string; data: Partial<IPeriod> }) => {
      const docRef = doc(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION, periodId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Period not found');
      }

      const existingPeriod = mapFromFirestore(periodId, docSnap.data());
      const updatedPeriod = { ...existingPeriod, ...data, updatedAt: new Date() };

      await setDoc(docRef, mapToFirestore(updatedPeriod));
      return updatedPeriod;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] });
    },
  });
}

export function useClosePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, periodId }: { accountId: string; periodId: string }) => {
      const docRef = doc(db, ACCOUNTS_COLLECTION, accountId, PERIODS_SUBCOLLECTION, periodId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Period not found');
      }

      const period = mapFromFirestore(periodId, docSnap.data());
      const closedPeriod = { ...period, closedAt: new Date(), updatedAt: new Date() };

      await setDoc(docRef, mapToFirestore(closedPeriod));
      return closedPeriod;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['useFetchCurrentPeriod', variables.accountId] });
    },
  });
}
