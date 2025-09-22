import { InputFormField, TextAreaFormField } from '@/components/forms';
import { TransparentIonList } from '@/styles/IonList.styled';
import { SectionLabel } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonItem, IonLabel } from '@ionic/react';
import type React from 'react';
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import styled from 'styled-components';
import type { PeriodFormData } from '../hooks/useMultiStepForm';

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

interface StepBasicsProps {
  formData: PeriodFormData;
  register: UseFormRegister<PeriodFormData>;
  control: Control<PeriodFormData>;
  setValue: UseFormSetValue<PeriodFormData>;
  errors: FieldErrors<PeriodFormData>;
  onUpdate: (data: Pick<PeriodFormData, 'goals' | 'startAt' | 'endAt'>) => void;
}

const StepBasics: React.FC<StepBasicsProps> = ({
  formData,
  register,
  setValue,
  errors,
  onUpdate,
}) => {
  const maxGoalsLength = 500;

  const handleDateChange = (field: 'startAt' | 'endAt', value: string) => {
    onUpdate({
      goals: formData.goals,
      startAt: field === 'startAt' ? value : formData.startAt,
      endAt: field === 'endAt' ? value : formData.endAt,
    });
  };

  return (
    <>
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
              }}
            />
          </IonLabel>
        </IonItem>
      </TransparentIonList>
    </>
  );
};

export default StepBasics;
