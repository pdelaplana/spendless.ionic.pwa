import type { IAccount } from '@/domain/Account';
import { useCreateCustomerPortalSession } from '@/hooks/functions';
import { useSubscription } from '@/hooks/subscription';
import { designSystem } from '@/theme/designSystem';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { format } from 'date-fns';
import { cardOutline, starOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { UpgradeButton } from './UpgradeButton';

const SubscriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.md};
  padding: ${designSystem.spacing.md};
  background: ${designSystem.colors.surface};
  border-radius: ${designSystem.borderRadius.md};
`;

const SubscriptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TierInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.xs};
`;

const TierName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
`;

const ExpiryInfo = styled.div`
  font-size: 0.9rem;
  color: ${designSystem.colors.textSecondary};
`;

const ExpiryWarning = styled(ExpiryInfo)`
  color: ${designSystem.colors.warning};
  font-weight: 500;
`;

interface SubscriptionCardProps {
  /**
   * User's account data
   */
  account: IAccount | null;
}

/**
 * Card component displaying subscription status and management options
 *
 * Shows:
 * - Current subscription tier (Essentials or Premium)
 * - Expiration date for premium users
 * - Upgrade button for essentials users
 * - Manage subscription button for premium users
 *
 * @example
 * ```tsx
 * const { account } = useSpendingAccount();
 * <SubscriptionCard account={account} />
 * ```
 */
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ account }) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const subscription = useSubscription(account);
  const { mutate: createPortalSession, isPending: isCreatingPortal } =
    useCreateCustomerPortalSession();

  const handleManageSubscription = () => {
    createPortalSession(
      {
        returnUrl: `${window.location.origin}/settings`,
      },
      {
        onSuccess: (data) => {
          // Redirect to Stripe Customer Portal
          window.location.href = data.url;
        },
        onError: () => {
          presentToast({
            message: t('subscription.portalError'),
            duration: 3000,
            color: 'danger',
          });
        },
      },
    );
  };

  return (
    <SubscriptionContainer>
      <SubscriptionHeader>
        <TierInfo>
          <TierName>
            {subscription.isPremium ? (
              <>
                <IonIcon icon={starOutline} />
                {t('subscription.premiumTier')}
                <IonBadge color='warning'>Premium</IonBadge>
              </>
            ) : (
              <>
                <IonIcon icon={cardOutline} />
                {t('subscription.essentialsTier')}
                <IonBadge color='medium'>Essentials</IonBadge>
              </>
            )}
          </TierName>

          {subscription.isPremium &&
            subscription.expiresAt &&
            (subscription.isExpiringSoon ? (
              <ExpiryWarning>
                {t('subscription.expiresOn', {
                  date: format(subscription.expiresAt, 'MMM dd, yyyy'),
                })}{' '}
                ({subscription.daysUntilExpiry}{' '}
                {subscription.daysUntilExpiry === 1 ? 'day' : 'days'} remaining)
              </ExpiryWarning>
            ) : (
              <ExpiryInfo>
                {t('subscription.renewsOn', {
                  date: format(subscription.expiresAt, 'MMM dd, yyyy'),
                })}
              </ExpiryInfo>
            ))}

          {subscription.isEssentials && (
            <ExpiryInfo>{t('subscription.essentialsDescription')}</ExpiryInfo>
          )}
        </TierInfo>
      </SubscriptionHeader>

      {subscription.isEssentials ? (
        <div style={{ display: 'flex', gap: designSystem.spacing.sm, flexDirection: 'column' }}>
          <UpgradeButton plan='monthly' expand='block' />
          <UpgradeButton plan='annual' expand='block' fill='outline'>
            {t('subscription.upgradeAnnualSave')}
          </UpgradeButton>
        </div>
      ) : (
        <IonButton
          onClick={handleManageSubscription}
          disabled={isCreatingPortal}
          fill='outline'
          expand='block'
        >
          {isCreatingPortal ? <IonSpinner name='crescent' /> : t('subscription.manageSubscription')}
        </IonButton>
      )}
    </SubscriptionContainer>
  );
};
