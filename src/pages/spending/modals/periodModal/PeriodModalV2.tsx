import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { StepIndicator } from '@/components/ui';
import type { IPeriod } from '@/domain/Period';
import { usePrompt } from '@/hooks';
import { designSystem } from '@/theme/designSystem';
import { IonTitle } from '@ionic/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import NavigationButtons from './components/NavigationButtons';
import { type PeriodFormData, useMultiStepForm } from './hooks/useMultiStepForm';
import StepBasics from './steps/StepBasics';
import StepReview from './steps/StepReview';
import StepWallets from './steps/StepWallets';

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: ${designSystem.spacing.lg};
`;

const ModalTitle = styled(IonTitle)`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
`;

const StepContent = styled.div`
  min-height: 400px;
  margin-bottom: ${designSystem.spacing.lg};
`;

interface PeriodModalV2Props {
  period?: IPeriod;
  onSave: (period: Partial<IPeriod>) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const PeriodModalV2: React.FC<PeriodModalV2Props> = ({ period, onSave, onDismiss }) => {
  const { showConfirmPrompt } = usePrompt();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing period data if editing
  const initialData = period
    ? {
        goals: period.goals,
        startAt: period.startAt.toISOString().split('T')[0],
        endAt: period.endAt.toISOString().split('T')[0],
        wallets:
          period.walletSetup?.map((wallet, index) => ({
            id: `existing-${index}`,
            name: wallet.name,
            spendingLimit: wallet.spendingLimit.toString(),
            isDefault: wallet.isDefault,
          })) || [],
        currentStep: 1 as const,
      }
    : undefined;

  const {
    formData,
    currentStep,
    totalBudget,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoBack,
    updateBasics,
    addWallet,
    removeWallet,
    setDefaultWallet,
    toPeriodData,
    reset,
  } = useMultiStepForm(initialData);

  // React Hook Form for validation
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PeriodFormData>({
    defaultValues: formData,
    mode: 'onChange',
  });

  // Watch form values for validation
  const watchedGoals = watch('goals');
  const watchedStartAt = watch('startAt');
  const watchedEndAt = watch('endAt');

  // Custom validation function that uses React Hook Form state
  const isStep1ValidRHF = () => {
    const goals = watchedGoals || '';
    const startAt = watchedStartAt || '';
    const endAt = watchedEndAt || '';

    return goals.trim().length >= 3 && startAt && endAt && new Date(endAt) > new Date(startAt);
  };

  const stepLabels = ['Basics', 'Wallets', 'Review'];

  const getModalTitle = () => {
    if (period) return 'Edit Period';

    switch (currentStep) {
      case 1:
        return 'Create New Period';
      case 2:
        return 'Setup Your Wallets';
      case 3:
        return 'Review & Create';
      default:
        return 'Create Period';
    }
  };

  const handleNext = () => {
    // Navigation validation is handled by useMultiStepForm's canGoNext()
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  const handleEditStep = (step: 1 | 2) => {
    goToStep(step);
  };

  const handleFormSubmit = async () => {
    if (formData.wallets.length === 0) {
      showPrompt('Please add at least one wallet before creating the period');
      return;
    }

    setIsSubmitting(true);
    try {
      const periodData = toPeriodData();

      if (period) {
        // Editing existing period
        onSave({ ...periodData, id: period.id });
      } else {
        // Creating new period
        onSave(periodData);
      }

      onDismiss();
    } catch (error) {
      console.error('Failed to save period:', error);
      showPrompt('Failed to save period. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPrompt = (message: string) => {
    showConfirmPrompt({
      title: 'Validation Error',
      message,
      onConfirm: () => {},
      onCancel: () => {},
    });
  };

  const handleDismiss = () => {
    if (isDirty || currentStep > 1) {
      showConfirmPrompt({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        onConfirm: () => {
          reset();
          onDismiss();
        },
        onCancel: () => {},
      });
    } else {
      onDismiss();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBasics
            formData={formData}
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
            onUpdate={updateBasics}
          />
        );
      case 2:
        return (
          <StepWallets
            formData={formData}
            totalBudget={totalBudget}
            onAddWallet={addWallet}
            onRemoveWallet={removeWallet}
            onSetDefaultWallet={setDefaultWallet}
          />
        );
      case 3:
        return (
          <StepReview formData={formData} totalBudget={totalBudget} onEditStep={handleEditStep} />
        );
      default:
        return null;
    }
  };

  return (
    <ModalPageLayout onDismiss={handleDismiss}>
      <CenterContainer>
        <ModalHeader>
          <ModalTitle>{getModalTitle()}</ModalTitle>
        </ModalHeader>

        <StepIndicator currentStep={currentStep} totalSteps={3} stepLabels={stepLabels} />

        <StepContent>{renderCurrentStep()}</StepContent>

        <NavigationButtons
          currentStep={currentStep}
          canGoBack={canGoBack()}
          canGoNext={currentStep === 1 ? Boolean(isStep1ValidRHF()) : Boolean(canGoNext())}
          isLoading={isSubmitting}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleFormSubmit}
        />
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default PeriodModalV2;
