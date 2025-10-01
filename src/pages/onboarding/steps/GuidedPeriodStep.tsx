import { InputFormField, TextAreaFormField } from '@/components/forms';
import { Gap } from '@/components/shared';
import { useCreatePeriod } from '@/hooks/api';
import { useAppNotifications } from '@/hooks/ui';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { dateUtils } from '@/utils';
import { IonCard, IonCardContent, IonItem, IonLabel, IonList } from '@ionic/react';
import type React from 'react';
import { useEffect, useState } from 'react';
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

const ExamplePeriods = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.sm};
  margin-bottom: ${designSystem.spacing.lg};
`;

const ExamplePeriod = styled.button<{ $isSelected: boolean }>`
  background: ${(props) => (props.$isSelected ? designSystem.colors.primary[100] : 'white')};
  border: 2px solid ${(props) => (props.$isSelected ? designSystem.colors.primary[500] : designSystem.colors.gray[300])};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${designSystem.colors.primary[400]};
  }
`;

const ExampleTitle = styled.div`
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  font-size: ${designSystem.typography.fontSize.sm};
`;

const ExampleDescription = styled.div`
  font-size: ${designSystem.typography.fontSize.xs};
  color: ${designSystem.colors.text.secondary};
  margin-top: ${designSystem.spacing.xs};
`;

const FormSection = styled.div`
  margin-top: ${designSystem.spacing.lg};
`;

const SectionLabel = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

interface PeriodForm {
  goals: string;
  startAt: string;
  endAt: string;
}

interface GuidedPeriodStepProps
  extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  onComplete: (periodId: string) => void;
}

interface PeriodTemplate {
  id: string;
  title: string;
  description: string;
  goals: string;
  durationDays: number;
}

const periodTemplates: PeriodTemplate[] = [
  {
    id: 'mindful-week',
    title: 'Mindful Week',
    description: 'Perfect for beginners - try mindful spending for a week',
    goals:
      'Practice mindful spending awareness for one week. Notice my emotions and thoughts before making purchases.',
    durationDays: 7,
  },
  {
    id: 'conscious-month',
    title: 'Conscious Month',
    description: 'Build lasting habits with a month-long focus',
    goals:
      'Develop better spending awareness and reduce impulse purchases. Track patterns in my spending behavior.',
    durationDays: 30,
  },
  {
    id: 'custom',
    title: 'Custom Period',
    description: 'Create your own timeframe and goals',
    goals: '',
    durationDays: 14,
  },
];

const GuidedPeriodStep: React.FC<GuidedPeriodStepProps> = ({ onComplete, ...stepProps }) => {
  const { account } = useSpendingAccount();
  const createPeriod = useCreatePeriod();
  const { showErrorNotification, showNotification } = useAppNotifications();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<PeriodForm>({
    mode: 'onChange',
  });

  const watchedGoals = watch('goals');
  const watchedStartAt = watch('startAt');
  const watchedEndAt = watch('endAt');

  // Set default dates when component loads
  useEffect(() => {
    const today = dateUtils.getCurrentDate();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    setValue('startAt', dateUtils.toDateInput(today));
    setValue('endAt', dateUtils.toDateInput(nextWeek));
  }, [setValue]);

  const handleTemplateSelect = (template: PeriodTemplate) => {
    setSelectedTemplate(template.id);
    setValue('goals', template.goals);

    if (template.id !== 'custom') {
      const today = dateUtils.getCurrentDate();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + template.durationDays);

      setValue('startAt', dateUtils.toDateInput(today));
      setValue('endAt', dateUtils.toDateInput(endDate));
    }
  };

  const onSubmit = async (data: PeriodForm) => {
    if (!account?.id) {
      showErrorNotification('Account not found. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const period = await createPeriod.mutateAsync({
        accountId: account.id,
        data: {
          name: `${dateUtils.fromDateInput(data.startAt).toLocaleDateString()} - ${dateUtils.fromDateInput(data.endAt).toLocaleDateString()}`,
          goals: data.goals,
          targetSpend: 0, // Will be set when wallets are added
          targetSavings: 0,
          startAt: dateUtils.fromDateInput(data.startAt),
          endAt: dateUtils.fromDateInput(data.endAt),
          reflection: '',
          walletSetup: [], // Will add wallets in next step
        },
      });

      showNotification('Your first period has been created!');
      onComplete(period.id);
      stepProps.onNext?.();
    } catch (error) {
      console.error('Failed to create period:', error);
      showErrorNotification('Failed to create period. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = Boolean(
    watchedGoals &&
      watchedGoals.length >= 10 &&
      watchedStartAt &&
      watchedEndAt &&
      dateUtils.fromDateInput(watchedEndAt) > dateUtils.fromDateInput(watchedStartAt),
  );

  return (
    <OnboardingStep
      {...stepProps}
      title='Create Your First Period'
      subtitle='Periods are timeframes where you focus on specific spending goals'
      canGoNext={canProceed && !isSubmitting}
      isLoading={isSubmitting}
      nextButtonLabel='Create Period'
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
              Think of periods like "financial chapters." Each one gives you a fresh start to focus
              on specific spending goals. Start small - you can always create longer periods later!
            </p>
          </IonCardContent>
        </ExplanationCard>

        <SectionLabel>Choose a Starting Point</SectionLabel>

        <ExamplePeriods>
          {periodTemplates.map((template) => (
            <ExamplePeriod
              key={template.id}
              type='button'
              $isSelected={selectedTemplate === template.id}
              onClick={() => handleTemplateSelect(template)}
            >
              <ExampleTitle>{template.title}</ExampleTitle>
              <ExampleDescription>{template.description}</ExampleDescription>
            </ExamplePeriod>
          ))}
        </ExamplePeriods>

        <FormSection>
          <IonList lines='none'>
            <IonItem>
              <IonLabel>
                <TextAreaFormField
                  name='goals'
                  label='Your Goals for This Period'
                  placeholder='What do you want to achieve with your spending awareness?'
                  register={register}
                  setValue={setValue}
                  error={errors.goals}
                  fill='outline'
                  counter={true}
                  maxlength={300}
                  validationRules={{
                    required: 'Goals are required',
                    minLength: {
                      value: 10,
                      message: 'Please describe your goals in more detail',
                    },
                  }}
                />
              </IonLabel>
            </IonItem>

            <Gap size='md' />

            <IonItem>
              <IonLabel>
                <InputFormField
                  name='startAt'
                  label='Start Date'
                  type='date'
                  register={register}
                  error={errors.startAt}
                  fill='outline'
                  validationRules={{
                    required: 'Start date is required',
                  }}
                />
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <InputFormField
                  name='endAt'
                  label='End Date'
                  type='date'
                  register={register}
                  error={errors.endAt}
                  fill='outline'
                  validationRules={{
                    required: 'End date is required',
                    validate: (value) => {
                      const startDate = dateUtils.fromDateInput(watchedStartAt || '');
                      const endDate = dateUtils.fromDateInput(value || '');
                      return endDate > startDate || 'End date must be after start date';
                    },
                  }}
                />
              </IonLabel>
            </IonItem>
          </IonList>
        </FormSection>
      </GuideContainer>
    </OnboardingStep>
  );
};

export default GuidedPeriodStep;
