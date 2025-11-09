import type { IAccount } from '@/domain/Account';
import { useSubscription } from '@/hooks/subscription';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { lockClosedOutline } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const LockIcon = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: ${designSystem.spacing.md};
`;

const UpgradeCard = styled(IonCard)`
  text-align: center;
`;

const UpgradeTitle = styled.h3`
  color: ${designSystem.colors.primary};
  margin: 0 0 ${designSystem.spacing.sm} 0;
`;

const UpgradeDescription = styled.p`
  color: ${designSystem.colors.textSecondary};
  margin-bottom: ${designSystem.spacing.md};
`;

interface FeatureGateProps {
  /**
   * User's account (used to check subscription tier)
   */
  account: IAccount | null;

  /**
   * Child components to render if user has access
   */
  children: React.ReactNode;

  /**
   * Custom fallback component to render if user doesn't have access
   * If not provided, shows default upgrade prompt
   */
  fallback?: React.ReactNode;

  /**
   * Title for the upgrade prompt
   */
  upgradeTitle?: string;

  /**
   * Description for the upgrade prompt
   */
  upgradeDescription?: string;

  /**
   * Whether to show the upgrade button
   */
  showUpgradeButton?: boolean;
}

/**
 * Feature gate component that shows/hides content based on subscription tier
 *
 * Premium users see the children, essentials users see an upgrade prompt.
 *
 * @example
 * ```tsx
 * const { account } = useSpendingAccount();
 *
 * <FeatureGate
 *   account={account}
 *   upgradeTitle="Unlimited History"
 *   upgradeDescription="Upgrade to Premium to access unlimited spending history"
 * >
 *   <AdvancedAnalytics />
 * </FeatureGate>
 * ```
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  account,
  children,
  fallback,
  upgradeTitle = 'Premium Feature',
  upgradeDescription = 'This feature is available with Spendless Premium subscription.',
  showUpgradeButton = true,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const subscription = useSubscription(account);

  // Premium users get access
  if (subscription.isPremium) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  const handleUpgrade = () => {
    history.push('/settings');
  };

  return (
    <UpgradeCard>
      <IonCardHeader>
        <LockIcon>🔒</LockIcon>
        <IonCardTitle>
          <UpgradeTitle>{upgradeTitle}</UpgradeTitle>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <UpgradeDescription>{upgradeDescription}</UpgradeDescription>

        {showUpgradeButton && (
          <IonButton expand='block' color='primary' onClick={handleUpgrade}>
            {t('subscription.upgradeMonthly')}
          </IonButton>
        )}
      </IonCardContent>
    </UpgradeCard>
  );
};
