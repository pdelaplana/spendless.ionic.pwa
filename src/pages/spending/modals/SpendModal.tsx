import { InputFormField, SelectFormField } from '@/components/forms';
import TextAreaFormField from '@/components/forms/fields/TextAreaFormField';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton, ActionSheetButton, Gap } from '@/components/shared';
import type { ActionOption } from '@/components/shared/base/buttons/ActionSheetButton';
import { createSpend, type ISpend, type SpendCategory } from '@/domain/Spend';
import { IonItem, IonLabel, IonList, useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useEffect, useMemo, useState } from 'react';
import { type RegisterOptions, type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { spendValidation } from '@/domain/validation/spendValidation';

interface SpendFormData {
  id?: string;
  accountId: string;
  periodId?: string;
  date: string;
  category: SpendCategory;
  amount: number;
  description: string;
  notes?: string;
}

interface SpendModalProps {
  spend?: ISpend;
  onSave: (spend: Partial<ISpend>) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const SpendModal: React.FC<SpendModalProps> = ({ spend, onSave, onDismiss }) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm<SpendFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: 'need',
      description: '',
    },
    mode: 'onChange',
  });

  const spendCategorySelectionOptions = useMemo(() => {
    return [
      {
        value: 'need',
        label: t('spend.categories.need'),
      },
      {
        value: 'want',
        label: t('spend.categories.want'),
      },
      {
        value: 'culture',
        label: t('spend.categories.culture'),
      },
      {
        value: 'unexpected',
        label: t('spend.categories.unexpected'),
      },
    ];
  }, [t]);

  const onSubmit: SubmitHandler<SpendFormData> = async (formData) => {
    const spend = createSpend({
      accountId: formData.accountId,
      periodId: formData?.periodId ?? '',
      date: new Date(formData.date),
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      notes: formData.notes,
    });

    if (formData.id) {
      onSave({ ...spend, id: formData.id });
    } else {
      onSave(spend);
    }
    onDismiss();
  };

  const onActionSelected = async (action: ActionOption) => {
    switch (action.data) {
      case 'delete':
        // Handle delete action
        break;
      case 'save':
        // Handle edit action
        onSubmit(getValues());
        break;

      default:
        break;
    }
  };

  const footer = (
    <CenterContainer>
      <Gap size={'.65rem'} />
      {spend?.id && (
        <ActionSheetButton
          buttonLabel={'Options...'}
          sheetTitle='Options...'
          expand='full'
          fill='solid'
          className='ion-margin-bottom'
          options={[
            {
              text: 'Delete',
              role: 'destructive',
              data: 'delete',
            },
            {
              text: 'Save',
              data: 'save',
            },
          ]}
          onActionComplete={onActionSelected}
        />
      )}
      {!spend?.id && (
        <ActionButton
          expand='full'
          fill='solid'
          className='ion-margin-bottom'
          onClick={handleSubmit(onSubmit)}
          isLoading={false}
          isDisabled={false}
          label={'Save'}
        />
      )}
    </CenterContainer>
  );

  useEffect(() => {
    if (spend) {
      reset({
        id: spend.id,
        accountId: spend.accountId,
        periodId: spend.periodId,
        date: spend.date?.toISOString().split('T')[0] ?? '',
        category: spend.category,
        amount: spend.amount,
        description: spend.description,
        notes: spend.notes,
      });
    }
  }, [spend, reset]);

  return (
    <ModalPageLayout onDismiss={onDismiss} footer={footer}>
      <CenterContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList lines='none'>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='Date'
                  name='date'
                  type='date'
                  placeholder='Enter date'
                  register={register}
                  error={errors.date}
                  fill='outline'
                  validationRules={spendValidation.date as RegisterOptions<SpendFormData>}
                />
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <SelectFormField
                  name='category'
                  label='Category'
                  fill='outline'
                  register={register}
                  setValue={setValue}
                  getValues={getValues}
                  optionsList={spendCategorySelectionOptions}
                  validationRules={spendValidation.category as RegisterOptions<SpendFormData>}
                  error={errors.category}
                />
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='Description'
                  name='description'
                  placeholder='Enter description'
                  register={register}
                  error={errors.description}
                  fill='outline'
                  validationRules={spendValidation.description as RegisterOptions<SpendFormData>}
                />
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='Amount'
                  name='amount'
                  type='number'
                  placeholder='Enter amount'
                  register={register}
                  error={errors.amount}
                  fill='outline'
                  validationRules={spendValidation.amount as RegisterOptions<SpendFormData>}
                />
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <TextAreaFormField
                  label='Notes'
                  name='notes'
                  placeholder='Enter notes'
                  register={register}
                  error={errors.notes}
                  fill='outline'
                  validationRules={spendValidation.notes as RegisterOptions<SpendFormData>}
                />
              </IonLabel>
            </IonItem>
          </IonList>
        </form>
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default SpendModal;

export const useSpendModal = (): {
  open: (spend: ISpend, onSave: (spend: ISpend) => void) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    spend?: ISpend;
    onSave?: (spend: ISpend) => void;
  }>();

  const [present, dismiss] = useIonModal(SpendModal, {
    spend: inputs?.spend,
    onSave: inputs?.onSave,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (spend: ISpend, onSave: (spend: ISpend) => void) => {
      setInputs({
        spend,
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
