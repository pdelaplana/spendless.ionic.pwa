import { SpendlessLogo } from '@/components/brand';
import { designSystem } from '@/theme/designSystem';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import type React from 'react';
import styled, { css, keyframes } from 'styled-components';

// Animation speed configurations
const animationSpeeds = {
  fast: {
    container: '0.3s',
    logo: '0.5s',
    content: '0.7s',
  },
  normal: {
    container: '0.4s',
    logo: '0.6s',
    content: '0.8s',
  },
  slow: {
    container: '0.5s',
    logo: '0.7s',
    content: '0.9s',
  },
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface StyledContainerProps {
  $height: string;
  $animationSpeed: keyof typeof animationSpeeds;
}

const LoadingContainer = styled.div<StyledContainerProps>`
  min-height: ${(props) => props.$height};
  background: var(--ion-color-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${designSystem.spacing.xl};
  animation: ${fadeIn} ${(props) => animationSpeeds[props.$animationSpeed].container} ease-out;
`;

interface StyledLogoContainerProps {
  $animationSpeed: keyof typeof animationSpeeds;
}

const LogoContainer = styled.div<StyledLogoContainerProps>`
  margin-bottom: ${designSystem.spacing.xl};
  animation: ${fadeIn} ${(props) => animationSpeeds[props.$animationSpeed].logo} ease-out;
`;

const SuspenseLogoContainer = styled.div<StyledLogoContainerProps>`
  margin-bottom: ${designSystem.spacing.lg};
  animation: ${fadeIn} ${(props) => animationSpeeds[props.$animationSpeed].logo} ease-out;
`;

interface StyledLoadingContentProps {
  $animationSpeed: keyof typeof animationSpeeds;
  $isFullPage: boolean;
}

const LoadingContent = styled.div<StyledLoadingContentProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => (props.$isFullPage ? designSystem.spacing.lg : designSystem.spacing.md)};
  animation: ${fadeIn} ${(props) => animationSpeeds[props.$animationSpeed].content} ease-out;
`;

interface StyledLoadingMessageProps {
  $isFullPage: boolean;
}

const LoadingMessage = styled.p<StyledLoadingMessageProps>`
  font-size: ${(props) => (props.$isFullPage ? designSystem.typography.fontSize.lg : designSystem.typography.fontSize.base)};
  color: ${designSystem.colors.text.secondary};
  text-align: center;
  margin: 0;
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

const SpinnerContainer = styled.div`
  --color: ${designSystem.colors.primary[500]};
`;

export interface LoadingScreenProps {
  message?: string;
  fullPage?: boolean;
  height?: string;
  logoSize?: 'small' | 'medium' | 'large';
  animationSpeed?: 'fast' | 'normal' | 'slow';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  fullPage = false,
  height = fullPage ? '100vh' : '60vh',
  logoSize = fullPage ? 'large' : 'medium',
  animationSpeed = fullPage ? 'slow' : 'fast',
}) => {
  const LogoContainerComponent = fullPage ? LogoContainer : SuspenseLogoContainer;

  const content = (
    <LoadingContainer $height={height} $animationSpeed={animationSpeed}>
      <LogoContainerComponent $animationSpeed={animationSpeed}>
        <SpendlessLogo variant='primary' size={logoSize} />
      </LogoContainerComponent>

      <LoadingContent $animationSpeed={animationSpeed} $isFullPage={fullPage}>
        <SpinnerContainer>
          <IonSpinner name='crescent' />
        </SpinnerContainer>
        <LoadingMessage $isFullPage={fullPage}>{message}</LoadingMessage>
      </LoadingContent>
    </LoadingContainer>
  );

  if (fullPage) {
    return (
      <IonPage>
        <IonContent>{content}</IonContent>
      </IonPage>
    );
  }

  return content;
};

export default LoadingScreen;
