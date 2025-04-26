import { useNetworkStatus } from '@/providers/networkStatus/useNetworkStatus';
import { IonToast } from '@ionic/react';

const NetworkStatusNotifier: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  return (
    <IonToast
      isOpen={!isOnline}
      positionAnchor={'main-header'}
      message='You are offline. Please check your internet connection.'
      position='top'
      color='danger'
      onDidDismiss={() => {}}
    />
  );
};

export default NetworkStatusNotifier;
