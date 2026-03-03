import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { ACCOUNTS_COLLECTION, COACH_SESSIONS_SUBCOLLECTION } from './coachSessionUtils';

interface ArchiveCoachSessionParams {
  accountId: string;
  sessionId: string;
}

export function useArchiveCoachSession() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, sessionId }: ArchiveCoachSessionParams) => {
      return Sentry.startSpan({ name: 'useArchiveCoachSession', op: 'mutation' }, async (span) => {
        const sessionRef = doc(
          db,
          ACCOUNTS_COLLECTION,
          accountId,
          COACH_SESSIONS_SUBCOLLECTION,
          sessionId,
        );

        await updateDoc(sessionRef, { archivedAt: Timestamp.now() });

        span.setAttributes({ sessionId, accountId });
      });
    },
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: ['useFetchCoachSessions', accountId],
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
