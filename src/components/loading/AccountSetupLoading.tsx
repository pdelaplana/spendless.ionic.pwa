import { BasePageLayout } from '@/components/layouts';
import { IonContent, IonSpinner } from '@ionic/react';
import styled from 'styled-components';

const AccountSetupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  text-align: center;
`;

const SetupMessage = styled.h2`
  margin-top: 1rem;
  color: var(--ion-color-primary);
`;

const SetupSubMessage = styled.p`
  margin-top: 0.5rem;
  color: var(--ion-color-medium);
`;

const AccountSetupLoading: React.FC = () => {
  return (
    <BasePageLayout
      title='Spending'
      showHeader={false}
      showBackButton={false}
      showLogo={false}
      showProfileIcon={false}
      showMenu={false}
      menuSide='end'
    >
      <IonContent>
        <AccountSetupContainer>
          <IonSpinner name='crescent' />
          <SetupMessage>Setting up your account...</SetupMessage>
          <SetupSubMessage>Please wait while we prepare your Spendless experience</SetupSubMessage>
        </AccountSetupContainer>
      </IonContent>
    </BasePageLayout>
  );
};

export default AccountSetupLoading;
