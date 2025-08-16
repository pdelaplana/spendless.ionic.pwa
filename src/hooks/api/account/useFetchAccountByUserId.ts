import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/react';
import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, query, where } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, mapFromFirestore } from './accountUtils';

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
