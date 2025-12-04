import type { AnalysisType } from '@/domain/AiInsight';
import * as Sentry from '@sentry/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useLogging } from '../logging';

interface TriggerAiCheckinParams {
  periodId?: string;
  analysisType?: AnalysisType;
}

interface TriggerAiCheckinResponse {
  success: boolean;
  message: string;
  jobId: string;
}

/**
 * Hook to manually trigger AI Checkin insight generation
 *
 * @example
 * ```tsx
 * const { mutate: triggerAiCheckin, isPending } = useTriggerAiCheckin();
 *
 * const handleGenerate = () => {
 *   triggerAiCheckin(
 *     {
 *       analysisType: 'weekly',
 *     },
 *     {
 *       onSuccess: (data) => {
 *         toast.success('Generating insights... This may take 10-30 seconds');
 *       },
 *       onError: (error) => {
 *         toast.error('Failed to generate insights');
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useTriggerAiCheckin() {
  const { logError } = useLogging();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TriggerAiCheckinParams = {}) => {
      return Sentry.startSpan({ name: 'useTriggerAiCheckin', attributes: {} }, async () => {
        const functions = getFunctions();

        const triggerAiCheckin = httpsCallable<TriggerAiCheckinParams, TriggerAiCheckinResponse>(
          functions,
          'triggerAiCheckin',
        );

        console.log('Calling triggerAiCheckin with params:', params);
        const response = await triggerAiCheckin(params);
        return response.data;
      });
    },

    onSuccess: (data, variables, context) => {
      // Invalidate AI insights queries to refetch after generation
      queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
    },

    onError: (error) => {
      logError(error);
    },
  });
}
