import { SelectFormField } from '@/components/forms';
import { BasePageLayout, CenterContainer, Content } from '@/components/layouts';
import { ActionButton, Gap } from '@/components/shared';
import DestructiveButton from '@/components/shared/base/buttons/DestructiveButton';
import { SubscriptionCard } from '@/components/subscription';
import { StyledIonCard } from '@/components/ui';
import { CURRENCIES, type Currency } from '@/domain/Currencies';
import { DATEFORMATS, type DateFormat } from '@/domain/DateFormats';
import { useAppNotifications, usePrompt } from '@/hooks';
import { useDeleteAccountFunction, useExportDataFunction } from '@/hooks/functions';
import { useAuth } from '@/providers/auth';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { StyledIonList, StyledItem, TransparentIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import { IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel } from '@ionic/react';
import { magnetSharp } from 'ionicons/icons';
import { useEffect, useMemo } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';

const DangerCard = styled(StyledIonCard)`
  border: 1px solid ${designSystem.colors.danger};

  ion-card-title {
    color: ${designSystem.colors.danger};
  }
`;

interface SettingsFormData {
  currency: string;
  dateFormat: string;
}

const SettingsPage: React.FC = () => {
  const { signout } = useAuth();
  const { account, updateAccount, didMutationFail } = useSpendingAccount();

  const currencies = useMemo(() => {
    return CURRENCIES.map((currency: Currency) => ({
      label: `${currency.code} (${currency.symbol})`,
      value: currency.code,
    }));
  }, []);

  const dateFormats = useMemo(() => {
    return DATEFORMATS.map((format: DateFormat) => ({
      label: format.label,
      value: format.code,
    }));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<SettingsFormData>({
    defaultValues: {
      currency: account?.currency || 'USD',
      dateFormat: account?.dateFormat || 'MM/DD/YYYY',
    },
    mode: 'onChange',
  });

  const { showConfirmPrompt } = usePrompt();
  const { showNotification, showErrorNotification } = useAppNotifications();

  const { mutateAsync: exportData, isPending: exportDataPending } = useExportDataFunction();
  const { mutateAsync: deleteAccount, isPending: deleteAccountPending } =
    useDeleteAccountFunction();

  const onCurrencyChange = async (currency: string) => {
    if (account) {
      try {
        await updateAccount({
          id: account.id ?? '',
          data: {
            ...account,
            currency,
          },
        });
        setValue('currency', currency, { shouldDirty: false });
        showNotification('Currency updated successfully');
      } catch (error) {
        showErrorNotification('Failed to update currency');
      }
    }
  };

  const onDateFormatChange = async (dateFormat: string) => {
    if (account) {
      try {
        await updateAccount({
          id: account.id ?? '',
          data: {
            ...account,
            dateFormat,
          },
        });
        setValue('dateFormat', dateFormat, { shouldDirty: false });
        showNotification('Date format updated successfully');
      } catch (error) {
        showErrorNotification('Failed to update date format');
      }
    }
  };

  const exportDataHandler = async () => {
    try {
      showConfirmPrompt({
        title: 'Export Data',
        message: 'Are you sure you want to export your data?',

        onConfirm: async () => {
          await exportData();
          showNotification(
            'Request to export data has been sent. You will receive an email once the export is complete.',
          );
        },
        onCancel: () => {},
      });
    } catch (error) {
      showErrorNotification(
        'Failed to send export data request.  Please try again later or contact your support team member.',
      );
    }
  };

  const deleteAccountHandler = async () => {
    try {
      await deleteAccount();
      showNotification(
        'Request to delete your account has been sent. You will receive an email once the export is complete.',
      );
      signout();
    } catch (error) {
      showErrorNotification(
        'Failed to delete your account request.  Please try again later or contact your support team member.',
      );
    }
  };

  useEffect(() => {
    if (account) {
      reset({
        currency: account.currency || 'USD',
        dateFormat: account.dateFormat || 'MM/DD/YYYY',
      });
    }
  }, [account, reset]);

  useEffect(() => {
    if (didMutationFail) {
      showErrorNotification('Failed to update settings');
    }
  }, [didMutationFail, showErrorNotification]);

  return (
    <BasePageLayout
      title='Settings'
      showBackButton={true}
      showProfileIcon={false}
      defaultBackButtonHref={ROUTES.SPENDING}
    >
      <CenterContainer>
        <StyledIonCard>
          <IonCardHeader>
            <IonCardTitle>Regional Settings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent className='ion-no-padding'>
            <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
              <IonItem lines='full'>
                <IonLabel>
                  <h2>Preferred Currency</h2>
                  <p>Currently: {account?.currency || 'USD'}</p>
                </IonLabel>
                <div slot='end' style={{ minWidth: '120px' }}>
                  <SelectFormField
                    name='currency'
                    label=''
                    placeholder='Select currency'
                    register={register}
                    setValue={setValue}
                    getValues={getValues}
                    error={errors.currency}
                    optionsList={currencies}
                    validationRules={{
                      required: 'Currency is required',
                    }}
                    onChange={(e) => onCurrencyChange(e.detail.value)}
                  />
                </div>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>Date Format</h2>
                  <p>Currently: {account?.dateFormat || 'MM/DD/YYYY'}</p>
                </IonLabel>
                <div slot='end' style={{ minWidth: '120px' }}>
                  <SelectFormField
                    name='dateFormat'
                    label=''
                    placeholder='Select date format'
                    register={register}
                    setValue={setValue}
                    getValues={getValues}
                    error={errors.dateFormat}
                    optionsList={dateFormats}
                    validationRules={{
                      required: 'Date format is required',
                    }}
                    onChange={(e) => onDateFormatChange(e.detail.value)}
                  />
                </div>
              </IonItem>
            </TransparentIonList>
          </IonCardContent>
        </StyledIonCard>

        <SubscriptionCard account={account || null} />

        <StyledIonCard>
          <IonCardHeader>
            <IonCardTitle>Account Settings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent className='ion-no-padding'>
            <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
              <IonItem>
                <IonLabel>
                  <h2>Export Data</h2>
                  <p>Download all your spending data and settings</p>
                  <div style={{ marginTop: designSystem.spacing.md }}>
                    <ActionButton
                      label={'Export'}
                      onClick={exportDataHandler}
                      isLoading={exportDataPending}
                      isDisabled={false}
                      expand='block'
                      size='large'
                    />
                  </div>
                </IonLabel>
              </IonItem>
            </TransparentIonList>
          </IonCardContent>
        </StyledIonCard>

        <DangerCard>
          <IonCardHeader>
            <IonCardTitle>Danger Zone</IonCardTitle>
          </IonCardHeader>
          <IonCardContent className='ion-no-padding'>
            <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
              <IonItem>
                <IonLabel>
                  <h2
                    style={{
                      color: designSystem.colors.danger,
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '600',
                    }}
                  >
                    Delete Account
                  </h2>
                  <p
                    style={{
                      color: designSystem.colors.textSecondary,
                      margin: '4px 0 0 0',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                    }}
                  >
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <div style={{ marginTop: designSystem.spacing.md }}>
                    <DestructiveButton
                      fill='solid'
                      expand='block'
                      label={'Delete'}
                      prompt={
                        'Are you sure you want to delete your Spendless account? This action cannot be undone and you will be automatically signed out of your account.'
                      }
                      onClick={deleteAccountHandler}
                      isLoading={deleteAccountPending}
                      size='large'
                    />
                  </div>
                </IonLabel>
              </IonItem>
            </TransparentIonList>
          </IonCardContent>
        </DangerCard>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default SettingsPage;
