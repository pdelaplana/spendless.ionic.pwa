import { BasePageLayout, CenterContainer, Content } from '@/components/layouts';
import { Gap } from '@/components/shared';
import { UpgradeButton } from '@/components/subscription';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const CancelIconContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.md};

  ion-icon {
    font-size: 5rem;
    color: ${designSystem.colors.textSecondary};
  }
`;

const CancelTitle = styled.h1`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.textPrimary};
  margin: 0;
`;

const CancelSubtitle = styled.p`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.textSecondary};
  margin: 0;
  text-align: center;
`;

const MessageText = styled.p`
  line-height: 1.6;
  color: ${designSystem.colors.textSecondary};
  margin: 0 0 ${designSystem.spacing.md} 0;
`;

const BenefitsList = styled.ul`
  padding-left: ${designSystem.spacing.lg};
  margin: ${designSystem.spacing.md} 0;
  line-height: 1.8;
  color: ${designSystem.colors.textSecondary};

  li {
    margin-bottom: ${designSystem.spacing.xs};
  }
`;

/**
 * Page displayed when user cancels Stripe checkout
 *
 * This page acknowledges the cancellation and provides options to try again
 * or return to the app.
 */
const SubscriptionCancelPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleReturnToApp = () => {
    history.push(ROUTES.SPENDING);
  };

  return (
    <BasePageLayout
      title={t('subscription.cancel.title')}
      showBackButton={false}
      showProfileIcon={false}
    >
      <CenterContainer>
        <Content>
          <CancelIconContainer>
            <IonIcon icon={closeCircleOutline} />
            <CancelTitle>{t('subscription.cancel.heading')}</CancelTitle>
            <CancelSubtitle>{t('subscription.cancel.subtitle')}</CancelSubtitle>
          </CancelIconContainer>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('subscription.cancel.noCharge')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <MessageText>{t('subscription.cancel.noChargeMessage')}</MessageText>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('subscription.cancel.whyUpgrade')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <MessageText>{t('subscription.cancel.premiumBenefits')}</MessageText>

              <BenefitsList>
                <li>{t('subscription.cancel.benefit1')}</li>
                <li>{t('subscription.cancel.benefit2')}</li>
                <li>{t('subscription.cancel.benefit3')}</li>
              </BenefitsList>

              <Gap size={designSystem.spacing.md} />

              <MessageText>
                <strong>{t('subscription.cancel.readyToUpgrade')}</strong>
              </MessageText>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}
              >
                <UpgradeButton plan='monthly' expand='block' />
                <UpgradeButton plan='annual' expand='block' fill='outline'>
                  {t('subscription.upgradeAnnualSave')}
                </UpgradeButton>
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton expand='block' fill='clear' onClick={handleReturnToApp}>
            {t('subscription.cancel.returnToApp')}
          </IonButton>

          <div
            style={{
              textAlign: 'center',
              padding: designSystem.spacing.lg,
              color: designSystem.colors.textSecondary,
              fontSize: designSystem.typography.fontSize.sm,
            }}
          >
            <p>{t('subscription.cancel.questions')}</p>
            <p style={{ marginTop: designSystem.spacing.xs }}>
              {t('subscription.cancel.contactSupport')}
            </p>
          </div>

          <Gap size={designSystem.spacing.xl} />
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default SubscriptionCancelPage;
