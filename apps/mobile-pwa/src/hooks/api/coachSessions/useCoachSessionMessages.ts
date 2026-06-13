import type { ICoachMessage } from '@/domain/CoachSession';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ACCOUNTS_COLLECTION,
  COACH_SESSIONS_SUBCOLLECTION,
  MESSAGES_SUBCOLLECTION,
  messageFromFirestore,
} from './coachSessionUtils';

interface UseCoachSessionMessagesReturn {
  messages: ICoachMessage[];
  isLoading: boolean;
  error: Error | null;
}

export function useCoachSessionMessages(
  accountId: string | undefined,
  sessionId: string | undefined,
): UseCoachSessionMessagesReturn {
  const [messages, setMessages] = useState<ICoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { logError } = useLogging();

  useEffect(() => {
    if (!accountId || !sessionId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const messagesRef = collection(
      db,
      ACCOUNTS_COLLECTION,
      accountId,
      COACH_SESSIONS_SUBCOLLECTION,
      sessionId,
      MESSAGES_SUBCOLLECTION,
    );

    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mapped = snapshot.docs.map((doc) => messageFromFirestore(doc.id, doc.data()));
        setMessages(mapped);
        setIsLoading(false);
      },
      (err) => {
        logError(err);
        setError(err as Error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [accountId, sessionId, logError]);

  return { messages, isLoading, error };
}
