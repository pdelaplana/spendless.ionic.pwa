import { InputFormField, SelectFormField, TextAreaFormField } from '@/components/forms';
import { Gap } from '@/components/shared';
import type { SpendCategory } from '@/domain/Spend';
import { useCreateSpend } from '@/hooks/api';
import { useAppNotifications } from '@/hooks/ui';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, IonItem, IonLabel, IonList } from '@ionic/react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../components/OnboardingStep';

const GuideContainer = styled.div`
  max-width: 450px;
  margin: 0 auto;
`;

const ExplanationCard = styled(IonCard)`
  background: ${designSystem.colors.primary[50]};
  margin-bottom: ${designSystem.spacing.lg};
`;

const TutorialStep = styled.div<{ $isActive: boolean }>`
  background: ${(props) => (props.$isActive ? designSystem.colors.success[50] : designSystem.colors.gray[50])};
  border: 2px solid ${(props) => (props.$isActive ? designSystem.colors.success[300] : designSystem.colors.gray[200])};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.md};
  transition: all 0.3s ease;
`;

const StepNumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${designSystem.borderRadius.full};
  background: ${designSystem.colors.primary[500]};
  color: white;
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.bold};
  margin-right: ${designSystem.spacing.sm};
`;

const StepContent = styled.div`
  display: inline-block;
`;

const StepTitle = styled.div`
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  font-size: ${designSystem.typography.fontSize.sm};
  margin-bottom: ${designSystem.spacing.xs};
`;

const StepDescription = styled.div`
  font-size: ${designSystem.typography.fontSize.xs};
  color: ${designSystem.colors.text.secondary};
`;

const FormSection = styled.div`
  margin-top: ${designSystem.spacing.lg};
