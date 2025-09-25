import { SpendlessLogo } from '@/components/brand';
import { designSystem } from '@/theme/designSystem';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import type React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AuthLoadingContainer = styled.div`
  min-height: 100vh;
  background: var(--ion-color-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${designSystem.spacing.xl};
  animation: ${fadeIn} 0.5s ease-out;
`;

const LogoContainer = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  animation: ${fadeIn} 0.7s ease-out;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.lg};
  animation: ${fadeIn} 0.9s ease-out;
`;

const LoadingMessage = styled.p`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.text.secondary};
  text-align: center;
  margin: 0;
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

const SpinnerContainer = styled.div`
  --color: ${designSystem.colors.primary[500]};
`;

const AuthLoadingScreen: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <AuthLoadingContainer>
          <LogoContainer>
            <SpendlessLogo variant='primary' size='large' />
          </LogoContainer>

          <LoadingContent>
            <SpinnerContainer>
              <IonSpinner name='crescent' />
            </SpinnerContainer>
            <LoadingMessage>Verifying authentication...</LoadingMessage>
          </LoadingContent>
        </AuthLoadingContainer>
      </IonContent>
    </IonPage>
  );
};

export default AuthLoadingScreen;
