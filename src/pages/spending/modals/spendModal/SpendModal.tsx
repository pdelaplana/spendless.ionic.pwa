import { InputFormField } from '@/components/forms';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton, ActionSheetButton, Gap } from '@/components/shared';
import type { ActionOption } from '@/components/shared/base/buttons/ActionSheetButton';
import DestructiveButton from '@/components/shared/base/buttons/DestructiveButton';
import { ProminentAmountInput } from '@/components/ui';
import { Currency } from '@/domain/Currencies';
import { type ISpend, createSpend } from '@/domain/Spend';
import { spendValidation } from '@/domain/validation';
import { usePrompt } from '@/hooks';
import { TransparentIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import { IonItem, IonLabel } from '@ionic/react';
import { useCallback, useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CategorySection from '../../components/common/categorySection/CategorySection';
import SpendFormSection from '../../components/common/spendFormSection/SpendFormSection';
import type { SpendFormData } from './types';

interface SpendModalProps {
  spend?: ISpend;
  onSave: (spend: Partial<ISpend>) => void;
  onDelete: (spendId: string) => void;
  suggestedTags?: string[];
  currency?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const SpendModal: React.FC<SpendModalProps> = ({
  spend,
  onSave,
  onDelete,
  suggestedTags,
  currency: currencyCode,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { showConfirmPrompt } = usePrompt();
  const currency = Currency.fromCode(currencyCode ?? 'USD') ?? Currency.USD;

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

  const handleAmountChange = useCallback(
    (value: number) => {
      setValue('amount', value.toFixed(2), { shouldDirty: true });
    },
    [setValue],
  );

  const onSubmit: SubmitHandler<SpendFormData> = async (formData) => {
    const spend = createSpend({
      accountId: formData.accountId,
      periodId: formData?.periodId ?? '',
      walletId: formData.walletId, // Include walletId from form data
      date: new Date(formData.date),
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      notes: formData.notes,
      recurring: formData.recurring,
      emotionalState: formData.emotionalState,
      satisfactionRating: formData.satisfactionRating,
      necessityRating: formData.necessityRating,
      personalReflections: formData.personalReflections,
      tags: formData.tags || [],
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
      <Gap size={designSystem.spacing.md} />
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
          className='ion-margin-bottom ion-margin-start ion-margin-end ion-margin-top'
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
      const amountValue = spend.amount.toFixed(2);

      reset({
        id: spend.id,
        accountId: spend.accountId,
        periodId: spend.periodId,
        walletId: spend.walletId, // Preserve existing walletId
        date: spend.date?.toISOString().split('T')[0] ?? '',
        category: spend.category,
        amount: amountValue,
        description: spend.description,
        notes: spend.notes,
        recurring: spend.recurring,
        emotionalState: spend.emotionalState,
        satisfactionRating: spend.satisfactionRating,
        necessityRating: spend.necessityRating,
        personalReflections: spend.personalReflections,
        tags: spend.tags ?? [],
      });
    }
  }, [spend, reset]);

  return (
    <ModalPageLayout onDismiss={checkIfCanDismiss}>
      <CenterContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ProminentAmountInput
            label='Transaction Amount'
            value={Number.parseFloat(getValues('amount') || '0')}
            onChange={handleAmountChange}
            currency={currency}
            autoFocus={true}
            error={errors.amount?.message}
          />

          <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='What did you spend on?'
                  name='description'
                  placeholder='Describe your purchase'
                  register={register}
                  error={errors.description}
                  fill='outline'
                  validationRules={spendValidation.description}
                />
              </IonLabel>
            </IonItem>

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
                  validationRules={spendValidation.date}
                />
              </IonLabel>
            </IonItem>
          </TransparentIonList>

          <CategorySection setValue={setValue} control={control} />
          <SpendFormSection
            register={register}
            setValue={setValue}
            getValues={getValues}
            control={control}
            errors={errors}
            suggestedTags={suggestedTags}
          />
        </form>

        <Gap size={'1rem'} />
        <Gap size={designSystem.spacing.md} />
        <ActionButton
          expand='block'
          fill='solid'
          className='ion-margin-bottom ion-margin-start ion-margin-end'
          onClick={handleSubmit(onSubmit)}
          isLoading={false}
          isDisabled={false}
          label={'Save'}
        />
        {spend?.id && (
          <DestructiveButton
            expand='full'
            className='ion-margin-bottom ion-margin-start ion-margin-end'
            onClick={() =>
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
              })
            }
            label={'Delete'}
            prompt={''}
          />
        )}
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default SpendModal;