`;

const MindfulnessSection = styled.div`
  background: ${designSystem.colors.primary[50]};
  border: 1px solid ${designSystem.colors.primary[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  margin-top: ${designSystem.spacing.lg};
`;

const MindfulnessTitle = styled.h4`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.primary[700]};
  margin-bottom: ${designSystem.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
`;

interface SpendForm {
  amount: string;
  description: string;
  category: SpendCategory;
  emotionalState: string;
  notes: string;
}

interface FirstSpendStepProps extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  periodId?: string;
  walletId?: string;
  onComplete: () => void;
}

const categoryOptions = [
  { value: 'need', label: 'Need - Essential item (food, shelter, transportation)' },
  { value: 'want', label: 'Want - Nice to have (entertainment, hobby items)' },
  { value: 'culture', label: 'Culture - Social/cultural activity (dining out, events)' },
  { value: 'unexpected', label: 'Unexpected - Unplanned expense (emergency, impulse)' },
];

const emotionalStates = [
  'Happy',
  'Stressed',
  'Excited',
  'Anxious',
  'Neutral',
  'Tired',
  'Frustrated',
  'Content',
];

const tutorialSteps = [
  {
    title: 'Amount & Description',
    description: 'Enter what you bought and how much you spent',
  },
  {
    title: 'Categorize',
    description: 'Choose if this was a need, want, cultural, or unexpected purchase',
  },
  {
    title: 'Check Your Emotions',
    description: 'How were you feeling when you made this purchase?',
  },
  {
    title: 'Reflect',
    description: 'Add any thoughts about this purchase (optional but helpful!)',
  },
];

const FirstSpendStep: React.FC<FirstSpendStepProps> = ({
  periodId,
  walletId,
  onComplete,
  ...stepProps
}) => {
  const { account } = useSpendingAccount();
  const createSpend = useCreateSpend();
  const { showErrorNotification, showNotification } = useAppNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SpendForm>({
    mode: 'onChange',
    defaultValues: {
      category: 'need',
      emotionalState: 'Neutral',
    },
  });

  const watchedAmount = watch('amount');
  const watchedDescription = watch('description');
  const watchedCategory = watch('category');
  const watchedEmotionalState = watch('emotionalState');

  // Progress tracking for tutorial
  const hasAmount = watchedAmount && Number(watchedAmount) > 0;
  const hasDescription = watchedDescription && watchedDescription.length >= 2;
  const hasCategory = watchedCategory;
  const hasEmotionalState = watchedEmotionalState;

  // Update tutorial step based on completion
  const updateTutorialStep = useCallback(() => {
    if (hasAmount && hasDescription && !hasCategory) {
      setCurrentTutorialStep(1);
    } else if (hasAmount && hasDescription && hasCategory && !hasEmotionalState) {
      setCurrentTutorialStep(2);
    } else if (hasAmount && hasDescription && hasCategory && hasEmotionalState) {
      setCurrentTutorialStep(3);
    }
  }, [hasAmount, hasDescription, hasCategory, hasEmotionalState]);

  useEffect(() => {
    updateTutorialStep();
  }, [updateTutorialStep]);

  const onSubmit = async (data: SpendForm) => {
    if (!account?.id || !periodId || !walletId) {
      showErrorNotification('Missing account, period, or wallet information.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createSpend.mutateAsync({
        accountId: account.id,
        periodId: periodId,
        walletId: walletId,
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
        emotionalState: data.emotionalState,
        notes: data.notes,
        date: new Date(),
      });

      showNotification('Your first mindful spend has been logged! 🎉');
      onComplete();
      stepProps.onNext?.();
    } catch (error) {
      console.error('Failed to create spend:', error);
      showErrorNotification('Failed to log spending. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = Boolean(hasAmount && hasDescription && hasCategory);

  return (
    <OnboardingStep
      {...stepProps}
      title='Log Your First Purchase'
      subtitle='Experience the mindful spending process with a recent purchase'
      canGoNext={canProceed && !isSubmitting}
      isLoading={isSubmitting}
      nextButtonLabel='Log This Purchase'
      onNext={handleSubmit(onSubmit)}
    >
      <GuideContainer>
        <ExplanationCard>
          <IonCardContent>
            <p
              style={{
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.text.secondary,
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Think of a recent purchase (coffee, lunch, online order) and log it here. This will
              show you how mindful spending tracking works.
            </p>
          </IonCardContent>
        </ExplanationCard>

        {/* Tutorial Progress */}
        <div style={{ marginBottom: designSystem.spacing.lg }}>
          {tutorialSteps.map((step, index) => (
            <TutorialStep key={`tutorial-${step.title.replace(/\s+/g, '-').toLowerCase()}`} $isActive={index === currentTutorialStep}>
              <StepNumber>{index + 1}</StepNumber>
              <StepContent>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepContent>
            </TutorialStep>
          ))}
        </div>

        <FormSection>
          <IonList lines='none'>
            <IonItem>
              <IonLabel>
                <InputFormField
                  name='amount'
                  label='Amount Spent'
                  type='number'
                  placeholder='0.00'
                  register={register}
                  error={errors.amount}
                  fill='outline'
                  validationRules={{
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                    max: { value: 10000, message: 'Amount seems too high for first entry' },
                  }}
                />
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <InputFormField
                  name='description'
                  label='What did you buy?'
                  type='text'
                  placeholder='e.g., Coffee from Starbucks, Lunch at subway'
                  register={register}
                  error={errors.description}
                  fill='outline'
                  validationRules={{
                    required: 'Description is required',
                    minLength: { value: 2, message: 'Please provide more detail' },
                  }}
                />
              </IonLabel>
            </IonItem>

            <Gap size='md' />

            <IonItem>
              <IonLabel>
                <SelectFormField
                  name='category'
                  label='Category'
                  register={register}
                  error={errors.category}
                  fill='outline'
                  optionsList={categoryOptions}
                  validationRules={{
                    required: 'Please select a category',
                  }}
                />
              </IonLabel>
            </IonItem>

            {hasCategory && (
              <MindfulnessSection>
                <MindfulnessTitle>🧘 Mindful Moment</MindfulnessTitle>

                <IonItem lines='none' style={{ '--background': 'transparent' }}>
                  <IonLabel>
                    <SelectFormField
                      name='emotionalState'
                      label='How were you feeling when you made this purchase?'
                      register={register}
                      error={errors.emotionalState}
                      fill='outline'
                      optionsList={emotionalStates.map((state) => ({ value: state, label: state }))}
                    />
                  </IonLabel>
                </IonItem>

                <IonItem lines='none' style={{ '--background': 'transparent' }}>
                  <IonLabel>
                    <TextAreaFormField
                      name='notes'
                      label='Any thoughts about this purchase? (Optional)'
                      placeholder='Was this planned? How do you feel about it now? Would you buy it again?'
                      register={register}
                      setValue={setValue}
                      error={errors.notes}
                      fill='outline'
                      maxlength={200}
                    />
                  </IonLabel>
                </IonItem>
              </MindfulnessSection>
            )}
          </IonList>
        </FormSection>
      </GuideContainer>
    </OnboardingStep>
  );
};

export default FirstSpendStep;
