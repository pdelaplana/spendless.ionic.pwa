import { CenterContainer, CenterContent } from '@/components/layouts';
import { ActionButton, Gap, MutationNotificationHandler } from '@/components/shared';
import { brandVoice } from '@/constants/brandVoice';
import type { IPeriod } from '@/domain/Period';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, rocketOutline, timeOutline } from 'ionicons/icons';
import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { usePeriodModalV2 } from '../../modals/periodModal/usePeriodModalV2';

const OnboardingCard = styled(IonCard)`
  margin: auto 0;
  border-radius: ${designSystem.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${designSystem.shadows.lg};
  align-self: center;
`;

const WelcomeHeader = styled.div`
  color: ${designSystem.colors.text.primary};
  padding: ${designSystem.spacing.xl} ${designSystem.spacing.lg};
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  margin: 0 0 ${designSystem.spacing.sm} 0;
  line-height: 1.3;
`;

const WelcomeSubtitle = styled.p`
  font-size: ${designSystem.typography.fontSize.base};
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
`;

const OnboardingContent = styled(IonCardContent)`
  padding: ${designSystem.spacing.xl};
`;

const BenefitsGrid = styled.div`
  display: grid;
  gap: ${designSystem.spacing.lg};
  margin-bottom: ${designSystem.spacing.xl};
`;

const BenefitItem = styled.div`

  gap: ${designSystem.spacing.md};
  padding: ${designSystem.spacing.md};
  background: ${designSystem.colors.success[50]};
  border-radius: ${designSystem.borderRadius.lg};
  border: 1px solid ${designSystem.colors.success[200]};
`;

const BenefitIcon = styled.div`
  background: ${designSystem.colors.success[100]};
  border-radius: ${designSystem.borderRadius.full};
  padding: ${designSystem.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
`;

const BenefitContent = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.success[700]};
  margin: 0 0 ${designSystem.spacing.xs} 0;
`;

const BenefitDescription = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.success[600]};
  margin: 0;
  line-height: 1.4;
`;

const QuickTipsSection = styled.div`
  background: ${designSystem.colors.primary[50]};
  border: 1px solid ${designSystem.colors.primary[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  margin-bottom: ${designSystem.spacing.xl};
`;

const TipsTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.primary[700]};
  margin: 0 0 ${designSystem.spacing.md} 0;
  text-align: center;
`;

const TipsList = styled.ul`
  margin: 0;
  padding-left: ${designSystem.spacing.lg};
  color: ${designSystem.colors.primary[600]};

  li {
    font-size: ${designSystem.typography.fontSize.sm};
    line-height: 1.5;
    margin-bottom: ${designSystem.spacing.xs};
  }
`;

const ActionSection = styled.div`
  text-align: center;
`;

const ActionDescription = styled.p`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.secondary};
  margin: 0 0 ${designSystem.spacing.lg} 0;
  line-height: 1.5;
`;

const FullHeightCenterContent = styled(CenterContent)`
  min-height: 100vh;
  padding: ${designSystem.spacing.lg};
`;

interface NoCurrentPeriodViewProps {
  isFirstTime?: boolean;
}

const NoCurrentPeriodView: React.FC<NoCurrentPeriodViewProps> = ({ isFirstTime = false }) => {
  const { account, createPeriod, didMutationSucceed, didMutationFail, resetMutationState } =
    useSpendingAccount();
  const { open } = usePeriodModalV2();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartNewPeriod = async () => {
    setIsStarting(true);
    try {
      await open(undefined, onSavePeriod);
    } finally {
      setIsStarting(false);
    }
  };

  const onSavePeriod = async (period: Partial<IPeriod>) => {
    await createPeriod({ data: period });
  };

  const benefits = [
    {
      icon: checkmarkCircleOutline,
      title: 'Mindful Tracking',
      description: 'Become aware of your spending patterns and emotional triggers',
    },
    {
      icon: timeOutline,
      title: 'Flexible Periods',
      description: 'Set custom timeframes that work with your lifestyle and goals',
    },
    {
      icon: rocketOutline,
      title: 'Goal Achievement',
      description: 'Track progress and celebrate wins on your financial wellness journey',
    },
  ];

  const welcomeMessage = isFirstTime
    ? brandVoice.messageCategories.onboarding.examples[0]
    : 'Ready to start a new mindful spending journey?';

  return (
    <GradientBackground>
      <MutationNotificationHandler
        didSucceed={didMutationSucceed}
        didFail={didMutationFail}
        onNotified={resetMutationState}
      />
      <CenterContainer>
        <FullHeightCenterContent>
          <OnboardingCard>
            <WelcomeHeader>
              <WelcomeTitle>Welcome to Spendless</WelcomeTitle>
              <WelcomeSubtitle>Let's build better spending habits together</WelcomeSubtitle>
            </WelcomeHeader>

            <OnboardingContent>
              <BenefitsGrid>
                {benefits.map((benefit, index) => (
                  <BenefitItem key={index}>
                    <BenefitIcon>
                      <IonIcon icon={benefit.icon} color='success' />
                    </BenefitIcon>
                    <BenefitContent>
                      <BenefitTitle>{benefit.title}</BenefitTitle>
                      <BenefitDescription>{benefit.description}</BenefitDescription>
                    </BenefitContent>
                  </BenefitItem>
                ))}
              </BenefitsGrid>

              {isFirstTime && (
                <>
                  <QuickTipsSection>
                    <TipsTitle>💡 Getting Started Tips</TipsTitle>
                    <TipsList>
                      <li>Start with a timeframe that feels manageable (1-2 weeks)</li>
                      <li>Set realistic spending goals based on your needs</li>
                      <li>Focus on awareness, not restriction</li>
                      <li>Remember: progress over perfection</li>
                    </TipsList>
                  </QuickTipsSection>
                  <Gap size='md' />
                </>
              )}

              <ActionSection>
                <ActionDescription>
                  {isFirstTime
                    ? 'Create your first spending period to begin tracking your financial wellness journey.'
                    : 'Ready to set new goals and track your spending mindfully?'}
                </ActionDescription>

                <ActionButton
                  label={isFirstTime ? 'Lets Start' : 'Start New Spending Period'}
                  onClick={handleStartNewPeriod}
                  isLoading={isStarting}
                  expand='block'
                  size='large'
                  isDisabled={false}
                />
              </ActionSection>
            </OnboardingContent>
          </OnboardingCard>
        </FullHeightCenterContent>
      </CenterContainer>
    </GradientBackground>
  );
};

export default NoCurrentPeriodView;
