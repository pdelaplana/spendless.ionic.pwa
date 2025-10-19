import { usePwaUpdate } from '@/hooks/pwa/usePwaUpdate';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { checkmark, close, refresh } from 'ionicons/icons';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './Button';

const NotificationContainer = styled.div<{ isVisible: boolean; variant: 'update' | 'success' }>`
  position: fixed;
  top: ${designSystem.spacing.lg};
  left: ${designSystem.spacing.md};
  right: ${designSystem.spacing.md};
  background: ${(props) =>
    props.variant === 'success'
      ? designSystem.colors.primary[500]
      : designSystem.colors.primary[500]};
  color: ${designSystem.colors.text.inverse};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  box-shadow: ${designSystem.shadows.xl};
  z-index: 1001;
  transform: ${(props) => (props.isVisible ? 'translateY(0)' : 'translateY(-100%)')};
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: all 0.3s ease;
  max-width: 500px;
  margin: 0 auto;
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${designSystem.spacing.md};
`;

const IconContainer = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${designSystem.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${designSystem.colors.text.inverse};
`;

const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h3`
  margin: 0 0 ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.inverse};
  line-height: 1.3;
`;

const Description = styled.p`
  margin: 0 0 ${designSystem.spacing.md};
  font-size: ${designSystem.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
`;

const ActionArea = styled.div`
  display: flex;
  gap: ${designSystem.spacing.sm};
  flex-wrap: wrap;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${designSystem.spacing.sm};
  right: ${designSystem.spacing.sm};
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: ${designSystem.spacing.xs};
  border-radius: ${designSystem.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${designSystem.colors.text.inverse};
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const UpdateButton = styled(Button)`
  --background: rgba(255, 255, 255, 0.2);
  --background-hover: rgba(255, 255, 255, 0.3);
  --background-activated: rgba(255, 255, 255, 0.4);
  --color: ${designSystem.colors.text.inverse};
  --border-width: 1px;
  --border-color: rgba(255, 255, 255, 0.3);
  --border-style: solid;
`;

const LaterButton = styled(Button)`
  --background: transparent;
  --background-hover: rgba(255, 255, 255, 0.1);
  --background-activated: rgba(255, 255, 255, 0.2);
  --color: rgba(255, 255, 255, 0.9);
  --border-width: 1px;
  --border-color: rgba(255, 255, 255, 0.3);
  --border-style: solid;
`;

interface PwaUpdateNotificationProps {
  autoShow?: boolean;
  onUpdateStarted?: () => void;
  onUpdateCompleted?: () => void;
  className?: string;
}

export const PwaUpdateNotification: React.FC<PwaUpdateNotificationProps> = ({
  autoShow = true,
  onUpdateStarted,
  onUpdateCompleted,
  className,
}) => {
  const { updateAvailable, updateApplied, updateServiceWorker } = usePwaUpdate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    onUpdateStarted?.();

    try {
      updateServiceWorker();

      // Show updating state for a moment
      setTimeout(() => {
        setIsUpdating(false);
        onUpdateCompleted?.();
      }, 1000);
    } catch (error) {
      console.error('Error updating service worker:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);

    // Store dismissal in sessionStorage (only for current session)
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // Reset dismissal when a new update becomes available
  React.useEffect(() => {
    if (updateAvailable && !isDismissed) {
      sessionStorage.removeItem('pwa-update-dismissed');
    }
  }, [updateAvailable, isDismissed]);

  // Check if user has dismissed the notification in this session
  React.useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-update-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Show update applied success message
  const shouldShowSuccessMessage = updateApplied && !isDismissed;
  const shouldShowUpdateMessage = updateAvailable && !isDismissed && autoShow && !updateApplied;

  if (!shouldShowSuccessMessage && !shouldShowUpdateMessage) {
    return null;
  }

  if (shouldShowSuccessMessage) {
    return (
      <NotificationContainer isVisible={true} variant='success' className={className}>
        <CloseButton onClick={handleDismiss} aria-label='Dismiss notification'>
          <IonIcon icon={close} />
        </CloseButton>

        <NotificationContent>
          <IconContainer>
            <IonIcon icon={checkmark} />
          </IconContainer>

          <ContentArea>
            <Title>Update Complete!</Title>
            <Description>
              Spendless has been updated successfully. You're now using the latest version.
            </Description>
          </ContentArea>
        </NotificationContent>
      </NotificationContainer>
    );
  }

  return (
    <NotificationContainer
      isVisible={shouldShowUpdateMessage}
      variant='update'
      className={className}
    >
      <CloseButton onClick={handleDismiss} aria-label='Dismiss update notification'>
        <IonIcon icon={close} />
      </CloseButton>

      <NotificationContent>
        <IconContainer>
          <IonIcon icon={refresh} />
        </IconContainer>

        <ContentArea>
          <Title>Update Available</Title>
          <Description>
            A new version of Spendless is available with improvements and bug fixes.
          </Description>

          <ActionArea>
            <UpdateButton
              variant='outline'
              size='sm'
              onClick={handleUpdate}
              loading={isUpdating}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Now'}
            </UpdateButton>
            <LaterButton variant='ghost' size='sm' onClick={handleDismiss} disabled={isUpdating}>
              Later
            </LaterButton>
          </ActionArea>
        </ContentArea>
      </NotificationContent>
    </NotificationContainer>
  );
};

// Simplified update badge for use in app header or toolbar
interface PwaUpdateBadgeProps {
  onClick?: () => void;
  className?: string;
}

export const PwaUpdateBadge: React.FC<PwaUpdateBadgeProps> = ({ onClick, className }) => {
  const { updateAvailable } = usePwaUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <Button variant='primary' size='sm' startIcon={refresh} onClick={onClick} className={className}>
      Update Available
    </Button>
  );
};
