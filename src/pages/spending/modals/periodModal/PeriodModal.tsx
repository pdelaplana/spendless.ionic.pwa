import { InputFormField } from '@/components/forms';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton, Gap } from '@/components/shared';
import type { CreatePeriodDTO, IPeriod } from '@/domain/Period';
import { periodValidation } from '@/domain/validation/periodValidation';
import { usePrompt } from '@/hooks';
import { IonItem, IonLabel, IonList, useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useEffect, useState } from 'react';
import { type RegisterOptions, type SubmitHandler, useForm } from 'react-hook-form';
import MindfulnessSection from '../../components/common/mindfulnessSection/MindfulnessSection';

interface PeriodFormData {
  id?: string;
  accountId: string;
  goals: string;
  targetSpend: string;
  targetSavings: string;
  startAt: string;
  endAt: string;
  reflection: string;
  closedAt?: Date;
}

interface PeriodModalProps {
  period?: IPeriod;
  onSave: (period: Partial<IPeriod>) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const PeriodModal: React.FC<PeriodModalProps> = ({ period, onSave, onDismiss }) => {
  const { showConfirmPrompt } = usePrompt();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PeriodFormData>({
    defaultValues: {
      goals: '',
      targetSpend: '0',
      targetSavings: '0',
      startAt: new Date().toISOString().split('T')[0],
      endAt: new Date().toISOString().split('T')[0],
      reflection: '',
    },
  });

  const onSubmit: SubmitHandler<PeriodFormData> = async (formData) => {
    const startDate = new Date(formData.startAt);
    const endDate = new Date(formData.endAt);
    const periodName = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    const periodData: Partial<IPeriod> = {
      name: periodName,
      goals: formData.goals,
      targetSpend: Number(formData.targetSpend),
      targetSavings: Number(formData.targetSavings),
      startAt: new Date(formData.startAt),
      endAt: new Date(formData.endAt),
    };
    if (formData.id) {
      onSave({ ...periodData, id: formData.id });
    } else {
      onSave(periodData);
    }
    onDismiss();
  };

  const checkIfCanDismiss = () => {
    if (isDirty) {
      showConfirmPrompt({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close this form?',
        onConfirm: () => {
          onDismiss();
        },
        onCancel: () => {
          // Do nothing, keep the modal open
        },
      });
    } else {
      // No changes, dismiss immediately
      onDismiss();
    }
  };

  const footer = (
    <CenterContainer>
      <Gap size={'.65rem'} />
      <ActionButton
        expand='full'
        fill='solid'
        className='ion-margin-bottom ion-margin-start ion-margin-end'
        onClick={handleSubmit(onSubmit)}
        isLoading={false}
        isDisabled={!isDirty}
        label={'Save'}
      />
    </CenterContainer>
  );

  useEffect(() => {
    if (period) {
      reset({
        id: period.id,
        goals: period.goals,
        targetSpend: period.targetSpend.toFixed(2),
        targetSavings: period.targetSavings.toFixed(2),
        startAt: period.startAt.toISOString().split('T')[0],
        endAt: period.endAt.toISOString().split('T')[0],
        reflection: period.reflection,
      });
    }
  }, [period, reset]);

  return (
    <ModalPageLayout onDismiss={checkIfCanDismiss} footer={footer}>
      <CenterContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList lines='none'>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='Goal for this period'
                  name='goals'
                  type='text'
                  placeholder='Enter goals'
                  register={register}
                  error={errors.goals}
                  fill='outline'
                  validationRules={periodValidation.goals as RegisterOptions<PeriodFormData>}
                />
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='Target Spend this Period'
                  name='targetSpend'
                  type='number'
                  placeholder='Enter target spend'
                  register={register}
                  error={errors.targetSpend}
                  fill='outline'
                  validationRules={periodValidation.targetSpend as RegisterOptions<PeriodFormData>}
                />
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='Target Savings this Period'
                  name='targetSavings'
                  type='number'
                  placeholder='Enter target savings'
                  register={register}
                  error={errors.targetSavings}
                  fill='outline'
                  validationRules={
                    periodValidation.targetSavings as RegisterOptions<PeriodFormData>
                  }
                />
              </IonLabel>
            </IonItem>
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
                  validationRules={periodValidation.startAt as RegisterOptions<PeriodFormData>}
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
                  validationRules={periodValidation.endAt as RegisterOptions<PeriodFormData>}
                />
              </IonLabel>
            </IonItem>
          </IonList>
        </form>
      </CenterContainer>
    </ModalPageLayout>
  );
};

export const usePeriodModal = (): {
  open: (period: CreatePeriodDTO, onSave: (period: IPeriod) => void) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    period?: CreatePeriodDTO;
    onSave?: (period: IPeriod) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodModal, {
    period: inputs?.period,
    onSave: inputs?.onSave,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (period: Omit<IPeriod, 'createdAt' | 'updatedAt'>, onSave: (period: IPeriod) => void) => {
      setInputs({
        period,
        onSave,
      });
      return new Promise((resolve) => {
        present({
          onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            if (ev.detail.role) {
              resolve({ role: ev.detail.role });
            }
          },
        });
      });
    },
  };
};

export default PeriodModal;
