import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  FREE_MESSAGES_DEFAULT,
  USER_PROFILE_EXTENSIONS_COLLECTION,
} from './coachSessionUtils';

const TRIAL_QUERY_KEY = 'useCoachTrialStatus';

export function useCoachTrialStatus(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  const query = useQuery<number>({
    queryKey: [TRIAL_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return FREE_MESSAGES_DEFAULT;

      const profileRef = doc(db, USER_PROFILE_EXTENSIONS_COLLECTION, userId);
      const snapshot = await getDoc(profileRef);

      if (!snapshot.exists() || snapshot.data().freeCoachMessagesRemaining === undefined) {
        // Initialize the counter on first access
        await setDoc(
          profileRef,
          { freeCoachMessagesRemaining: FREE_MESSAGES_DEFAULT },
          { merge: true },
        );
        return FREE_MESSAGES_DEFAULT;
      }

      return snapshot.data().freeCoachMessagesRemaining as number;
    },
    enabled: !!userId,
    staleTime: 0, // Always re-fetch to get latest count
  });

  const decrementMessages = async () => {
    if (!userId) return;

    const current = query.data ?? 0;
    if (current <= 0) return;

    const newCount = current - 1;

    // Optimistically update the cache
    queryClient.setQueryData([TRIAL_QUERY_KEY, userId], newCount);

    try {
      const profileRef = doc(db, USER_PROFILE_EXTENSIONS_COLLECTION, userId);
      await setDoc(profileRef, { freeCoachMessagesRemaining: newCount }, { merge: true });
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData([TRIAL_QUERY_KEY, userId], current);
      logError(error);
      throw error;
    }
  };

  return {
    messagesRemaining: query.data ?? FREE_MESSAGES_DEFAULT,
    hasTrialExpired: (query.data ?? FREE_MESSAGES_DEFAULT) <= 0,
    isLoading: query.isLoading,
    decrementMessages,
  };
}
