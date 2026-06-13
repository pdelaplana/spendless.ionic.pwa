import * as Sentry from '@sentry/browser';
import { useCallback } from 'react';

export const useLogging = () => {
  const logError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error);
    }
    Sentry.captureException(error);
  }, []);

  const logInfo = useCallback((message: string) => {
    console.info(message);
    Sentry.captureMessage(message, 'info');
  }, []);

  return {
    logError,
    logInfo,
  };
};
