import { ActionButton } from '@/components/shared';
import { designSystem } from '@/theme/designSystem';
import { IonButton } from '@ionic/react';
import type React from 'react';
import styled from 'styled-components';

const NavigationContainer = styled.div`
  display: flex;
  gap: ${designSystem.spacing.md};
  margin-top: ${designSystem.spacing.xl};
  padding: ${designSystem.spacing.md} 16px;
`;

const BackButton = styled(IonButton)`
  flex: 1;
  --color: ${designSystem.colors.text.secondary};
  --border-color: ${designSystem.colors.gray[300]};
`;

const NextButton = styled.div`
  flex: 2;
`;

interface NavigationButtonsProps {
  currentStep: 0 | 1 | 2 | 3;
  canGoBack: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit?: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  canGoBack,
  canGoNext,
  isLoading = false,
  onBack,
  onNext,
  onSubmit,
}) => {
  const getNextButtonLabel = () => {
    switch (currentStep) {
      case 0:
        return 'Next: Setup Wallets';
      case 1:
        return 'Next: Expenses';
      case 2:
        return 'Next: Review';
      case 3:
        return 'Create Period';
      default:
        return 'Next';
    }
  };

  const handleNextClick = () => {
    if (currentStep === 3 && onSubmit) {
      onSubmit();
    } else {
      onNext();
    }
  };

  // Navigation buttons are now always visible since we removed the reflection step

  return (
    <NavigationContainer>
      {canGoBack && (
        <BackButton expand='block' fill='outline' onClick={onBack} disabled={isLoading}>
          Back
        </BackButton>
      )}

      <NextButton style={{ flex: canGoBack ? 2 : 1 }}>
        <ActionButton
          expand='block'
          fill='solid'
          onClick={handleNextClick}
          isLoading={isLoading}
          isDisabled={!canGoNext && currentStep !== 2}
          label={getNextButtonLabel()}
        />
      </NextButton>
    </NavigationContainer>
  );
};

export default NavigationButtons;
