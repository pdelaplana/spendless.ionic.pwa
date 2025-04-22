import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  deleteDoc,
  startAfter,
  limit,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import { createSpend, type ISpend, type CreateSpendDTO } from '@/domain/Spend';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

const ACCOUNTS_COLLECTION = 'accounts';
const SPENDING_SUBCOLLECTION = 'spending';
const PAGE_SIZE = 20;

// Mapper functions to handle Firestore data conversion
const mapToFirestore = (spend: ISpend): DocumentData => ({
  accountId: spend.accountId,
  date: Timestamp.fromDate(spend.date),
  category: spend.category,
  amount: Number(spend.amount),
  description: spend.description,
  notes: spend.notes,
  periodId: spend.periodId,
  createdAt: Timestamp.fromDate(spend.createdAt),
  updatedAt: Timestamp.fromDate(spend.updatedAt),
});

const mapFromFirestore = (id: string, data: DocumentData): ISpend => {
  const spend = createSpend({
    accountId: data.accountId,
    date: data.date.toDate(),
    category: data.category,
    amount: Number(data.amount),
    description: data.description,
    notes: data.notes,
    periodId: data.periodId,
  });

  return {
    ...spend,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

export function useFetchSpendingByAccountId(
  accountId: string | undefined,
  periodId: string | undefined,
  startAt?: Date,
  endAt?: Date,
) {
  return useInfiniteQuery<{
    spending: Array<ISpend>;
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  }>({
    queryKey: [
      'useFetchSpendingByAccountId',
      accountId,
      periodId,
      startAt?.toISOString(),
      endAt?.toISOString(),
    ],
    initialPageParam: null,

    queryFn: async ({ pageParam = null }) => {
      try {
        if (!accountId) return { spending: [], lastVisible: null };

        const spendingRef = collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION);
        let q = query(spendingRef, orderBy('date', 'desc'));

        // Add period filter if provided
        if (periodId) {
          q = query(q, where('periodId', '==', periodId));
        }

        // Add date range filters if provided
        if (startAt) {
          q = query(q, where('date', '>=', Timestamp.fromDate(startAt)));
        }
        if (endAt) {
          q = query(q, where('date', '<=', Timestamp.fromDate(endAt)));
        }

        // If we have a page param, start after that document
        if (pageParam) {
          q = query(q, startAfter(pageParam), limit(PAGE_SIZE));
        } else {
          q = query(q, limit(PAGE_SIZE));
        }

        const querySnapshot = await getDocs(q);
        const spending = querySnapshot.docs.map((doc) => mapFromFirestore(doc.id, doc.data()));
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        return {
          spending,
          lastVisible,
        };
      } catch (error) {
        console.error('Error fetching spending records:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.lastVisible ?? undefined,
    enabled: !!accountId,
  });
}

export function useCreateSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSpendDTO) => {
      try {
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
      } catch (error) {
        console.error('Error creating spending record:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
    },
  });
}

export function useUpdateSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      spendId,
      data,
    }: {
      accountId: string;
      spendId: string;
      data: Partial<ISpend>;
    }) => {
      try {
        const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
        const docSnap = await getDoc(spendRef);

        if (!docSnap.exists()) {
          throw new Error('Spend record not found');
        }

        const existingSpend = mapFromFirestore(spendId, docSnap.data());
        const updatedSpend = { ...existingSpend, ...data, updatedAt: new Date() };

        await setDoc(spendRef, mapToFirestore(updatedSpend));
        return updatedSpend;
      } catch (error) {
        console.error('Error updating spending record:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId] });
    },
  });
}

export function useDeleteSpend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, spendId }: { accountId: string; spendId: string }) => {
      try {
        const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
        await deleteDoc(spendRef);
        return { accountId, spendId };
      } catch (error) {
        console.error('Error deleting spending record:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId] });
    },
  });
}

export function useFetchSpendingById(accountId: string | undefined, spendId: string | undefined) {
  return useQuery({
    queryKey: ['spending', accountId, spendId],
    queryFn: async () => {
      try {
        if (!accountId || !spendId) return null;

        const spendRef = doc(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION, spendId);
        const docSnap = await getDoc(spendRef);

        if (!docSnap.exists()) {
          throw new Error('Spending record not found');
        }

        return mapFromFirestore(spendId, docSnap.data());
      } catch (error) {
        console.error('Error fetching spending record:', error);
        throw error;
      }
    },
    enabled: !!accountId && !!spendId,
  });
}

export function useSpendCategories() {
  return useQuery({
    queryKey: ['spendCategories'],
    queryFn: async () => {
      try {
        const spendingRef = collection(db, ACCOUNTS_COLLECTION);
        const q = query(spendingRef);
        const querySnapshot = await getDocs(q);

        const categories = new Set<string>();
        for (const doc of querySnapshot.docs) {
          const spendingSnapshot = await getDocs(collection(doc.ref, SPENDING_SUBCOLLECTION));
          for (const spendDoc of spendingSnapshot.docs) {
            const data = spendDoc.data();
            if (data.category) {
              categories.add(data.category);
            }
          }
        }

        return Array.from(categories);
      } catch (error) {
        console.error('Error fetching spend categories:', error);
        throw error;
      }
    },
  });
}

export function useFetchSpendingByPeriod(
  accountId: string | undefined,
  periodId: string | undefined,
) {
  return useQuery({
    queryKey: ['spending', accountId, periodId],
    queryFn: async () => {
      if (!accountId || !periodId) return [];

      const q = query(
        collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
        where('periodId', '==', periodId),
        orderBy('date', 'desc'),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => mapFromFirestore(doc.id, doc.data()));
    },
    enabled: !!accountId && !!periodId,
  });
}

export function useDeleteSpendingByPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, periodId }: { accountId: string; periodId: string }) => {
      try {
        if (!accountId || !periodId) {
          throw new Error('Account ID and period ID are required');
        }

        // First, query all spending documents for this period
        const q = query(
          collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
          where('periodId', '==', periodId),
        );

        const querySnapshot = await getDocs(q);

        // Check if there are any documents to delete
        if (querySnapshot.empty) {
          return { success: true, count: 0 };
        }

        // Delete each document in a batch
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

        await Promise.all(deletePromises);

        return {
          success: true,
          count: querySnapshot.size,
          accountId,
          periodId,
        };
      } catch (error) {
        console.error('Error deleting spending records by period:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId] });
      queryClient.invalidateQueries({ queryKey: ['spending', data.accountId, data.periodId] });
      queryClient.invalidateQueries({
        queryKey: ['spendingTotals', data.accountId, data.periodId],
      });
    },
  });
}

export function useFetchSpendingTotalsByPeriod(
  accountId: string | undefined,
  periodId: string | undefined,
) {
  return useQuery({
    queryKey: ['spendingTotals', accountId, periodId],
    queryFn: async () => {
      if (!accountId || !periodId) return { total: 0, categories: {} };

      const q = query(
        collection(db, ACCOUNTS_COLLECTION, accountId, SPENDING_SUBCOLLECTION),
        where('periodId', '==', periodId),
        orderBy('date', 'desc'),
      );
      const querySnapshot = await getDocs(q);

      let total = 0;
      const categories: Record<string, number> = {};

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        total += data.amount;

        if (categories[data.category]) {
          categories[data.category] += data.amount;
        } else {
          categories[data.category] = data.amount;
        }
      }

      return { total, categories };
    },
    enabled: !!accountId && !!periodId,
  });
}
