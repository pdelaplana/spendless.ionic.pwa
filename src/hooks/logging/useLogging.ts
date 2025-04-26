import * as Sentry from '@sentry/browser';

export const useLogging = () => {
  const logError = (error: unknown) => {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error);
    }
    Sentry.captureException(error);
  };

  const logInfo = (message: string) => {
    console.info(message);
    Sentry.captureMessage(message, 'info');
  };

  return {
    logError,
    logInfo,
  };
};
