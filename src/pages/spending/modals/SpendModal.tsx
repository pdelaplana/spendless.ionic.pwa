import { CenterContainer, Content } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton, ActionSheetButton, Gap } from '@/components/shared';
import type { ActionOption } from '@/components/shared/base/buttons/ActionSheetButton';
import { type ISpend, type SpendCategory, createSpend } from '@/domain/Spend';
import { usePrompt } from '@/hooks';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CategorySection from '../components/common/categorySection/CategorySection';
import EmotionalAwarenessSection from '../components/common/emotionalAwarenessSection/EmotionalAwarenessSection';
import PersonalReflectionSection from '../components/common/personalReflectionSection/PersonalReflectionSection';
import RatingSection from '../components/common/ratingSection/RatingSection';
import SpendFormSection from '../components/common/spendFormSection/SpendFormSection';

export interface SpendFormData {
  id?: string;
  accountId: string;
  periodId?: string;
  date: string;
  category: SpendCategory;
  amount: string;
  description: string;
  notes?: string;
  recurring?: boolean;

  emotionalState?: string;
  satisfactionRating?: number;
  necessityRating?: number;

  personalReflections?: Array<{
    question: string;
    answer: string;
  }>;
}

interface SpendModalProps {
  spend?: ISpend;
  onSave: (spend: Partial<ISpend>) => void;
  onDelete: (spendId: string) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const SpendModal: React.FC<SpendModalProps> = ({ spend, onSave, onDelete, onDismiss }) => {
  const { t } = useTranslation();
  const { showConfirmPrompt } = usePrompt();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isDirty },
    reset,
    control,
  } = useForm<SpendFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: '0',
      category: 'need',
      description: '',
    },
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<SpendFormData> = async (formData) => {
    const spend = createSpend({
      accountId: formData.accountId,
      periodId: formData?.periodId ?? '',
      date: new Date(formData.date),
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      notes: formData.notes,
      recurring: formData.recurring,
      emotionalState: formData.emotionalState,
      satisfactionRating: formData.satisfactionRating,
      necessityRating: formData.necessityRating,
      personalReflections:
        formData.personalReflections?.map((reflection) => ({
          question: reflection.question,
          answer: reflection.answer,
        })) ?? [],
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
        showConfirmPrompt({
          title: t('spend.deleteSpend'),
          message: t('spend.deleteSpendMessage'),
          onConfirm: async () => {
            onDelete(spend?.id ?? '');
            onDismiss();
          },
          onCancel: () => {
            // Handle cancel action
          },
        });
        break;
      case 'save':
        // Handle edit action
        onSubmit(getValues());
        break;

      default:
        break;
    }
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
      {spend?.id && (
        <ActionSheetButton
          buttonLabel={'Options...'}
          sheetTitle='Options...'
          expand='full'
          fill='solid'
          className='ion-margin-bottom ion-margin-start ion-margin-end'
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
          className='ion-margin-bottom ion-margin-start ion-margin-end'
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
        amount: spend.amount.toFixed(2),
        description: spend.description,
        notes: spend.notes,
        recurring: spend.recurring,
        emotionalState: spend.emotionalState,
        satisfactionRating: spend.satisfactionRating,
        necessityRating: spend.necessityRating,
        personalReflections:
          spend.personalReflections?.map((reflection) => ({
            question: reflection.question,
            answer: reflection.answer,
          })) ?? [],
      });
    }
  }, [spend, reset]);

  return (
    <ModalPageLayout onDismiss={checkIfCanDismiss} footer={footer}>
      <CenterContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CategorySection setValue={setValue} control={control} />
          <SpendFormSection
            register={register}
            setValue={setValue}
            getValues={getValues}
            errors={errors}
          />
          <Gap size={'1rem'} />
          <EmotionalAwarenessSection setValue={setValue} control={control} />
          <Gap size={'1rem'} />
          <RatingSection setValue={setValue} control={control} />
          <Gap size={'1rem'} />
          <PersonalReflectionSection setValue={setValue} control={control} register={register} />
        </form>

        <Gap size={'1rem'} />
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default SpendModal;

export const useSpendModal = (): {
  open: (
    spend: ISpend,
    onSave: (spend: ISpend) => void,
    onDelete: (spendId: string) => void,
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    spend?: ISpend;
    onSave?: (spend: ISpend) => void;
    onDelete?: (spendId: string) => void;
  }>();

  const [present, dismiss] = useIonModal(SpendModal, {
    spend: inputs?.spend,
    onSave: inputs?.onSave,
    onDelete: inputs?.onDelete,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (spend: ISpend, onSave: (spend: ISpend) => void, onDelete: (spendId: string) => void) => {
      setInputs({
        spend,
        onSave,
        onDelete,
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
