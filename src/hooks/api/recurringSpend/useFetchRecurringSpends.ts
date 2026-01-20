import type { IRecurringSpend } from '@/domain/RecurringSpend';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  RECURRING_SPENDING_SUBCOLLECTION,
  mapFromFirestore,
} from './recurringSpendUtils';

export function useFetchRecurringSpends(accountId: string | undefined) {
  const { logError } = useLogging();

  return useQuery<Array<IRecurringSpend>>({
    queryKey: ['recurringSpends', accountId],

    queryFn: async () => {
      try {
        return Sentry.startSpan(
          {
            name: 'useFetchRecurringSpends',
            attributes: { accountId },
          },
          async () => {
            console.log('useFetchRecurringSpends - accountId:', accountId);

            if (!accountId) {
              console.log('useFetchRecurringSpends - no accountId, returning empty array');
              return [];
            }

            const recurringSpendingRef = collection(
              db,
              ACCOUNTS_COLLECTION,
              accountId,
              RECURRING_SPENDING_SUBCOLLECTION,
            );

            console.log(
              'useFetchRecurringSpends - collection path:',
              `${ACCOUNTS_COLLECTION}/${accountId}/${RECURRING_SPENDING_SUBCOLLECTION}`,
            );

            const q = query(
              recurringSpendingRef,
              where('isActive', '==', true),
              orderBy('description', 'asc'),
            );

            console.log('useFetchRecurringSpends - executing query...');
            const querySnapshot = await getDocs(q);
            console.log(
              'useFetchRecurringSpends - query returned',
              querySnapshot.docs.length,
              'documents',
            );

            const recurringSpends = querySnapshot.docs.map((doc) => {
              console.log('useFetchRecurringSpends - document:', doc.id, doc.data());
              return mapFromFirestore(doc.id, doc.data());
            });

            console.log('useFetchRecurringSpends - mapped recurringSpends:', recurringSpends);
            return recurringSpends;
          },
        );
      } catch (error) {
        console.error('useFetchRecurringSpends - error:', error);
        logError(error);
        throw error;
      }
    },
    enabled: !!accountId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
  });
}
