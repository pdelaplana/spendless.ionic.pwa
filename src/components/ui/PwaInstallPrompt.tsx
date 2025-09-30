import { usePwaInstall } from '@/hooks/pwa/usePwaInstall';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { close, download } from 'ionicons/icons';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './Button';

const PromptContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: ${designSystem.spacing.lg};
  left: ${designSystem.spacing.md};
  right: ${designSystem.spacing.md};
  background: ${designSystem.colors.surface};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  box-shadow: ${designSystem.shadows.xl};
  z-index: 1000;
  transform: ${(props) => (props.isVisible ? 'translateY(0)' : 'translateY(100%)')};
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: all 0.3s ease;
  border: 1px solid ${designSystem.colors.gray[200]};
`;

const PromptContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${designSystem.spacing.md};
`;

const IconContainer = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: ${designSystem.colors.primary[500]};
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
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  line-height: 1.3;
`;

const Description = styled.p`
  margin: 0 0 ${designSystem.spacing.md};
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
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
  color: ${designSystem.colors.gray[500]};
  padding: ${designSystem.spacing.xs};
  border-radius: ${designSystem.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${designSystem.colors.gray[100]};
    color: ${designSystem.colors.text.secondary};
  }

  &:focus {
    outline: 2px solid ${designSystem.colors.primary[500]};
    outline-offset: 2px;
  }
`;

interface PwaInstallPromptProps {
  autoShow?: boolean;
  delay?: number;
  className?: string;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  autoShow = true,
  delay = 3000,
  className,
}) => {
  const { canInstall, isInstalled, installPwa } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Auto-show logic
  React.useEffect(() => {
    if (autoShow && canInstall && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, canInstall, isInstalled, isDismissed, delay]);

  const handleInstall = async () => {
    try {
      await installPwa();
      setShowPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);

    // Store dismissal in localStorage to persist across sessions
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if user has previously dismissed the prompt
  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Reset dismissal when app becomes installable again
  React.useEffect(() => {
    if (canInstall && !isInstalled) {
      // Reset dismissal after 7 days
      const dismissedDate = localStorage.getItem('pwa-install-dismissed-date');
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      if (!dismissedDate || Number.parseInt(dismissedDate) < sevenDaysAgo) {
        localStorage.removeItem('pwa-install-dismissed');
        localStorage.setItem('pwa-install-dismissed-date', Date.now().toString());
        setIsDismissed(false);
      }
    }
  }, [canInstall, isInstalled]);

  // Don't show if not installable, already installed, or dismissed
  if (!canInstall || isInstalled || isDismissed) {
    return null;
  }

  return (
    <PromptContainer isVisible={showPrompt} className={className}>
      <CloseButton onClick={handleDismiss} aria-label='Dismiss install prompt'>
        <IonIcon icon={close} />
      </CloseButton>

      <PromptContent>
        <IconContainer>
          <IonIcon icon={download} />
        </IconContainer>

        <ContentArea>
          <Title>Install Spendless</Title>
          <Description>
            Install our app for a better experience with offline access, faster loading, and native
            app features.
          </Description>

          <ActionArea>
            <Button variant='primary' size='sm' onClick={handleInstall}>
              Install App
            </Button>
            <Button variant='ghost' size='sm' onClick={handleDismiss}>
              Not Now
            </Button>
          </ActionArea>
        </ContentArea>
      </PromptContent>
    </PromptContainer>
  );
};

// Manual install button component for use in settings or other pages
interface PwaInstallButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  className,
}) => {
  const { canInstall, isInstalled, installPwa } = usePwaInstall();

  if (!canInstall || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installPwa();
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={download}
      onClick={handleInstall}
      className={className}
    >
      Install App
    </Button>
  );
};
