import { InputFormField, TextAreaFormField } from '@/components/forms';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton } from '@/components/shared';
import type { IPeriod } from '@/domain/Period';
import { usePrompt } from '@/hooks';
import { TransparentIonList } from '@/styles/IonList.styled';
import { SectionLabel } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonItem, IonLabel, IonTitle } from '@ionic/react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: ${designSystem.spacing.lg};
  padding-left: 16px;
  padding-right: 16px;
`;

const ModalTitle = styled(IonTitle)`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
`;

const FormContent = styled.div`
  margin-bottom: ${designSystem.spacing.lg};
  padding-left: 16px;
  padding-right: 16px;
`;

const ProminentGoalsInput = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
`;

const GoalsLabel = styled.h2`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

const NavigationContainer = styled.div`
  display: flex;
  gap: ${designSystem.spacing.md};
  margin-top: ${designSystem.spacing.xl};
  padding: ${designSystem.spacing.md} 16px;
`;

interface PeriodEditFormData {
  goals: string;
  startAt: string;
  endAt: string;
}

interface PeriodEditModalProps {
  period: IPeriod;
  onSave: (period: Partial<IPeriod>) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const PeriodEditModal: React.FC<PeriodEditModalProps> = ({ period, onSave, onDismiss }) => {
  const { showConfirmPrompt } = usePrompt();
  const maxGoalsLength = 500;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<PeriodEditFormData>({
    defaultValues: {
      goals: period.goals,
      startAt: period.startAt.toISOString().split('T')[0],
      endAt: period.endAt.toISOString().split('T')[0],
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: PeriodEditFormData) => {
    if (!onSave) return;

    setIsSubmitting(true);
    try {
      const updatedPeriod: Partial<IPeriod> = {
        id: period.id,
        goals: data.goals,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      };

      console.log('PeriodEditModal: Saving period data:', updatedPeriod);
      await onSave(updatedPeriod);
      console.log('PeriodEditModal: Save completed, dismissing modal');
      onDismiss();
    } catch (error) {
      console.error('Failed to save period:', error);
      showConfirmPrompt({
        title: 'Save Error',
        message: 'Failed to save period changes. Please try again.',
        onConfirm: () => {},
        onCancel: () => {},
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    if (isDirty) {
      showConfirmPrompt({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        onConfirm: () => onDismiss(),
        onCancel: () => {},
      });
    } else {
      onDismiss();
    }
  };

  return (
    <ModalPageLayout onDismiss={handleDismiss}>
      <CenterContainer>
        <ModalHeader>
          <ModalTitle>Edit Period</ModalTitle>
        </ModalHeader>

        <FormContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Prominent Goals Input */}
            <ProminentGoalsInput>
              <GoalsLabel>What are your goals for this period?</GoalsLabel>
              <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
                <IonItem>
                  <IonLabel>
                    <TextAreaFormField
                      name='goals'
                      label='Goals'
                      placeholder='Describe what you want to achieve with your spending this period...'
                      register={register}
                      setValue={setValue}
                      error={errors.goals}
                      fill='outline'
                      counter={true}
                      maxlength={maxGoalsLength}
                      validationRules={{
                        required: 'Goals are required',
                        minLength: {
                          value: 3,
                          message: 'Goals must be at least 3 characters',
                        },
                        maxLength: {
                          value: maxGoalsLength,
                          message: `Goals must be no more than ${maxGoalsLength} characters`,
                        },
                      }}
                    />
                  </IonLabel>
                </IonItem>
              </TransparentIonList>
            </ProminentGoalsInput>

            {/* Date Selection */}
            <SectionLabel>Period Duration</SectionLabel>
            <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
              <IonItem>
                <IonLabel>
                  <InputFormField
                    label='Start Date'
                    name='startAt'
                    type='date'
                    placeholder='Enter start date'
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
                    label='End Date'
                    name='endAt'
                    type='date'
                    placeholder='Enter end date'
                    register={register}
                    error={errors.endAt}
                    fill='outline'
                    validationRules={{
                      required: 'End date is required',
                      validate: (value, formValues) => {
                        if (!value || !formValues.startAt) return true;
                        return (
                          new Date(value) > new Date(formValues.startAt) ||
                          'End date must be after start date'
                        );
                      },
                    }}
                  />
                </IonLabel>
              </IonItem>
            </TransparentIonList>
          </form>
        </FormContent>

        <NavigationContainer>
          <ActionButton
            expand='block'
            fill='solid'
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            isDisabled={!isValid || isSubmitting}
            label='Save Changes'
            style={{ width: '100%' }}
          />
        </NavigationContainer>
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default PeriodEditModal;
