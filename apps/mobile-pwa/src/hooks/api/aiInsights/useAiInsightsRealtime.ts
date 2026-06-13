import type { IAiInsight } from '@/domain/AiInsight';
import { useLogging } from '@/hooks';
import { db } from '@/infrastructure/firebase';
import { Timestamp, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useRef } from 'react';
import {
  ACCOUNTS_COLLECTION,
  AI_INSIGHTS_SUBCOLLECTION,
  mapFromFirestore,
} from './aiInsightsUtils';

interface UseAiInsightsRealtimeOptions {
  onNewInsight?: (insight: IAiInsight) => void;
  onError?: (error: Error) => void;
}

/**
 * Real-time listener for new AI insights
 * Listens for insights created in the last 5 minutes to detect newly generated insights
 */
export function useAiInsightsRealtime(
  accountId: string | undefined,
  options?: UseAiInsightsRealtimeOptions,
) {
  const { logError } = useLogging();
  const lastInsightIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    // Calculate timestamp for 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const insightsRef = collection(db, ACCOUNTS_COLLECTION, accountId, AI_INSIGHTS_SUBCOLLECTION);
    const q = query(
      insightsRef,
      where('generatedAt', '>=', Timestamp.fromDate(fiveMinutesAgo)),
      orderBy('generatedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            const insight = mapFromFirestore(change.doc.id, change.doc.data());

            // Only trigger callback if this is a new insight (not initial load)
            if (
              lastInsightIdRef.current !== null &&
              insight.id !== lastInsightIdRef.current &&
              options?.onNewInsight
            ) {
              options.onNewInsight(insight);
            }

            // Update last insight ID
            if (lastInsightIdRef.current === null || insight.generatedAt > new Date()) {
              lastInsightIdRef.current = insight.id ?? null;
            }
          }
        }
      },
      (error) => {
        logError(error);
        if (options?.onError) {
          options.onError(error as Error);
        }
      },
    );

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [accountId, options, logError]);
}
