import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { shouldShowIOSInstallPrompt } from '@/utils/platformDetection';
import { IonIcon } from '@ionic/react';
import { addCircleOutline, shareOutline } from 'ionicons/icons';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const IOS_DISMISS_STORAGE_KEY = 'ios-install-dismissed-timestamp';
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

const InstructionsList = styled.ol`
  margin: 0 0 ${designSystem.spacing.md};
  padding-left: ${designSystem.spacing.lg};
  font-size: ${designSystem.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;

  li {
    margin-bottom: ${designSystem.spacing.xs};
  }
`;

const InlineIcon = styled(IonIcon)`
  vertical-align: middle;
  margin: 0 4px;
  font-size: 1.2em;
`;

const ActionArea = styled.div`
  display: flex;
  gap: ${designSystem.spacing.sm};
  flex-wrap: wrap;
`;

const DismissButton = styled.button`
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  border-radius: ${designSystem.borderRadius.md};
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
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

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

interface IosInstallPromptProps {
  className?: string;
}

/**
 * iOS Install Prompt Card Component
 * Displays manual installation instructions for iOS Safari users
 * Manages dismissal state with 7-day re-prompt logic
 */
export const IosInstallPrompt: React.FC<IosInstallPromptProps> = ({ className }) => {
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if prompt should be shown based on dismissal timestamp
  useEffect(() => {
    const checkDismissalStatus = () => {
      const dismissedTimestamp = localStorage.getItem(IOS_DISMISS_STORAGE_KEY);

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
        localStorage.removeItem(IOS_DISMISS_STORAGE_KEY);
      } else {
        setIsDismissed(true);
      }
    };

    checkDismissalStatus();
  }, []);

  const handleDismiss = () => {
    // Store current timestamp when user dismisses
    const now = Date.now();
    localStorage.setItem(IOS_DISMISS_STORAGE_KEY, now.toString());
    setIsDismissed(true);
  };

  // Don't render if:
  // - Not on iOS device or already in standalone mode
  // - User dismissed within last 7 days
  if (!shouldShowIOSInstallPrompt() || isDismissed) {
    return null;
  }

  return (
    <CardContainer className={className}>
      <PromptContent>
        <IconContainer>
          <IonIcon icon={addCircleOutline} />
        </IconContainer>

        <ContentArea>
          <Title>{t('pwa.ios.title')}</Title>
          <Description>{t('pwa.ios.description')}</Description>

          <InstructionsList>
            <li>
              {t('pwa.ios.step1')}
              <InlineIcon icon={shareOutline} />
            </li>
            <li>{t('pwa.ios.step2')}</li>
          </InstructionsList>

          <ActionArea>
            <DismissButton onClick={handleDismiss}>{t('pwa.ios.dismiss')}</DismissButton>
          </ActionArea>
        </ContentArea>
      </PromptContent>
    </CardContainer>
  );
};
