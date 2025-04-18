import { useEffect } from 'react';
import { useAppNotifications } from '@/hooks';

interface MutationNotificationHandlerProps {
  didSucceed?: boolean;
  didFail?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onNotified?: () => void;
}

/**
 * Handles showing notifications for mutation results
 *
 * @example
 * <MutationNotificationHandler
 *   didSucceed={didMutationSucceed}
 *   didFail={didMutationFail}
 *   onNotified={resetMutationState}
 * />
 */
export const MutationNotificationHandler: React.FC<MutationNotificationHandlerProps> = ({
  didSucceed = false,
  didFail = false,
  successMessage = 'Record saved successfully.',
  errorMessage = 'An error occurred while saving the record.',
  onNotified,
}) => {
  const { showErrorNotification, showNotification } = useAppNotifications();

  useEffect(() => {
    if (didFail) {
      console.error('Mutation failed');
      showErrorNotification(errorMessage);
      onNotified?.();
    }
    if (didSucceed) {
      console.log('Mutation succeeded');
      showNotification(successMessage);
      onNotified?.();
    }
  }, [
    didFail,
    didSucceed,
    showErrorNotification,
    showNotification,
    errorMessage,
    successMessage,
    onNotified,
  ]);

  return null;
};
