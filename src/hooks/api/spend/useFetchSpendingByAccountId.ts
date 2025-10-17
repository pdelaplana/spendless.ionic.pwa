import type { ISpend } from '@/domain/Spend';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useQuery } from '@tanstack/react-query';
import { Timestamp, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from './spendUtils';

export function useFetchSpendingByAccountId(
  accountId: string | undefined,
  periodId: string | undefined,
  startAt?: Date,
  endAt?: Date,
) {
  const { logError } = useLogging();
  return useQuery<Array<ISpend>>({
    queryKey: [
      'useFetchSpendingByAccountId',
      accountId,
      periodId,
      startAt?.toISOString(),
      endAt?.toISOString(),
    ],

    queryFn: async () => {
      try {
        return Sentry.startSpan(
          {
            name: 'useFetchSpendingByAccountId',
            attributes: { accountId, periodId },
          },
          async () => {
            // Check if accountId is provided
            if (!accountId) return [];

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

            // Fetch all spending data for the period (no pagination)
            const querySnapshot = await getDocs(q);
            const spending = querySnapshot.docs.map((doc) => mapFromFirestore(doc.id, doc.data()));

            return spending;
          },
        );
      } catch (error) {
        logError(error);
        throw error;
      }
    },
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache, same as useFetchSpendingForCharts
  });
}
