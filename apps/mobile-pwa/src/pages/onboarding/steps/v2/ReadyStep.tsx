import { SpendlessLogo } from '@/components/brand';
import { ActionButton, Gap } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, useIonRouter } from '@ionic/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../../components/OnboardingStep';

const celebrationAnimation = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const CelebrationContainer = styled.div`
  text-align: center;
  position: relative;
  max-width: 400px;
  margin: 0 auto;
`;

const SuccessBadge = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${designSystem.borderRadius.full};
  background: linear-gradient(135deg, ${designSystem.colors.success[400]} 0%, ${designSystem.colors.success[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${designSystem.spacing.lg};
  font-size: ${designSystem.typography.fontSize['2xl']};
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  animation: ${celebrationAnimation} 0.8s ease-out;
`;

const SuccessTitle = styled.h1`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.sm};
`;

const SuccessMessage = styled.p`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.text.secondary};
  margin-bottom: ${designSystem.spacing.xl};
  line-height: 1.5;
`;

const QuickActionsCard = styled(IonCard)`
  background: ${designSystem.colors.primary[50]};
  margin-bottom: ${designSystem.spacing.lg};
`;

const QuickActionsTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.sm};
`;

const ActionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  text-align: left;
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.primary};
`;

const ActionIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: ${designSystem.borderRadius.full};
  background: ${designSystem.colors.primary[500]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${designSystem.typography.fontSize.xs};
  font-weight: ${designSystem.typography.fontWeight.bold};
  flex-shrink: 0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.md};
`;

interface ReadyStepProps extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  onComplete: () => void;
}

const quickActions = [
  'Add more purchases as you spend throughout your week',
  'Check your progress and patterns in the app',
  'Create new periods when your current one ends',
];

const ReadyStep: React.FC<ReadyStepProps> = ({ onComplete, ...stepProps }) => {
  const router = useIonRouter();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation on component mount
    setShowAnimation(true);
  }, []);

  const handleComplete = () => {
    onComplete();
  };

  const handleExploreNow = () => {
    router.push(ROUTES.SPENDING, 'forward');
  };

  return (
    <OnboardingStep {...stepProps} title='' hideNavigation>
      <CelebrationContainer>
        <SuccessBadge>🎉</SuccessBadge>

        <SuccessTitle>You're All Set!</SuccessTitle>

        <SuccessMessage>
          Congratulations! You've experienced mindful spending in action. Notice how that awareness
          felt different?
        </SuccessMessage>

        <QuickActionsCard>
          <IonCardContent>
            <QuickActionsTitle>What's Next?</QuickActionsTitle>

            <ActionsList>
              {quickActions.map((action, index) => (
                <ActionItem key={`action-${action.replace(/\s+/g, '-').toLowerCase()}`}>
                  <ActionIcon>{index + 1}</ActionIcon>
                  <span>{action}</span>
                </ActionItem>
              ))}
            </ActionsList>
          </IonCardContent>
        </QuickActionsCard>

        <ButtonsContainer>
          <ActionButton
            size='large'
            label='Start Your Mindful Spending Journey'
            expand='block'
            onClick={handleComplete}
            isLoading={false}
            isDisabled={false}
          />

          <ActionButton
            size='default'
            label='Explore Now'
            fill='outline'
            onClick={handleExploreNow}
            isLoading={false}
            isDisabled={false}
          />
        </ButtonsContainer>

        <Gap size='lg' />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: designSystem.spacing.lg,
          }}
        >
          <SpendlessLogo variant='primary' size='small' />
        </div>
      </CelebrationContainer>
    </OnboardingStep>
  );
};

export default ReadyStep;
