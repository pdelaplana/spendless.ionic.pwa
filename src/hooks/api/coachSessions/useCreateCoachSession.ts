import { type CreateCoachSessionDTO, createCoachSession } from '@/domain/CoachSession';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, setDoc } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  COACH_SESSIONS_SUBCOLLECTION,
  sessionToFirestore,
} from './coachSessionUtils';

export function useCreateCoachSession() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (data: CreateCoachSessionDTO) => {
      return Sentry.startSpan({ name: 'useCreateCoachSession', op: 'mutation' }, async (span) => {
        const sessionsRef = collection(
          db,
          ACCOUNTS_COLLECTION,
          data.accountId,
          COACH_SESSIONS_SUBCOLLECTION,
        );
        const newDocRef = doc(sessionsRef);
        const session = createCoachSession(data);
        const sessionWithId = { ...session, id: newDocRef.id };

        await setDoc(newDocRef, sessionToFirestore(sessionWithId));

        span.setAttributes({ sessionId: sessionWithId.id, accountId: data.accountId });

        return sessionWithId;
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['useFetchCoachSessions', data.accountId],
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
