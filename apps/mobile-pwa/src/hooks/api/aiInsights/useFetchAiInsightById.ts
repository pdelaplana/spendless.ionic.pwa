import type { IAiInsight } from '@/domain/AiInsight';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  AI_INSIGHTS_SUBCOLLECTION,
  mapFromFirestore,
} from './aiInsightsUtils';

export function useFetchAiInsightById(
  accountId: string | undefined,
  insightId: string | undefined,
) {
  const { logError } = useLogging();

  return useQuery<IAiInsight | null>({
    queryKey: ['aiInsight', accountId, insightId],
    queryFn: async () => {
      try {
        return Sentry.startSpan(
          {
            name: 'useFetchAiInsightById',
            attributes: { accountId, insightId },
          },
          async () => {
            // Check if both IDs are provided
            if (!accountId || !insightId) return null;

            const insightRef = doc(
              db,
              ACCOUNTS_COLLECTION,
              accountId,
              AI_INSIGHTS_SUBCOLLECTION,
              insightId,
            );
            const insightSnapshot = await getDoc(insightRef);

            if (!insightSnapshot.exists()) {
              return null;
            }

            return mapFromFirestore(insightSnapshot.id, insightSnapshot.data());
          },
        );
      } catch (error) {
        logError(error);
        throw error;
      }
    },
    enabled: !!accountId && !!insightId,
    // Cache for 10 minutes since individual insights don't change
    staleTime: 10 * 60 * 1000,
  });
}
