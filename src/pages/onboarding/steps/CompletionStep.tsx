import { SpendlessLogo } from '@/components/brand';
import { ActionButton, Gap } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, useIonRouter } from '@ionic/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../components/OnboardingStep';

const confettiAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
`;

const Confetti = styled.div`
  position: fixed;
  top: -10px;
  left: 50%;
  width: 10px;
  height: 10px;
  background: ${designSystem.colors.primary[500]};
  animation: ${confettiAnimation} 3s ease-out;
  pointer-events: none;
  z-index: 1000;

  &:nth-child(2n) {
    background: ${designSystem.colors.success[500]};
    left: 60%;
    animation-delay: 0.2s;
  }

  &:nth-child(3n) {
    background: ${designSystem.colors.warning[500]};
    left: 40%;
    animation-delay: 0.4s;
  }

  &:nth-child(4n) {
    background: ${designSystem.colors.danger[500]};
    left: 70%;
    animation-delay: 0.6s;
  }

  &:nth-child(5n) {
    background: ${designSystem.colors.primary[500]};
    left: 30%;
    animation-delay: 0.8s;
  }
`;

const CelebrationContainer = styled.div`
  text-align: center;
  position: relative;
`;

const CompletionBadge = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${designSystem.borderRadius.full};
  background: linear-gradient(135deg, ${designSystem.colors.success[400]} 0%, ${designSystem.colors.success[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${designSystem.spacing.lg};
  font-size: ${designSystem.typography.fontSize['3xl']};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const CelebrationTitle = styled.h1`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
`;

const CelebrationSubtitle = styled.p`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.text.secondary};
  margin-bottom: ${designSystem.spacing.xl};
  line-height: 1.5;
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.sm};
  margin-bottom: ${designSystem.spacing.xl};
`;

const Achievement = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.md};
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  background: ${designSystem.colors.success[50]};
  border: 1px solid ${designSystem.colors.success[200]};
  border-radius: ${designSystem.borderRadius.lg};
  text-align: left;
`;

const AchievementIcon = styled.div`
  font-size: ${designSystem.typography.fontSize.lg};
`;

const AchievementText = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.primary};
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

const NextStepsCard = styled(IonCard)`
  background: ${designSystem.colors.primary[50]};
  margin-bottom: ${designSystem.spacing.lg};
`;

const NextStepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.sm};
`;

const NextStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${designSystem.spacing.sm};
  text-align: left;
`;

const StepNumber = styled.div`
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
  margin-top: 2px;
`;

const StepText = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.primary};
  line-height: 1.4;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.md};
`;

const QuickActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${designSystem.spacing.sm};
`;

interface CompletionStepProps extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  onComplete: () => void;
}

const achievements = [
  { icon: '✅', text: 'Created your first mindful spending period' },
  { icon: '💰', text: 'Set up your primary spending wallet' },
  { icon: '📝', text: 'Logged your first mindful purchase' },
  { icon: '🧘', text: 'Experienced emotional awareness tracking' },
];

const nextSteps = [
  'Add more purchases as you spend throughout your period',
  'Review your spending patterns and emotions in the analytics',
  'Set up additional wallets if you use multiple payment methods',
  'Create new periods when your current one ends',
];

const CompletionStep: React.FC<CompletionStepProps> = ({ onComplete, ...stepProps }) => {
  const router = useIonRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation on component mount
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    onComplete();
  };

  const handleExploreFeatures = () => {
    router.push(ROUTES.SPENDING_PERIODS, 'forward');
  };

  const handleAddSpending = () => {
    router.push(ROUTES.SPENDING, 'forward');
  };

  return (
    <OnboardingStep {...stepProps} title='' hideNavigation>
      <CelebrationContainer>
        {showConfetti && [...Array(10)].map((_, i) => <Confetti key={i} />)}

        <CompletionBadge>🎉</CompletionBadge>

        <CelebrationTitle>Congratulations!</CelebrationTitle>

        <CelebrationSubtitle>
          You've successfully set up your mindful spending journey. Here's what you've accomplished:
        </CelebrationSubtitle>

        <AchievementsList>
          {achievements.map((achievement, index) => (
            <Achievement key={index}>
              <AchievementIcon>{achievement.icon}</AchievementIcon>
              <AchievementText>{achievement.text}</AchievementText>
            </Achievement>
          ))}
        </AchievementsList>

        <NextStepsCard>
          <IonCardContent>
            <h3
              style={{
                fontSize: designSystem.typography.fontSize.lg,
                fontWeight: designSystem.typography.fontWeight.semibold,
                color: designSystem.colors.text.primary,
                marginBottom: designSystem.spacing.md,
                textAlign: 'center',
              }}
            >
              What's Next?
            </h3>

            <NextStepsList>
              {nextSteps.map((step, index) => (
                <NextStep key={index}>
                  <StepNumber>{index + 1}</StepNumber>
                  <StepText>{step}</StepText>
                </NextStep>
              ))}
            </NextStepsList>
          </IonCardContent>
        </NextStepsCard>

        <ButtonsContainer>
          <ActionButton
            size='large'
            label='Start Your Mindful Spending Journey'
            expand='block'
            onClick={handleComplete}
            isLoading={false}
            isDisabled={false}
          />

          <QuickActionButtons>
            <ActionButton
              size='default'
              label='Add More Spending'
              fill='outline'
              onClick={handleAddSpending}
              isLoading={false}
              isDisabled={false}
            />
            <ActionButton
              size='default'
              label='Explore Features'
              fill='outline'
              onClick={handleExploreFeatures}
              isLoading={false}
              isDisabled={false}
            />
          </QuickActionButtons>
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

export default CompletionStep;
