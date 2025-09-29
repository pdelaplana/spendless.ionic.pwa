import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { StepIndicator } from '@/components/ui';
import type { IPeriod } from '@/domain/Period';
import type { ISpend } from '@/domain/Spend';
import type { IWallet } from '@/domain/Wallet';
import { usePrompt } from '@/hooks';
import { useAppNotifications } from '@/hooks/ui/useAppNotifications';
import { designSystem } from '@/theme/designSystem';
import { IonTitle } from '@ionic/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import NavigationButtons from './components/NavigationButtons';
import { type PeriodFormData, useMultiStepForm } from './hooks/useMultiStepForm';
import StepBasics from './steps/StepBasics';
import StepRecurringExpenses from './steps/StepRecurringExpenses';
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
  currentWallets?: IWallet[];
  currentRecurringExpenses?: ISpend[];
  onSave: (period: Partial<IPeriod>) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const PeriodModalV2: React.FC<PeriodModalV2Props> = ({
  period,
  currentWallets,
  currentRecurringExpenses,
  onSave,
  onDismiss,
}) => {
  const { showConfirmPrompt } = usePrompt();
  const { showErrorNotification } = useAppNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitializedRecurringExpenses = useRef(false);

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
        currentStep: 0 as const, // Start with basics for editing
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
    setRecurringExpenses,
    removeRecurringExpense,
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

  // Sync React Hook Form with multi-step form state
  useEffect(() => {
    setValue('goals', formData.goals);
    setValue('startAt', formData.startAt);
    setValue('endAt', formData.endAt);
  }, [formData.goals, formData.startAt, formData.endAt, setValue]);

  // Initialize recurring expenses from props only once
  useEffect(() => {
    if (
      currentRecurringExpenses &&
      currentRecurringExpenses.length > 0 &&
      !hasInitializedRecurringExpenses.current
    ) {
      hasInitializedRecurringExpenses.current = true;

      const periodDurationDays = Math.ceil(
        (new Date(formData.endAt).getTime() - new Date(formData.startAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const recurringExpensesData = currentRecurringExpenses.map((expense) => {
        const newDate = new Date(expense.date);
        newDate.setDate(newDate.getDate() + periodDurationDays);

        return {
          id: expense.id || '',
          description: expense.description,
          amount: expense.amount,
          originalDate: expense.date,
          newDate,
          category: expense.category || '',
          walletId: expense.walletId || '',
        };
      });

      setRecurringExpenses(recurringExpensesData);
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally run only once on mount to initialize from props
  }, []);

  // Custom validation function that uses React Hook Form state
  const isStep0ValidRHF = () => {
    const goals = watchedGoals || formData.goals || '';
    const startAt = watchedStartAt || formData.startAt || '';
    const endAt = watchedEndAt || formData.endAt || '';

    return goals.trim().length >= 3 && startAt && endAt && new Date(endAt) > new Date(startAt);
  };

  const stepLabels = ['Period', 'Wallets', 'Expenses', 'Review'];

  const getModalTitle = () => {
    if (period) return 'Edit Period';

    switch (currentStep) {
      case 0:
        return 'Start a New Period';
      case 1:
        return 'Setup Your Wallets';
      case 2:
        return 'Recurring Expenses';
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

  const handleEditStep = (step: 0 | 1 | 2) => {
    goToStep(step);
  };

  const handleFormSubmit = async () => {
    if (formData.wallets.length === 0) {
      showErrorNotification('Please add at least one wallet before creating the period');
      return;
    }

    setIsSubmitting(true);
    try {
      // Sync React Hook Form values to multi-step form before creating period data
      const currentFormValues = {
        goals: watchedGoals || formData.goals || '',
        startAt: watchedStartAt || formData.startAt || '',
        endAt: watchedEndAt || formData.endAt || '',
      };
      updateBasics(currentFormValues);

      // Create period data manually to ensure we use the current form values
      const walletSetup = formData.wallets.map((w) => ({
        name: w.name,
        spendingLimit: Number.parseFloat(w.spendingLimit),
        isDefault: w.isDefault,
      }));

      const totalBudget = walletSetup.reduce((total, wallet) => total + wallet.spendingLimit, 0);

      // Generate period name from date range
      const startDate = new Date(currentFormValues.startAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const endDate = new Date(currentFormValues.endAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const periodName = `${startDate} - ${endDate}`;

      const periodData = {
        name: periodName,
        goals: currentFormValues.goals,
        startAt: new Date(currentFormValues.startAt),
        endAt: new Date(currentFormValues.endAt),
        walletSetup,
        targetSpend: totalBudget,
        targetSavings: 0,
        reflection: '',
      };

      if (period) {
        // Editing existing period
        await onSave({ ...periodData, id: period.id });
      } else {
        // Creating new period
        await onSave(periodData);
      }

      onDismiss();
    } catch (error) {
      console.error('Failed to save period:', error);
      // Show error toast notification to user
      showErrorNotification('Failed to save period. Please try again.');
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
    if (isDirty || currentStep > 0) {
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
      case 0:
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
      case 1:
        return (
          <StepWallets
            formData={formData}
            totalBudget={totalBudget}
            currentWallets={currentWallets}
            onAddWallet={addWallet}
            onRemoveWallet={removeWallet}
            onSetDefaultWallet={setDefaultWallet}
          />
        );
      case 2:
        return (
          <StepRecurringExpenses
            formData={formData}
            currentRecurringExpenses={currentRecurringExpenses || []}
            onRemoveRecurringExpense={removeRecurringExpense}
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

        <StepIndicator currentStep={currentStep + 1} totalSteps={4} stepLabels={stepLabels} />

        <StepContent>{renderCurrentStep()}</StepContent>

        <NavigationButtons
          currentStep={currentStep}
          canGoBack={canGoBack()}
          canGoNext={currentStep === 0 ? Boolean(isStep0ValidRHF()) : Boolean(canGoNext())}
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
