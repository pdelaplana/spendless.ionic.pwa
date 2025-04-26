import {
  collection,
  query,
  where,
  orderBy,
  Timestamp,
  getDocs,
  startAfter,
  limit,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import * as Sentry from '@sentry/browser';
import { useInfiniteQuery } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import type { ISpend } from '@/domain/Spend';
import {
  ACCOUNTS_COLLECTION,
  SPENDING_SUBCOLLECTION,
  PAGE_SIZE,
  mapFromFirestore,
} from './spendUtils';
import { useLogging } from '@/hooks';

export function useFetchSpendingByAccountId(
  accountId: string | undefined,
  periodId: string | undefined,
  startAt?: Date,
  endAt?: Date,
) {
  const { logError } = useLogging();
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
        return Sentry.startSpan(
          {
            name: 'useFetchSpendingByAccountId',
            attributes: { accountId, periodId },
          },
          async () => {
            // Check if accountId is provided
            if (!accountId) return { spending: [], lastVisible: null };

            const spendingRef = collection(
              db,
              ACCOUNTS_COLLECTION,
              accountId,
              SPENDING_SUBCOLLECTION,
            );
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
          },
        );
      } catch (error) {
        logError(error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.lastVisible ?? undefined,
    enabled: !!accountId,
  });
}
