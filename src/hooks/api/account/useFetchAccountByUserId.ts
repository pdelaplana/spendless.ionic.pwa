import { collection, doc, getDoc, query, where } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/infrastructure/firebase';
import { ACCOUNTS_COLLECTION, mapFromFirestore } from './accountUtils';
import * as Sentry from '@sentry/react';

export function useFetchAccountByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['useFetchAccountByUserId', userId],
    queryFn: async () => {
      return Sentry.startSpan(
        { name: 'useFetchAccountByUserId', attributes: { userId } },
        async (span) => {
          if (!userId) {
            throw new Error('User ID is required');
          }
          const accountRef = doc(collection(db, ACCOUNTS_COLLECTION), userId);
          const accountSnapshot = await getDoc(accountRef);
          if (!accountSnapshot.exists()) {
            throw new Error('Account not found');
          }
          return mapFromFirestore(accountSnapshot.id, accountSnapshot.data());
        },
      );
    },
    enabled: !!userId,
  });
}
