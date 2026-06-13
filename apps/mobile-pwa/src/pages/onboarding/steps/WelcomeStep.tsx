import { SpendlessLogo } from '@/components/brand';
import { Gap } from '@/components/shared';
import { designSystem } from '@/theme/designSystem';
import type React from 'react';
import styled from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../components/OnboardingStep';

const LogoContainer = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
`;

const ValuePropsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.lg};
  margin-bottom: ${designSystem.spacing.xl};
  max-width: 350px;
`;

const ValueProp = styled.div`
  display: flex;
  align-items: center;
  text-align: left;
  gap: ${designSystem.spacing.lg};
`;

const ValuePropIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${designSystem.borderRadius.full};
  background: ${designSystem.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${designSystem.typography.fontSize.xl};
  flex-shrink: 0;
`;

const ValuePropContent = styled.div`
  flex: 1;
`;

const ValuePropTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const ValuePropDescription = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  line-height: 1.4;
`;

const WelcomeMessage = styled.p`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${designSystem.spacing.lg};
  max-width: 400px;
`;

interface WelcomeStepProps extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  onComplete: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete, ...stepProps }) => {
  const handleNext = () => {
    onComplete();
    stepProps.onNext?.();
  };

  return (
    <OnboardingStep
      {...stepProps}
      title='Welcome to Spendless'
      subtitle='Your journey to mindful spending starts here'
      canGoBack={false}
      canGoNext={true}
      nextButtonLabel='Start Your Journey'
      onNext={handleNext}
    >
      <LogoContainer>
        <SpendlessLogo variant='primary' size='large' />
      </LogoContainer>

      <WelcomeMessage>
        Spendless helps you develop a healthier relationship with money through awareness, not
        restriction. Let's set you up for success.
      </WelcomeMessage>

      <ValuePropsContainer>
        <ValueProp>
          <ValuePropIcon>🧘</ValuePropIcon>
          <ValuePropContent>
            <ValuePropTitle>Mindful</ValuePropTitle>
            <ValuePropDescription>
              Track your emotions and thoughts around spending to build awareness
            </ValuePropDescription>
          </ValuePropContent>
        </ValueProp>

        <ValueProp>
          <ValuePropIcon>📊</ValuePropIcon>
          <ValuePropContent>
            <ValuePropTitle>Simple</ValuePropTitle>
            <ValuePropDescription>
              Clean, focused interface that doesn't overwhelm you with charts and numbers
            </ValuePropDescription>
          </ValuePropContent>
        </ValueProp>

        <ValueProp>
          <ValuePropIcon>💡</ValuePropIcon>
          <ValuePropContent>
            <ValuePropTitle>Insightful</ValuePropTitle>
            <ValuePropDescription>
              Discover patterns and triggers to make more conscious spending decisions
            </ValuePropDescription>
          </ValuePropContent>
        </ValueProp>
      </ValuePropsContainer>

      <Gap size='lg' />
    </OnboardingStep>
  );
};

export default WelcomeStep;
