import { BasePageLayout, CenterContainer, Content } from '@/components/layouts';
import { ActionButton } from '@/components/shared';
import DestructiveButton from '@/components/shared/base/buttons/DestructiveButton';
import { CURRENCIES, type Currency } from '@/domain/Currencies';
import { type DateFormat, DATEFORMATS } from '@/domain/DateFormats';
import { useAppNotifications, usePrompt } from '@/hooks';
import { useExportDataFunction } from '@/hooks/functions';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { StyledIonList, StyledItem } from '@/styles/IonList.styled';
import { IonButton, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption } from '@ionic/react';
import { useEffect, useMemo } from 'react';

const SettingsPage: React.FC = () => {
  const { account, updateAccount, didMutationFail } = useSpendingAccount();
  const currencies = useMemo(() => {
    return CURRENCIES;
  }, []);
  const dateFormats = useMemo(() => {
    return DATEFORMATS;
  }, []);

  const { showConfirmPrompt } = usePrompt();
  const { showNotification, showErrorNotification } = useAppNotifications();

  const { mutateAsync: exportData, isPending } = useExportDataFunction();

  const currencyChangeHandler = (currency: string) => {
    if (account) {
      updateAccount({ id: account.id ?? '', data: { ...account, currency } });
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

  useEffect(() => {
    if (didMutationFail) {
      showErrorNotification('Failed to update settings settings');
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
        <div className='ion-margin'>Regional Settings</div>

        <StyledIonList>
          <IonItem lines='full'>
            <IonLabel>
              <h2>Preferred Currency</h2>
            </IonLabel>
            <IonSelect
              slot='end'
              value={account?.currency}
              interface={'popover'}
              onIonChange={(e) => currencyChangeHandler(e.detail.value)}
            >
              {currencies.map((currency: Currency) => (
                <IonSelectOption key={currency.code} value={currency.code}>
                  {currency.code}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem lines='full'>
            <IonLabel>
              <h2>Date Format</h2>
            </IonLabel>
            <IonSelect slot='end' value={account?.dateFormat} interface={'popover'}>
              {dateFormats.map((format: DateFormat) => (
                <IonSelectOption key={format.code} value={format.code}>
                  {format.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </StyledIonList>

        <div className='ion-margin'>Account Settings</div>
        <StyledIonList>
          <StyledItem lines='full'>
            <IonLabel>
              <h2>Export Data</h2>
            </IonLabel>
            <div slot='end'>
              <ActionButton
                label={'Export'}
                onClick={exportDataHandler}
                isLoading={isPending}
                isDisabled={false}
                style={{ width: '100px' }}
              />
            </div>
          </StyledItem>
        </StyledIonList>
        <Content>
          <DestructiveButton
            className='ion-padding-top ion-padding-bottom ion-margin-start ion-margin-end'
            fill='solid'
            label={'Delete Account'}
            prompt={'Are you sure you want to delete your account? This action cannot be undone.'}
            expand={'full'}
            onClick={() => {}}
          />
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default SettingsPage;
