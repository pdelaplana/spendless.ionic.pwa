import { InputFormField, SelectFormField } from '@/components/forms';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton, Gap } from '@/components/shared';
import DestructiveButton from '@/components/shared/base/buttons/DestructiveButton';
import NiceTags from '@/components/shared/tags/NiceTags';
import CurrencyAmountInput from '@/components/ui/CurrencyAmountInput';
import { Currency } from '@/domain/Currencies';
import {
  type IRecurringSpend,
  type ScheduleFrequency,
  createRecurringSpend,
  getDayOfMonthLabel,
  getDayOfWeekLabel,
} from '@/domain/RecurringSpend';
import type { SpendCategory } from '@/domain/Spend';
import type { IWallet } from '@/domain/Wallet';
import { usePrompt } from '@/hooks';
import { TransparentIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import { getCategoryIcon } from '@/utils';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonDatetime,
  IonIcon,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { calendarOutline, heartSharp, repeatOutline, walletOutline } from 'ionicons/icons';
import { useCallback, useEffect, useMemo } from 'react';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { RecurringSpendFormData } from './types';

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const CategoryItem = styled.div<{ selected?: boolean }>`
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${(props) =>
    props.selected &&
    `
    border-color: white;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 600;
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ScheduleCard = styled(IonCard)`
  --background: ${designSystem.colors.gray[50]};
  margin-top: 16px;
  padding: 0;
`;

interface RecurringSpendModalProps {
  recurringSpend?: IRecurringSpend;
  wallets: IWallet[];
  onSave: (recurringSpend: Partial<IRecurringSpend>) => void;
  onDelete: (recurringSpendId: string) => void;
  suggestedTags?: string[];
  currency?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const RecurringSpendModal: React.FC<RecurringSpendModalProps> = ({
  recurringSpend,
  wallets,
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
  } = useForm<RecurringSpendFormData>({
    defaultValues: {
      accountId: recurringSpend?.accountId || '',
      walletId: recurringSpend?.walletId || '',
      startDate: recurringSpend?.startDate
        ? new Date(recurringSpend.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      amount: '0',
      category: 'need',
      description: '',
      scheduleFrequency: 'monthly',
      dayOfMonth: 1,
      isActive: true,
    },
    mode: 'onChange',
  });

  const scheduleFrequency = useWatch({ name: 'scheduleFrequency', control });
  const category = useWatch({ name: 'category', control });
  const tags = useWatch({ name: 'tags', control });
  const dayOfWeek = useWatch({ name: 'dayOfWeek', control });
  const dayOfMonth = useWatch({ name: 'dayOfMonth', control });
  const startDate = useWatch({ name: 'startDate', control });

  // Calculate next 3 scheduled dates for preview
  const nextScheduledDates = useMemo(() => {
    const dates: Date[] = [];

    // Use start date as the basis for calculation
    const baseDate = startDate ? new Date(startDate) : new Date();
    baseDate.setHours(0, 0, 0, 0);

    if (scheduleFrequency === 'weekly') {
      const targetDay = dayOfWeek ?? 0;
      const current = new Date(baseDate);

      // Find next occurrence from start date
      const daysUntilTarget = (targetDay - current.getDay() + 7) % 7;
      if (daysUntilTarget > 0) {
        current.setDate(current.getDate() + daysUntilTarget);
      }

      for (let i = 0; i < 3; i++) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }
    } else if (scheduleFrequency === 'fortnightly') {
      const targetDay = dayOfWeek ?? 0;
      const current = new Date(baseDate);

      const daysUntilTarget = (targetDay - current.getDay() + 7) % 7;
      if (daysUntilTarget > 0) {
        current.setDate(current.getDate() + daysUntilTarget);
      }

      for (let i = 0; i < 3; i++) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 14);
      }
    } else if (scheduleFrequency === 'monthly') {
      const targetDay = dayOfMonth ?? 1;
      const current = new Date(baseDate);

      // Helper function to get last day of month
      const getLastDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      };

      // Set to target day of start month (capped at last day of month)
      const currentMonthLastDay = getLastDayOfMonth(current);
      current.setDate(Math.min(targetDay, currentMonthLastDay));

      for (let i = 0; i < 3; i++) {
        dates.push(new Date(current));
        current.setDate(1); // Set to day 1 before incrementing month
        current.setMonth(current.getMonth() + 1);
        const monthLastDay = getLastDayOfMonth(current);
        current.setDate(Math.min(targetDay, monthLastDay));
      }
    }

    return dates;
  }, [scheduleFrequency, dayOfWeek, dayOfMonth, startDate]);

  const handleAmountChange = useCallback(
    (value: number) => {
      setValue('amount', value.toFixed(2), { shouldDirty: true });
    },
    [setValue],
  );

  const handleTagsChange = useCallback(
    (newTags: string[]) => {
      setValue('tags', newTags, { shouldDirty: true });
    },
    [setValue],
  );

  const handleCategorySelect = useCallback(
    (cat: SpendCategory) => {
      setValue('category', cat, { shouldDirty: true });
    },
    [setValue],
  );

  const onSubmit: SubmitHandler<RecurringSpendFormData> = async (formData) => {
    console.log('RecurringSpendModal onSubmit - formData:', formData);

    const newRecurringSpend = createRecurringSpend({
      accountId: formData.accountId,
      walletId: formData.walletId,
      startDate: new Date(formData.startDate),
      description: formData.description,
      amount: Number(formData.amount),
      category: formData.category,
      tags: formData.tags || [],
      scheduleFrequency: formData.scheduleFrequency,
      dayOfWeek: formData.dayOfWeek,
      dayOfMonth: formData.dayOfMonth,
      isActive: formData.isActive,
    });

    console.log('RecurringSpendModal onSubmit - newRecurringSpend:', newRecurringSpend);

    if (formData.id) {
      onSave({ ...newRecurringSpend, id: formData.id });
    } else {
      onSave(newRecurringSpend);
    }
    onDismiss();
  };

  const handleDelete = () => {
    showConfirmPrompt({
      title: t('recurringSpend.modal.delete.title'),
      message: t('recurringSpend.modal.delete.message'),
      onConfirm: async () => {
        onDelete(recurringSpend?.id ?? '');
        onDismiss();
      },
      onCancel: () => {},
    });
  };

  const checkIfCanDismiss = () => {
    if (isDirty) {
      showConfirmPrompt({
        title: t('recurringSpend.modal.unsaved.title'),
        message: t('recurringSpend.modal.unsaved.message'),
        onConfirm: () => {
          onDismiss();
        },
        onCancel: () => {},
      });
    } else {
      onDismiss();
    }
  };

  const categoryItems = useMemo(() => {
    return [
      { label: t('spending.categories.need'), value: 'need' as SpendCategory },
      { label: t('spending.categories.rituals'), value: 'rituals' as SpendCategory },
      { label: t('spending.categories.connections'), value: 'connections' as SpendCategory },
      { label: t('spending.categories.want'), value: 'want' as SpendCategory },
      { label: t('spending.categories.culture'), value: 'culture' as SpendCategory },
      { label: t('spending.categories.unexpected'), value: 'unexpected' as SpendCategory },
    ].map((item) => (
      <CategoryItem
        key={item.label}
        selected={item.value === category}
        onClick={() => handleCategorySelect(item.value)}
      >
        <IonIcon icon={getCategoryIcon(item.value).icon} style={{ fontSize: '1.125rem' }} />
        {item.label}
      </CategoryItem>
    ));
  }, [t, category, handleCategorySelect]);

  useEffect(() => {
    if (recurringSpend) {
      reset({
        id: recurringSpend.id,
        accountId: recurringSpend.accountId,
        walletId: recurringSpend.walletId,
        startDate: new Date(recurringSpend.startDate).toISOString().split('T')[0],
        description: recurringSpend.description,
        amount: recurringSpend.amount.toFixed(2),
        category: recurringSpend.category,
        tags: recurringSpend.tags ?? [],
        scheduleFrequency: recurringSpend.scheduleFrequency,
        dayOfWeek: recurringSpend.dayOfWeek,
        dayOfMonth: recurringSpend.dayOfMonth,
        isActive: recurringSpend.isActive,
      });
    }
  }, [recurringSpend, reset]);

  return (
    <ModalPageLayout onDismiss={checkIfCanDismiss}>
      <CenterContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CurrencyAmountInput
            label='Recurring Amount'
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
                  label={t('recurringSpend.modal.description.label')}
                  name='description'
                  placeholder={t('recurringSpend.modal.description.placeholder')}
                  register={register}
                  error={errors.description}
                  fill='outline'
                  validationRules={{ required: t('recurringSpend.modal.description.required') }}
                />
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <SelectFormField
                  label={t('recurringSpend.modal.wallet.label')}
                  name='walletId'
                  fill='outline'
                  placeholder={t('recurringSpend.modal.wallet.placeholder')}
                  setValue={setValue}
                  getValues={getValues}
                  error={errors.walletId}
                  validationRules={{ required: t('recurringSpend.modal.wallet.required') }}
                  optionsList={wallets.map((wallet) => ({
                    label: wallet.name,
                    value: wallet.id || '',
                  }))}
                />
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <NiceTags
                  initialTags={tags || []}
                  suggestions={suggestedTags}
                  onTagsChange={handleTagsChange}
                />
              </IonLabel>
            </IonItem>
          </TransparentIonList>

          {/* Category Section */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IonIcon icon={heartSharp} style={{ fontSize: '1.25rem' }} />
                Mindfulness Categories
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className='ion-margin-bottom'>
                Choose a category that best fits this recurring expense.
              </div>
              <CategoryGrid>{categoryItems}</CategoryGrid>
            </IonCardContent>
          </IonCard>

          {/* Schedule Section */}
          <ScheduleCard>
            <IonCardHeader>
              <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IonIcon icon={repeatOutline} style={{ fontSize: '1.25rem' }} />
                Schedule
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className='ion-no-padding ion-padding-vertical'>
              <IonItem lines='none'>
                <IonLabel>
                  <InputFormField
                    label='Start Date'
                    name='startDate'
                    type='date'
                    placeholder='Select start date'
                    register={register}
                    error={errors.startDate}
                    fill='outline'
                  />
                </IonLabel>
              </IonItem>

              <IonItem lines='none'>
                <IonLabel>
                  <SelectFormField
                    label='Frequency'
                    fill='outline'
                    name='scheduleFrequency'
                    setValue={setValue}
                    getValues={getValues}
                    error={errors.scheduleFrequency}
                    optionsList={[
                      { label: 'Weekly', value: 'weekly' },
                      { label: 'Fortnightly (Every 2 weeks)', value: 'fortnightly' },
                      { label: 'Monthly', value: 'monthly' },
                    ]}
                  />
                </IonLabel>
              </IonItem>

              {(scheduleFrequency === 'weekly' || scheduleFrequency === 'fortnightly') && (
                <IonItem lines='none'>
                  <IonLabel>
                    <SelectFormField
                      label='Day of Week'
                      fill='outline'
                      name='dayOfWeek'
                      setValue={setValue}
                      getValues={getValues}
                      error={errors.dayOfWeek}
                      optionsList={[0, 1, 2, 3, 4, 5, 6].map((day) => ({
                        label: getDayOfWeekLabel(day),
                        value: day.toString(),
                      }))}
                    />
                  </IonLabel>
                </IonItem>
              )}

              {scheduleFrequency === 'monthly' && (
                <IonItem lines='none'>
                  <IonLabel>
                    <SelectFormField
                      label='Day of Month'
                      name='dayOfMonth'
                      fill='outline'
                      setValue={setValue}
                      getValues={getValues}
                      error={errors.dayOfMonth}
                      optionsList={Array.from({ length: 31 }, (_, i) => i + 1).map((day) => ({
                        label: getDayOfMonthLabel(day),
                        value: day.toString(),
                      }))}
                    />
                  </IonLabel>
                </IonItem>
              )}

              {/* Preview of next scheduled dates */}
              {nextScheduledDates.length > 0 && (
                <div
                  style={{ padding: '16px', fontSize: '14px', color: 'var(--ion-color-medium)' }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Next scheduled dates:</div>
                  {nextScheduledDates.map((date) => (
                    <div key={date.getTime()} style={{ marginLeft: '8px', marginBottom: '4px' }}>
                      •{' '}
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  ))}
                </div>
              )}
            </IonCardContent>
          </ScheduleCard>
        </form>

        <Gap size={designSystem.spacing.md} />

        <ActionButton
          expand='block'
          fill='solid'
          className='ion-margin-bottom ion-margin-start ion-margin-end'
          onClick={handleSubmit(onSubmit)}
          isLoading={false}
          isDisabled={false}
          label='Save'
        />

        {recurringSpend?.id && (
          <DestructiveButton
            expand='full'
            className='ion-margin-bottom ion-margin-start ion-margin-end'
            onClick={handleDelete}
            label='Delete'
            prompt=''
          />
        )}
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default RecurringSpendModal;
