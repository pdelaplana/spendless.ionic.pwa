import { StepIndicator } from '@/components/ui';
import { useUpdateAccount } from '@/hooks/api';
import { useAuth } from '@/providers/auth/useAuth';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import CompletionStep from './steps/CompletionStep';
import ConceptStep from './steps/ConceptStep';
import FirstSpendStep from './steps/FirstSpendStep';
import GuidedPeriodStep from './steps/GuidedPeriodStep';
import WalletSetupStep from './steps/WalletSetupStep';
import WelcomeStep from './steps/WelcomeStep';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${designSystem.colors.primary[50]} 0%, ${designSystem.colors.primary[100]} 100%);
  padding: ${designSystem.spacing.lg};
  display: flex;
  flex-direction: column;
`;

const StepContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
`;

const ProgressContainer = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  padding-top: ${designSystem.spacing.md};
`;

export interface OnboardingData {
  welcomeCompleted: boolean;
  conceptsUnderstood: boolean;
  periodCreated: boolean;
  walletSetup: boolean;
  firstSpendLogged: boolean;
  completed: boolean;
  periodId?: string;
  walletId?: string;
}

const TOTAL_STEPS = 6;
const STEP_LABELS = ['Welcome', 'Learn', 'Period', 'Wallet', 'First Spend', 'Complete'];

const OnboardingFlow: React.FC = () => {
  const { user } = useAuth();
  const { account } = useSpendingAccount();
  const updateAccount = useUpdateAccount();
  const router = useIonRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    welcomeCompleted: false,
    conceptsUnderstood: false,
    periodCreated: false,
    walletSetup: false,
    firstSpendLogged: false,
    completed: false,
  });

  useEffect(() => {
    if (!user) {
      router.push(ROUTES.SIGNIN, 'root', 'replace');
      return;
    }

    // Check if user has already completed onboarding via account
    if (account?.onboardingCompleted) {
      router.push(ROUTES.SPENDING, 'root', 'replace');
      return;
    }

    // Load onboarding progress from localStorage
    const savedProgress = localStorage.getItem(`onboarding-${user.uid}`);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress) as OnboardingData;
        if (progress.completed) {
          // User has already completed onboarding, redirect to main app
          router.push(ROUTES.SPENDING, 'root', 'replace');
          return;
        }
        setOnboardingData(progress);
        // Set current step based on progress
        const stepFromProgress = calculateStepFromProgress(progress);
        setCurrentStep(stepFromProgress);
      } catch (error) {
        console.warn('Failed to parse onboarding progress:', error);
      }
    }
  }, [user, account, router]);

  const calculateStepFromProgress = (data: OnboardingData): number => {
    if (!data.welcomeCompleted) return 1;
    if (!data.conceptsUnderstood) return 2;
    if (!data.periodCreated) return 3;
    if (!data.walletSetup) return 4;
    if (!data.firstSpendLogged) return 5;
    return 6;
  };

  const saveProgress = useCallback(
    (data: OnboardingData) => {
      if (user) {
        localStorage.setItem(`onboarding-${user.uid}`, JSON.stringify(data));
      }
    },
    [user],
  );

  const updateOnboardingData = useCallback(
    (updates: Partial<OnboardingData>) => {
      setOnboardingData((prev) => {
        const newData = { ...prev, ...updates };
        saveProgress(newData);
        return newData;
      });
    },
    [saveProgress],
  );

  const handleStepComplete = useCallback(
    (stepUpdates: Partial<OnboardingData>) => {
      updateOnboardingData(stepUpdates);

      // Auto-advance to next step unless it's the final step
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      }
    },
    [currentStep, updateOnboardingData],
  );

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    const completedData = { ...onboardingData, completed: true };
    updateOnboardingData(completedData);

    // Mark onboarding as completed in the account
    if (account?.id) {
      try {
        await updateAccount.mutateAsync({
          id: account.id,
          data: {
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Failed to update account onboarding status:', error);
        // Still proceed to main app even if this fails
      }
    }

    // Clear onboarding progress from localStorage
    if (user) {
      localStorage.removeItem(`onboarding-${user.uid}`);
    }

    // Redirect to main spending page
    router.push(ROUTES.SPENDING, 'root', 'replace');
  }, [onboardingData, updateOnboardingData, account, updateAccount, user, router]);

  const renderCurrentStep = () => {
    const commonProps = {
      onNext: handleNext,
      onBack: handleBack,
      currentStep,
      totalSteps: TOTAL_STEPS,
      canGoBack: currentStep > 1,
    };

    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            {...commonProps}
            onComplete={() => handleStepComplete({ welcomeCompleted: true })}
          />
        );
      case 2:
        return (
          <ConceptStep
            {...commonProps}
            onComplete={() => handleStepComplete({ conceptsUnderstood: true })}
          />
        );
      case 3:
        return (
          <GuidedPeriodStep
            {...commonProps}
            onComplete={(periodId) => handleStepComplete({ periodCreated: true, periodId })}
          />
        );
      case 4:
        return (
          <WalletSetupStep
            {...commonProps}
            periodId={onboardingData.periodId}
            onComplete={(walletId) => handleStepComplete({ walletSetup: true, walletId })}
          />
        );
      case 5:
        return (
          <FirstSpendStep
            {...commonProps}
            periodId={onboardingData.periodId}
            walletId={onboardingData.walletId}
            onComplete={() => handleStepComplete({ firstSpendLogged: true })}
          />
        );
      case 6:
        return <CompletionStep {...commonProps} onComplete={handleComplete} canGoBack={false} />;
      default:
        return null;
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <IonPage>
      <IonContent color='light'>
        <OnboardingContainer>
          <ProgressContainer>
            <StepIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              stepLabels={STEP_LABELS}
            />
          </ProgressContainer>

          <StepContainer>{renderCurrentStep()}</StepContainer>
        </OnboardingContainer>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingFlow;
