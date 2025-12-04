import { StyledIonCard } from '@/components/ui';
import type { IAccount } from '@/domain/Account';
import { useCreateCustomerPortalSession } from '@/hooks/functions';
import { useSubscription } from '@/hooks/subscription';
import { designSystem } from '@/theme/designSystem';
import {
  IonBadge,
  IonButton,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { format } from 'date-fns';
import { cardOutline, checkmarkCircleOutline, starOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TransparentIonList } from '../../styles/IonList.styled';
import { UpgradeButton } from './UpgradeButton';

const SubscriptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.md};
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

const PremiumBenefitsSection = styled.div`
  margin-top: ${designSystem.spacing.md};
  padding-top: ${designSystem.spacing.md};
  border-top: 1px solid ${designSystem.colors.gray[200]};
`;

const BenefitsSectionTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};
  margin-bottom: ${designSystem.spacing.sm};
`;

const BenefitItem = styled(IonItem)`
  --background: transparent;
  --border-color: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 32px;
`;

const BenefitIcon = styled(IonIcon)`
  font-size: 1.2rem;
  color: ${designSystem.colors.success};
  margin-right: ${designSystem.spacing.sm};
`;

const BenefitText = styled.span`
  color: ${designSystem.colors.textSecondary};
  font-size: 0.875rem;
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
    <StyledIonCard>
      <IonCardHeader>
        <IonCardTitle>Subscription</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className='ion-no-padding'>
        <TransparentIonList>
          <IonItem lines='none'>
            <IonLabel>
              <SubscriptionContent>
                <TierInfo>
                  <TierName>
                    {subscription.isPremium ? (
                      <>
                        <IonIcon icon={starOutline} />
                        {t('subscription.premiumTier')}
                        <IonBadge color={subscription.isCancelled ? 'medium' : 'warning'}>
                          Premium
                        </IonBadge>
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
                    (subscription.isCancelled ? (
                      <ExpiryInfo>
                        {t('subscription.subscriptionEndsOn', {
                          date: format(subscription.expiresAt, 'MMM dd, yyyy'),
                        })}
                      </ExpiryInfo>
                    ) : subscription.isExpiringSoon ? (
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

                {subscription.isEssentials && (
                  <PremiumBenefitsSection>
                    <BenefitsSectionTitle>
                      {t('subscription.premiumBenefitsTitle')}
                    </BenefitsSectionTitle>
                    <IonList lines='none' style={{ background: 'transparent', padding: 0 }}>
                      <BenefitItem>
                        <BenefitIcon icon={checkmarkCircleOutline} slot='start' />
                        <IonLabel>
                          <BenefitText>{t('subscription.benefits.unlimitedHistory')}</BenefitText>
                        </IonLabel>
                      </BenefitItem>
                      <BenefitItem>
                        <BenefitIcon icon={checkmarkCircleOutline} slot='start' />
                        <IonLabel>
                          <BenefitText>{t('subscription.benefits.aiInsights')}</BenefitText>
                        </IonLabel>
                      </BenefitItem>
                      <BenefitItem>
                        <BenefitIcon icon={checkmarkCircleOutline} slot='start' />
                        <IonLabel>
                          <BenefitText>{t('subscription.benefits.unlimitedWallets')}</BenefitText>
                        </IonLabel>
                      </BenefitItem>
                      <BenefitItem>
                        <BenefitIcon icon={checkmarkCircleOutline} slot='start' />
                        <IonLabel>
                          <BenefitText>{t('subscription.benefits.advancedAnalytics')}</BenefitText>
                        </IonLabel>
                      </BenefitItem>
                    </IonList>
                  </PremiumBenefitsSection>
                )}

                {subscription.isEssentials ? (
                  <div
                    style={{
                      display: 'flex',
                      gap: designSystem.spacing.sm,
                      flexDirection: 'column',
                    }}
                  >
                    <UpgradeButton plan='monthly' expand='block' size='large' />
                    <UpgradeButton plan='annual' expand='block' size='large' fill='outline'>
                      {t('subscription.upgradeAnnualSave')}
                    </UpgradeButton>
                  </div>
                ) : (
                  <IonButton
                    onClick={handleManageSubscription}
                    disabled={isCreatingPortal}
                    fill='outline'
                    expand='block'
                    size='large'
                  >
                    {isCreatingPortal ? (
                      <IonSpinner
                        name='dots'
                        style={{ height: designSystem.typography.fontSize.sm }}
                      />
                    ) : (
                      t('subscription.manageSubscription')
                    )}
                  </IonButton>
                )}
              </SubscriptionContent>
            </IonLabel>
          </IonItem>
        </TransparentIonList>
      </IonCardContent>
    </StyledIonCard>
  );
};
