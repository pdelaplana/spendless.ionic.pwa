import type { ISpend } from '@/domain/Spend';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useQuery } from '@tanstack/react-query';
import { Timestamp, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, SPENDING_SUBCOLLECTION, mapFromFirestore } from './spendUtils';

export function useFetchSpendingForCharts(
  accountId: string | undefined,
  periodId: string | undefined,
  startAt?: Date,
  endAt?: Date,
) {
  const { logError } = useLogging();

  return useQuery<Array<ISpend>>({
    queryKey: [
      'useFetchSpendingForCharts',
      accountId,
      periodId,
      startAt?.toISOString(),
      endAt?.toISOString(),
    ],
    queryFn: async () => {
      try {
        return Sentry.startSpan(
          {
            name: 'useFetchSpendingForCharts',
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
            /*
            // Add date range filters if provided
            if (startAt) {
              q = query(q, where('date', '>=', Timestamp.fromDate(startAt)));
            }
            if (endAt) {
              q = query(q, where('date', '<=', Timestamp.fromDate(endAt)));
            }
            */
            // No pagination - fetch all data for charts
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => mapFromFirestore(doc.id, doc.data()));
          },
        );
      } catch (error) {
        logError(error);
        throw error;
      }
    },
    enabled: !!accountId,
    // Cache for 5 minutes since chart data doesn't need real-time updates
    staleTime: 5 * 60 * 1000,
  });
}
