import { ActionButton, Gap } from '@/components/shared';
import { designSystem } from '@/theme/designSystem';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import styled from 'styled-components';

const StepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: ${designSystem.spacing.lg} 0;
`;

const StepTitle = styled.h1`
  font-size: ${designSystem.typography.fontSize['3xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  line-height: 1.2;
`;

const StepSubtitle = styled.p`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.text.secondary};
  margin-bottom: ${designSystem.spacing.xl};
  line-height: 1.5;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const StepBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NavigationContainer = styled.div`
  display: flex;
  gap: ${designSystem.spacing.md};
  justify-content: space-between;
  align-items: center;
  margin-top: ${designSystem.spacing.xl};
  padding-top: ${designSystem.spacing.lg};
`;

const BackButtonContainer = styled.div`
  flex: 1;
`;

const NextButtonContainer = styled.div`
  flex: 2;
`;

export interface OnboardingStepProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  canGoBack?: boolean;
  canGoNext?: boolean;
  nextButtonLabel?: string;
  backButtonLabel?: string;
  isLoading?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  hideNavigation?: boolean;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  canGoBack = false,
  canGoNext = true,
  nextButtonLabel,
  backButtonLabel = 'Back',
  isLoading = false,
  onNext,
  onBack,
  hideNavigation = false,
}) => {
  const getDefaultNextLabel = () => {
    if (currentStep === totalSteps) {
      return 'Get Started';
    }
    if (currentStep === 1) {
      return 'Continue';
    }
    return 'Next';
  };

  const handleNext = () => {
    if (onNext && canGoNext && !isLoading) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onBack && canGoBack && !isLoading) {
      onBack();
    }
  };

  return (
    <StepWrapper>
      <StepContent>
        <StepTitle>{title}</StepTitle>
        {subtitle && <StepSubtitle>{subtitle}</StepSubtitle>}

        <StepBody>{children}</StepBody>

        {!hideNavigation && (
          <NavigationContainer>
            <BackButtonContainer>
              {canGoBack && (
                <ActionButton
                  size='default'
                  label={backButtonLabel}
                  fill='clear'
                  color='medium'
                  onClick={handleBack}
                  isLoading={false}
                  isDisabled={isLoading}
                />
              )}
            </BackButtonContainer>

            <NextButtonContainer>
              <ActionButton
                size='default'
                label={nextButtonLabel || getDefaultNextLabel()}
                expand='block'
                onClick={handleNext}
                isLoading={isLoading}
                isDisabled={!canGoNext || isLoading}
              />
            </NextButtonContainer>
          </NavigationContainer>
        )}
      </StepContent>
    </StepWrapper>
  );
};

export default OnboardingStep;
