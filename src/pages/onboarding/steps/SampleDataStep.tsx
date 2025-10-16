import { Gap } from '@/components/shared';
import { useSampleDataLoader } from '@/hooks/useSampleDataLoader';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonCard, IonCardContent, IonProgressBar, IonSpinner } from '@ionic/react';
import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../components/OnboardingStep';

const ChoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.xl};
`;

const ChoiceCard = styled(IonCard)<{ $isSelected?: boolean }>`
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${(props) => (props.$isSelected ? designSystem.colors.primary[500] : 'transparent')};
  background: ${(props) => (props.$isSelected ? designSystem.colors.primary[50] : 'white')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ChoiceContent = styled(IonCardContent)`
  display: flex;
  align-items: flex-start;
  gap: ${designSystem.spacing.md};
  padding: ${designSystem.spacing.lg};
`;

const ChoiceIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${designSystem.borderRadius.lg};
  background: ${designSystem.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${designSystem.typography.fontSize['2xl']};
  flex-shrink: 0;
`;

const ChoiceTextContainer = styled.div`
  flex: 1;
`;

const ChoiceTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const ChoiceDescription = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: ${designSystem.spacing.sm};
`;

const ChoiceFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: ${designSystem.spacing.sm};
`;

const ChoiceFeature = styled.li`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  padding-left: ${designSystem.spacing.md};
  position: relative;
  margin-bottom: ${designSystem.spacing.xs};

  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: ${designSystem.colors.success[500]};
    font-weight: ${designSystem.typography.fontWeight.bold};
  }
`;

const ProgressContainer = styled.div`
  margin-top: ${designSystem.spacing.lg};
  padding: ${designSystem.spacing.md};
  background: ${designSystem.colors.gray[50]};
  border-radius: ${designSystem.borderRadius.lg};
`;

const ProgressMessage = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  margin-bottom: ${designSystem.spacing.sm};
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.md};
  margin-top: ${designSystem.spacing.xl};
`;

interface SampleDataStepProps extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  onComplete: (loadedSampleData: boolean, periodId?: string, walletId?: string) => void;
  accountId?: string;
  periodId?: string;
}

type DataChoice = 'sample' | 'scratch' | null;

const SampleDataStep: React.FC<SampleDataStepProps> = ({
  onComplete,
  accountId,
  periodId,
  ...stepProps
}) => {
  const [choice, setChoice] = useState<DataChoice>(null);
  const { loadSampleData, isLoading, progress } = useSampleDataLoader();

  const handleChoiceSelect = (selectedChoice: DataChoice) => {
    setChoice(selectedChoice);
  };

  const handleNext = async () => {
    if (choice === 'sample' && accountId && periodId) {
      // Load sample data
      try {
        const result = await loadSampleData({ accountId, periodId });
        onComplete(true, periodId, Object.values(result.walletIds)[0]);
        stepProps.onNext?.();
      } catch (error) {
        console.error('Failed to load sample data:', error);
        // Still proceed but notify user
        alert('Failed to load sample data. You can still continue with a fresh start.');
        onComplete(false);
        stepProps.onNext?.();
      }
    } else {
      // Start from scratch
      onComplete(false);
      stepProps.onNext?.();
    }
  };

  const canProceed = choice !== null && !isLoading;

  return (
    <OnboardingStep
      {...stepProps}
      title='Choose Your Start'
      subtitle='Would you like to explore with sample data or start fresh?'
      canGoNext={canProceed}
      nextButtonLabel={
        isLoading ? 'Loading...' : choice === 'sample' ? 'Load Sample Data' : 'Start Fresh'
      }
      onNext={handleNext}
    >
      <ChoiceContainer>
        <ChoiceCard
          $isSelected={choice === 'sample'}
          onClick={() => !isLoading && handleChoiceSelect('sample')}
        >
          <ChoiceContent>
            <ChoiceIcon>🎯</ChoiceIcon>
            <ChoiceTextContainer>
              <ChoiceTitle>Start with Sample Data</ChoiceTitle>
              <ChoiceDescription>
                Explore Spendless with realistic demo data already set up for you
              </ChoiceDescription>
              <ChoiceFeatures>
                <ChoiceFeature>3 pre-configured wallets</ChoiceFeature>
                <ChoiceFeature>12+ sample transactions</ChoiceFeature>
                <ChoiceFeature>Realistic spending patterns</ChoiceFeature>
                <ChoiceFeature>Perfect for exploring features</ChoiceFeature>
              </ChoiceFeatures>
            </ChoiceTextContainer>
          </ChoiceContent>
        </ChoiceCard>

        <ChoiceCard
          $isSelected={choice === 'scratch'}
          onClick={() => !isLoading && handleChoiceSelect('scratch')}
        >
          <ChoiceContent>
            <ChoiceIcon>✨</ChoiceIcon>
            <ChoiceTextContainer>
              <ChoiceTitle>Start from Scratch</ChoiceTitle>
              <ChoiceDescription>
                Begin with a clean slate and build your own spending tracker from the ground up
              </ChoiceDescription>
              <ChoiceFeatures>
                <ChoiceFeature>Create your own wallets</ChoiceFeature>
                <ChoiceFeature>Add your own transactions</ChoiceFeature>
                <ChoiceFeature>Personalized from day one</ChoiceFeature>
                <ChoiceFeature>Full control over your data</ChoiceFeature>
              </ChoiceFeatures>
            </ChoiceTextContainer>
          </ChoiceContent>
        </ChoiceCard>
      </ChoiceContainer>

      {isLoading && (
        <ProgressContainer>
          <ProgressMessage>{progress.message || 'Loading sample data...'}</ProgressMessage>
          <IonProgressBar value={progress.current / progress.total} color='primary' />
          <LoadingContainer>
            <IonSpinner name='crescent' color='primary' />
            <ProgressMessage>
              {progress.current} of {progress.total} items
            </ProgressMessage>
          </LoadingContainer>
        </ProgressContainer>
      )}

      <Gap size='lg' />
    </OnboardingStep>
  );
};

export default SampleDataStep;
