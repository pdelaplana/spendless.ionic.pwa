import { usePwaInstall } from '@/hooks/pwa/usePwaInstall';
import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { download } from 'ionicons/icons';
import type React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from './Button';

const DISMISS_STORAGE_KEY = 'pwa-install-dismissed-timestamp';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const CardContainer = styled(GlassCard)`
  position: relative;
  padding: ${designSystem.spacing.lg};
  background: linear-gradient(
    135deg,
    ${designSystem.colors.primary[500]} 0%,
    ${designSystem.colors.primary[600]} 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  font-size: ${designSystem.typography.fontSize.lg};
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

const WhiteButton = styled.button<{ $primary?: boolean }>`
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  border-radius: ${designSystem.borderRadius.md};
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${({ $primary }) =>
    $primary
      ? `
    background: ${designSystem.colors.surface};
    color: ${designSystem.colors.primary[600]};

    &:hover {
      background: ${designSystem.colors.gray[50]};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }
  `
      : `
    background: transparent;
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    &:active {
      background: rgba(255, 255, 255, 0.2);
    }
  `}

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

interface PwaInstallPromptProps {
  className?: string;
}

/**
 * PWA Install Prompt Card Component
 * Displays as an inline card in the page (not fixed position)
 * Manages dismissal state with 7-day re-prompt logic
 */
export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ className }) => {
  const { canInstall, isInstalled, installPwa } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if prompt should be shown based on dismissal timestamp
  useEffect(() => {
    const checkDismissalStatus = () => {
      const dismissedTimestamp = localStorage.getItem(DISMISS_STORAGE_KEY);

      if (!dismissedTimestamp) {
        // Never dismissed, show the prompt
        setIsDismissed(false);
        return;
      }

      const dismissedDate = Number.parseInt(dismissedTimestamp, 10);
      const now = Date.now();
      const timeSinceDismissal = now - dismissedDate;

      // Show again if more than 7 days have passed
      if (timeSinceDismissal >= SEVEN_DAYS_MS) {
        setIsDismissed(false);
        // Clear old timestamp so we can track new dismissal
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      } else {
        setIsDismissed(true);
      }
    };

    checkDismissalStatus();
  }, []);

  const handleInstall = async () => {
    try {
      await installPwa();
      // Clear dismissal timestamp on successful install
      localStorage.removeItem(DISMISS_STORAGE_KEY);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    // Store current timestamp when user dismisses
    const now = Date.now();
    localStorage.setItem(DISMISS_STORAGE_KEY, now.toString());
    setIsDismissed(true);
  };

  // Don't render if:
  // - App is not installable
  // - App is already installed
  // - User dismissed within last 7 days
  if (!canInstall || isInstalled || isDismissed) {
    return null;
  }

  return (
    <CardContainer className={className}>
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
            <WhiteButton $primary onClick={handleInstall}>
              Install App
            </WhiteButton>
            <WhiteButton onClick={handleDismiss}>Not Now</WhiteButton>
          </ActionArea>
        </ContentArea>
      </PromptContent>
    </CardContainer>
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
