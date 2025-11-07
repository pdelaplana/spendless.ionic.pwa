import { BasePageLayout, CenterContainer, Content } from '@/components/layouts';
import { Gap } from '@/components/shared';
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
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const SuccessIconContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.md};

  ion-icon {
    font-size: 5rem;
    color: ${designSystem.colors.success};
  }
`;

const SuccessTitle = styled.h1`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.textPrimary};
  margin: 0;
`;

const SuccessSubtitle = styled.p`
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

const InfoList = styled.ul`
  padding-left: ${designSystem.spacing.lg};
  margin: ${designSystem.spacing.md} 0;
  line-height: 1.8;
  color: ${designSystem.colors.textSecondary};

  li {
    margin-bottom: ${designSystem.spacing.xs};
  }
`;

/**
 * Page displayed after successful Stripe checkout
 *
 * This page confirms the successful payment and explains next steps.
 * The subscription will be activated automatically via webhook.
 */
const SubscriptionSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleReturnToApp = () => {
    history.push(ROUTES.SPENDING);
  };

  const handleGoToSettings = () => {
    history.push(ROUTES.SETTINGS);
  };

  return (
    <BasePageLayout
      title={t('subscription.success.title')}
      showBackButton={false}
      showProfileIcon={false}
    >
      <CenterContainer>
        <Content>
          <SuccessIconContainer>
            <IonIcon icon={checkmarkCircleOutline} />
            <SuccessTitle>{t('subscription.success.heading')}</SuccessTitle>
            <SuccessSubtitle>{t('subscription.success.subtitle')}</SuccessSubtitle>
          </SuccessIconContainer>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('subscription.success.whatHappensNext')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <MessageText>{t('subscription.success.confirmationMessage')}</MessageText>

              <InfoList>
                <li>{t('subscription.success.benefit1')}</li>
                <li>{t('subscription.success.benefit2')}</li>
                <li>{t('subscription.success.benefit3')}</li>
                <li>{t('subscription.success.benefit4')}</li>
              </InfoList>

              <MessageText>
                <strong>{t('subscription.success.note')}</strong>{' '}
                {t('subscription.success.activationNote')}
              </MessageText>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('subscription.success.manageTitle')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <MessageText>{t('subscription.success.manageDescription')}</MessageText>

              <IonButton expand='block' onClick={handleGoToSettings}>
                {t('subscription.success.goToSettings')}
              </IonButton>
            </IonCardContent>
          </IonCard>

          <Gap size={designSystem.spacing.md} />

          <IonButton
            expand='block'
            fill='outline'
            onClick={handleReturnToApp}
            className='ion-margin'
          >
            {t('subscription.success.returnToApp')}
          </IonButton>

          <div
            style={{
              textAlign: 'center',
              padding: designSystem.spacing.lg,
              color: designSystem.colors.textSecondary,
              fontSize: designSystem.typography.fontSize.sm,
            }}
          >
            <p>{t('subscription.success.thankYou')}</p>
          </div>

          <Gap size={designSystem.spacing.xl} />
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default SubscriptionSuccessPage;
