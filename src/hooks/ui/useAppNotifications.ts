import { useIonToast } from '@ionic/react';

export const useAppNotifications = () => {
  const [present] = useIonToast();

  const showNotification = (message: string, duration = 2000) => {
    present({
      message,
      duration,
      position: 'top',
    });
  };

  const showErrorNotification = (message: string, duration = 2000) => {
    present({
      message,
      duration,
      color: 'danger',
      position: 'top',
    });
  };

  return {
    showNotification,
    showErrorNotification,
  };
};
