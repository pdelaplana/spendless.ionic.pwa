import { useLogging } from '../logging';
import * as Sentry from '@sentry/browser';
import { useMutation } from '@tanstack/react-query';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

export function useExportDataFunction() {
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async () => {
      return Sentry.startSpan({ name: 'useExportDataFunction', attributes: {} }, async (span) => {
        const functions = getFunctions();

        /*
        if (window.location.hostname === 'localhost') {
          try {
            connectFunctionsEmulator(functions, 'localhost', 5001);
            console.log('Connected to Functions emulator');
          } catch (error) {
            console.log('Functions emulator already connected or error:', error);
          }
        }
        */

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
