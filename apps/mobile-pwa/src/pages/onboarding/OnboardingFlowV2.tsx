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
import FirstExperienceStep from './steps/v2/FirstExperienceStep';
import QuickStartStep from './steps/v2/QuickStartStep';
import ReadyStep from './steps/v2/ReadyStep';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: var(--ion-color-light);
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

  padding-top: ${designSystem.spacing.md};
`;

export interface OnboardingDataV2 {
  quickStartCompleted: boolean;
  firstExperienceCompleted: boolean;
  completed: boolean;
  periodId?: string;
  walletId?: string;
}

const TOTAL_STEPS = 3;
const STEP_LABELS = ['Quick Start', 'First Experience', 'Ready'];

const OnboardingFlowV2: React.FC = () => {
  const { user } = useAuth();
  const { account } = useSpendingAccount();
  const updateAccount = useUpdateAccount();
  const router = useIonRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingDataV2>({
    quickStartCompleted: false,
    firstExperienceCompleted: false,
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
    const savedProgress = localStorage.getItem(`onboarding-v2-${user.uid}`);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress) as OnboardingDataV2;
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

  const calculateStepFromProgress = (data: OnboardingDataV2): number => {
    if (!data.quickStartCompleted) return 1;
    if (!data.firstExperienceCompleted) return 2;
    return 3;
  };

  const saveProgress = useCallback(
    (data: OnboardingDataV2) => {
      if (user) {
        localStorage.setItem(`onboarding-v2-${user.uid}`, JSON.stringify(data));
      }
    },
    [user],
  );

  const updateOnboardingData = useCallback(
    (updates: Partial<OnboardingDataV2>) => {
      setOnboardingData((prev) => {
        const newData = { ...prev, ...updates };
        saveProgress(newData);
        return newData;
      });
    },
    [saveProgress],
  );

  const handleStepComplete = useCallback(
    (stepUpdates: Partial<OnboardingDataV2>) => {
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
      localStorage.removeItem(`onboarding-v2-${user.uid}`);
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
          <QuickStartStep
            {...commonProps}
            onComplete={(periodId, walletId) =>
              handleStepComplete({ quickStartCompleted: true, periodId, walletId })
            }
          />
        );
      case 2:
        return (
          <FirstExperienceStep
            {...commonProps}
            periodId={onboardingData.periodId}
            walletId={onboardingData.walletId}
            onComplete={() => handleStepComplete({ firstExperienceCompleted: true })}
          />
        );
      case 3:
        return <ReadyStep {...commonProps} onComplete={handleComplete} canGoBack={false} />;
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
          <StepContainer>{renderCurrentStep()}</StepContainer>
        </OnboardingContainer>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingFlowV2;
