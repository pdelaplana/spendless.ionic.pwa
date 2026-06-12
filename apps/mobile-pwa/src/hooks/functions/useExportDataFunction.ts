import * as Sentry from '@sentry/browser';
import { useMutation } from '@tanstack/react-query';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useLogging } from '../logging';

export function useExportDataFunction() {
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async () => {
      return Sentry.startSpan({ name: 'useExportDataFunction', attributes: {} }, async (span) => {
        const functions = getFunctions();

        const queueJob = httpsCallable(functions, 'queueJob');
        const response = await queueJob({ jobType: 'exportData', priority: 1 });
        return response.data;
      });
    },

    onError: (error) => {
      logError(error);
    },
  });
}
