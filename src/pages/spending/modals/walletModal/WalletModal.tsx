import { InputFormField } from '@/components/forms';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton, Gap } from '@/components/shared';
import { ProminentAmountInput } from '@/components/ui';
import { Currency } from '@/domain/Currencies';
import { validateSingleWalletSetup } from '@/domain/validation/walletValidation';
import { usePrompt } from '@/hooks';
import { TransparentIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import { IonCheckbox, IonItem, IonLabel, IonNote, useIonToast } from '@ionic/react';
import { useCallback, useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { WalletFormData, WalletModalProps } from './types';

const WalletModal: React.FC<WalletModalProps> = ({
  wallet,
  onSave,
  accountId,
  periodId,
  existingWallets = [],
  onDismiss,
}) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const { showConfirmPrompt } = usePrompt();
  const currency = Currency.USD; // TODO: Get from user preferences

  const isEditing = Boolean(wallet);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<WalletFormData>({
    defaultValues: {
      name: '',
      spendingLimit: '0',
      isDefault: false,
    },
    mode: 'onChange',
  });

  const watchedIsDefault = watch('isDefault');

  // Reset form when wallet prop changes
  useEffect(() => {
    if (wallet) {
      reset({
        name: wallet.name,
        spendingLimit: wallet.spendingLimit.toFixed(2),
        isDefault: wallet.isDefault,
      });
    } else {
      reset({
        name: '',
        spendingLimit: '0',
        isDefault: existingWallets.length === 0, // Auto-set as default if it's the first wallet
      });
    }
  }, [wallet, existingWallets.length, reset]);

  // Handle amount input change
  const handleAmountChange = useCallback(
    (value: number) => {
      setValue('spendingLimit', value.toFixed(2), { shouldDirty: true });
    },
    [setValue],
  );

  // Form submit handler
  const onSubmit: SubmitHandler<WalletFormData> = async (formData) => {
    const walletSetup = {
      name: formData.name.trim(),
      spendingLimit: Number.parseFloat(formData.spendingLimit),
      isDefault: formData.isDefault,
    };

    // Validate wallet setup
    const validationErrors = validateSingleWalletSetup(walletSetup);
    if (validationErrors.length > 0) {
      presentToast({
        message: validationErrors[0],
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      return;
    }

    // Check for duplicate names (excluding current wallet if editing)
    const existingWallet = existingWallets.find(
      (w) => w.name.toLowerCase().trim() === walletSetup.name.toLowerCase() && w.id !== wallet?.id,
    );
    if (existingWallet) {
      presentToast({
        message: 'A wallet with this name already exists',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      return;
    }

    try {
      onSave(walletSetup);
      onDismiss();
    } catch (error) {
      console.error('Wallet operation failed:', error);
      presentToast({
        message: isEditing ? 'Failed to update wallet' : 'Failed to create wallet',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
    }
  };

  // Handle modal dismiss
  const handleDismiss = () => {
    if (isDirty) {
      showConfirmPrompt({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        onConfirm: () => {
          onDismiss();
        },
        onCancel: () => {},
      });
    } else {
      onDismiss();
    }
  };

  return (
    <ModalPageLayout onDismiss={handleDismiss}>
      <CenterContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ProminentAmountInput
            label='Spending Limit'
            value={Number.parseFloat(getValues('spendingLimit') || '0')}
            onChange={handleAmountChange}
            currency={currency}
            autoFocus={true}
            error={errors.spendingLimit?.message}
          />

          <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
            <IonItem>
              <IonLabel>
                <InputFormField
                  label='Wallet Name'
                  name='name'
                  placeholder='e.g., Groceries, Entertainment'
                  register={register}
                  error={errors.name}
                  fill='outline'
                  validationRules={{
                    required: 'Wallet name is required',
                    minLength: {
                      value: 1,
                      message: 'Wallet name must be at least 1 character',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Wallet name must be no more than 50 characters',
                    },
                  }}
                />
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonCheckbox
                slot='start'
                {...register('isDefault')}
                checked={watchedIsDefault}
                onIonChange={(e) => setValue('isDefault', e.detail.checked, { shouldDirty: true })}
              />
              <IonLabel>
                <h3>Set as default wallet</h3>
                <IonNote>New spending will be assigned to this wallet by default</IonNote>
              </IonLabel>
            </IonItem>
          </TransparentIonList>

          <Gap size={designSystem.spacing.md} />

          {/* Form Actions */}
          <ActionButton
            expand='block'
            fill='solid'
            className='ion-margin-bottom ion-margin-start ion-margin-end'
            onClick={handleSubmit(onSubmit)}
            isLoading={false}
            isDisabled={false}
            label={isEditing ? 'Update Wallet' : 'Create Wallet'}
          />
        </form>
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default WalletModal;
