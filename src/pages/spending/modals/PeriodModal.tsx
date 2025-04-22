import { InputFormField } from '@/components/forms';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { Gap, ActionButton } from '@/components/shared';
import type { IPeriod } from '@/domain/Period';
import { IonItem, IonLabel, IonList, useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

interface PeriodFormData {
  id?: string;
  accountId: string;
  goals: string;
  targetSpend: number;
  targetSavings: number;
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
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isDirty },
    reset,
  } = useForm<PeriodFormData>({
    defaultValues: {
      goals: '',
      targetSpend: 0,
      targetSavings: 0,
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
      targetSpend: formData.targetSpend,
      targetSavings: formData.targetSavings,
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
        targetSpend: period.targetSpend,
        targetSavings: period.targetSavings,
        startAt: period.startAt.toISOString().split('T')[0],
        endAt: period.endAt.toISOString().split('T')[0],
        reflection: period.reflection,
      });
    }
  }, [period, reset]);

  return (
    <ModalPageLayout onDismiss={onDismiss} footer={footer}>
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
  open: (period: IPeriod, onSave: (period: IPeriod) => void) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    period?: IPeriod;
    onSave?: (period: IPeriod) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodModal, {
    period: inputs?.period,
    onSave: inputs?.onSave,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (period: IPeriod, onSave: (period: IPeriod) => void) => {
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
