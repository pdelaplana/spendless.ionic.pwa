import type { ICoachSession } from '@/domain/CoachSession';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  COACH_SESSIONS_SUBCOLLECTION,
  sessionFromFirestore,
} from './coachSessionUtils';

export function useFetchCoachSessions(accountId: string | undefined) {
  const { logError } = useLogging();

  return useQuery<ICoachSession[]>({
    queryKey: ['useFetchCoachSessions', accountId],
    queryFn: async () => {
      return Sentry.startSpan({ name: 'useFetchCoachSessions' }, async () => {
        if (!accountId) return [];

        const sessionsRef = collection(
          db,
          ACCOUNTS_COLLECTION,
          accountId,
          COACH_SESSIONS_SUBCOLLECTION,
        );

        const q = query(
          sessionsRef,
          where('archivedAt', '==', null),
          orderBy('updatedAt', 'desc'),
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => sessionFromFirestore(doc.id, doc.data()));
      });
    },
    enabled: !!accountId,
  });
}
