import type { IAiInsight } from '@/domain/AiInsight';
import type { AnalysisType } from '@/domain/AiInsight';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useQuery } from '@tanstack/react-query';
import {
  type QueryConstraint,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  AI_INSIGHTS_SUBCOLLECTION,
  mapFromFirestore,
} from './aiInsightsUtils';

interface FetchOptions {
  analysisType?: AnalysisType | 'all';
  limit?: number;
}

export function useFetchAiInsights(accountId: string | undefined, options?: FetchOptions) {
  const { logError } = useLogging();

  return useQuery<Array<IAiInsight>>({
    queryKey: ['aiInsights', accountId, options?.analysisType, options?.limit],
    queryFn: async () => {
      try {
        return Sentry.startSpan(
          {
            name: 'useFetchAiInsights',
            attributes: { accountId, analysisType: options?.analysisType },
          },
          async () => {
            // Check if accountId is provided
            if (!accountId) return [];

            const insightsRef = collection(
              db,
              ACCOUNTS_COLLECTION,
              accountId,
              AI_INSIGHTS_SUBCOLLECTION,
            );

            // Build query with all constraints
            const queryConstraints: QueryConstraint[] = [orderBy('generatedAt', 'desc')];

            // Add analysis type filter if provided and not 'all'
            if (options?.analysisType && options.analysisType !== 'all') {
              queryConstraints.push(where('analysisType', '==', options.analysisType));
            }

            // Add limit if provided
            if (options?.limit) {
              queryConstraints.push(limit(options.limit));
            }

            const q = query(insightsRef, ...queryConstraints);
            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map((doc) => mapFromFirestore(doc.id, doc.data()));

            return results;
          },
        );
      } catch (error) {
        logError(error);
        throw error;
      }
    },
    enabled: !!accountId,
    // Cache for 5 minutes since insights don't change frequently
    staleTime: 5 * 60 * 1000,
  });
}
