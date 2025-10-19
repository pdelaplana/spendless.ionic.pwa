import { useNetworkStatus } from '@/providers/networkStatus/useNetworkStatus';
import { IonIcon } from '@ionic/react';
import styled from '@emotion/styled';
import { cloudOfflineOutline, cloudDoneOutline, syncOutline } from 'ionicons/icons';

const FloatingStatusIcon = styled.div<{ isVisible: boolean; variant: 'offline' | 'syncing' }>`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: ${(props) => (props.isVisible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: ${(props) =>
    props.variant === 'offline' ? 'var(--ion-color-danger)' : 'var(--ion-color-warning)'};
  border-radius: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: ${(props) => (props.variant === 'offline' ? 'pulse 2s ease-in-out infinite' : 'none')};
  cursor: pointer;

  @keyframes pulse {
    0%,
    100% {
      transform: translateX(-50%) scale(1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    50% {
      transform: translateX(-50%) scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  ion-icon {
    font-size: 24px;
    color: white;
    ${(props) => props.variant === 'syncing' && 'animation: spin 1s linear infinite;'}
  }

  span {
    color: white;
    font-size: 14px;
    font-weight: 600;
  }

  &:hover {
    transform: translateX(-50%) scale(1.05);
  }
`;

const NetworkStatusNotifier: React.FC = () => {
  const { isOnline, isSyncing, hasPendingWrites } = useNetworkStatus();

  // Determine which status to show
  const showOffline = !isOnline;
  const showSyncing = isOnline && (isSyncing || hasPendingWrites);

  if (showOffline) {
    return (
      <FloatingStatusIcon isVisible={true} variant="offline" title="You are offline">
        <IonIcon icon={cloudOfflineOutline} />
        <span>Offline</span>
      </FloatingStatusIcon>
    );
  }

  if (showSyncing) {
    return (
      <FloatingStatusIcon isVisible={true} variant="syncing" title="Syncing data">
        <IonIcon icon={syncOutline} />
        <span>Syncing...</span>
      </FloatingStatusIcon>
    );
  }

  return null;
};

export default NetworkStatusNotifier;
