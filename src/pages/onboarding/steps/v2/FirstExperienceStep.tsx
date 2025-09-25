import { InputFormField, SelectFormField, TextAreaFormField } from '@/components/forms';
import { Gap } from '@/components/shared';
import type { SpendCategory } from '@/domain/Spend';
import { useCreateSpend } from '@/hooks/api';
import { useAppNotifications } from '@/hooks/ui';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, IonItem, IonLabel, IonList } from '@ionic/react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../../components/OnboardingStep';

const CenterContainer = styled.div`
  max-width: 450px;
  margin: 0 auto;
`;

const IntroCard = styled(IonCard)`
  background: ${designSystem.colors.primary[50]};
  border: 1px solid ${designSystem.colors.primary[200]};
  margin-bottom: ${designSystem.spacing.lg};
`;

const IntroText = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.primary[700]};
  text-align: center;
  margin: 0;
  line-height: 1.5;
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

const MindfulnessSection = styled.div`
  background: ${designSystem.colors.success[50]};
  border: 1px solid ${designSystem.colors.success[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  margin-top: ${designSystem.spacing.lg};
`;

const MindfulnessTitle = styled.h4`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.success[700]};
  margin-bottom: ${designSystem.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  text-align: center;
  justify-content: center;
`;

const RealtimeFeedback = styled.div<{ $show: boolean }>`
  background: ${designSystem.colors.primary[50]};
  border: 1px solid ${designSystem.colors.primary[300]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  margin-top: ${designSystem.spacing.md};
  transition: all 0.3s ease;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: ${({ $show }) => ($show ? 'translateY(0)' : 'translateY(-10px)')};
`;

const FeedbackText = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.primary[700]};
  text-align: center;
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

interface SpendForm {
  amount: string;
  description: string;
  category: SpendCategory;
  emotionalState: string;
  notes: string;
}

interface FirstExperienceStepProps
  extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  periodId?: string;
  walletId?: string;
  onComplete: () => void;
}

const categoryOptions = [
  { value: 'need', label: 'Need - Essential (food, transportation)' },
  { value: 'want', label: 'Want - Nice to have (entertainment, hobby)' },
  { value: 'culture', label: 'Culture - Social activity (dining, events)' },
  { value: 'unexpected', label: 'Unexpected - Unplanned (impulse, emergency)' },
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

const FirstExperienceStep: React.FC<FirstExperienceStepProps> = ({
  periodId,
  walletId,
  onComplete,
  ...stepProps
}) => {
  const { account } = useSpendingAccount();
  const createSpend = useCreateSpend();
  const { showErrorNotification, showNotification } = useAppNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Show realtime feedback based on form completion
  const hasBasicInfo =
    watchedAmount &&
    Number(watchedAmount) > 0 &&
    watchedDescription &&
    watchedDescription.length >= 2;
  const hasCategorization = hasBasicInfo && watchedCategory;
  const hasEmotionalAwareness = hasCategorization && watchedEmotionalState;

  const getFeedbackMessage = () => {
    if (hasEmotionalAwareness) {
      return "🎉 Perfect! You're experiencing mindful spending in action. Notice how this awareness feels different?";
    }
    if (hasCategorization) {
      return '🧘 Great! Now tune into your emotions - this is where mindful spending becomes powerful.';
    }
    if (hasBasicInfo) {
      return "👍 Good start! Now let's categorize this purchase to understand your spending patterns.";
    }
    return '';
  };

  const onSubmit = async (data: SpendForm) => {
    if (!account?.id || !periodId || !walletId) {
      showErrorNotification('Missing setup information. Please try again.');
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

      showNotification('Amazing! You just completed your first mindful spend! 🎉');
      onComplete();
      stepProps.onNext?.();
    } catch (error) {
      console.error('Failed to create spend:', error);
      showErrorNotification('Failed to log spending. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = Boolean(hasBasicInfo && watchedCategory);

  return (
    <OnboardingStep
      {...stepProps}
      title='Your First Mindful Spend'
      subtitle='Experience the power of awareness by logging a recent purchase'
      canGoNext={canProceed && !isSubmitting}
      isLoading={isSubmitting}
      nextButtonLabel='Complete Experience'
      onNext={handleSubmit(onSubmit)}
    >
      <CenterContainer>
        <IntroCard>
          <IonCardContent>
            <IntroText>
              Think of something you bought recently (coffee, lunch, online order) and log it here.
              You'll experience how mindful spending awareness works!
            </IntroText>
          </IonCardContent>
        </IntroCard>

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
                  max: { value: 1000, message: "Let's start with something smaller" },
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

          {hasBasicInfo && (
            <>
              <Gap size='md' />
              <IonItem>
                <IonLabel>
                  <SelectFormField
                    name='category'
                    label='What type of purchase was this?'
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
            </>
          )}

          {hasCategorization && (
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
                    placeholder='Was this planned? How do you feel about it now?'
                    register={register}
                    setValue={setValue}
                    error={errors.notes}
                    fill='outline'
                    maxlength={150}
                  />
                </IonLabel>
              </IonItem>
            </MindfulnessSection>
          )}
        </IonList>

        <RealtimeFeedback $show={!!getFeedbackMessage()}>
          <FeedbackText>{getFeedbackMessage()}</FeedbackText>
        </RealtimeFeedback>
      </CenterContainer>
    </OnboardingStep>
  );
};

export default FirstExperienceStep;
