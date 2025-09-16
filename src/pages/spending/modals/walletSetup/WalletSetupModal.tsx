import { InputFormField } from '@/components/forms';
import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { ActionButton, Gap } from '@/components/shared';
import DestructiveButton from '@/components/shared/base/buttons/DestructiveButton';
import { ProminentAmountInput } from '@/components/ui';
import { Currency } from '@/domain/Currencies';
import type { IWallet } from '@/domain/Wallet';
import { validateSingleWalletSetup } from '@/domain/validation/walletValidation';
import { usePrompt } from '@/hooks';
import { useCreateWallet, useDeleteWallet, useUpdateWallet } from '@/hooks/api/wallet';
import { StyledIonList, TransparentIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { walletOutline } from 'ionicons/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import WalletListItem from './WalletListItem';

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 20vh;
  justify-content: flex-start;
`;

const EmptyStateIcon = styled(IonIcon)`
  font-size: 4rem;
  color: var(--ion-color-medium);
  margin-bottom: 1.5rem;
`;

const EmptyStateHeading = styled.h2`
  color: var(--ion-color-medium);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const EmptyStateDescription = styled.p`
  color: var(--ion-color-medium-shade);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  max-width: 320px;
`;

const EmptyStateExamples = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--ion-color-step-50);
  border-radius: 8px;
  max-width: 320px;
  width: 100%;
`;

const ExampleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ExampleItem = styled.div`
  color: var(--ion-color-medium-shade);
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 0.25rem 0;
`;

const ExampleLabel = styled(IonNote)`
  font-size: 0.85rem;
  font-weight: 600;
`;

const EmptyStateButton = styled(ActionButton)`
  width: 100%;
  max-width: 280px;
`;

interface WalletSetupModalProps {
  wallets: IWallet[];
  accountId: string;
  periodId: string;
  editWallet?: IWallet;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

interface WalletFormData {
  name: string;
  spendingLimit: string;
  isDefault: boolean;
}

const WalletSetupModal: React.FC<WalletSetupModalProps> = ({
  onDismiss,
  wallets = [],
  accountId,
  periodId,
  editWallet,
}) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const { showConfirmPrompt } = usePrompt();
  const currency = Currency.USD; // TODO: Get from user preferences

  // State for form mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingWallet, setEditingWallet] = useState<IWallet | undefined>(undefined);

  // API hooks - only for mutations, not fetching
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();

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

  // Reset form when modal opens/closes or edit wallet changes
  useEffect(() => {
    if (editingWallet) {
      reset({
        name: editingWallet.name,
        spendingLimit: editingWallet.spendingLimit.toFixed(2),
        isDefault: editingWallet.isDefault,
      });
      setIsEditing(true);
    } else {
      reset({
        name: '',
        spendingLimit: '0',
        isDefault: wallets.length === 0, // Auto-set as default if it's the first wallet
      });
      setIsEditing(false);
    }
  }, [editingWallet, wallets.length, reset]);

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
    const existingWallet = wallets.find(
      (w) =>
        w.name.toLowerCase().trim() === walletSetup.name.toLowerCase() &&
        w.id !== editingWallet?.id,
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
      if (editingWallet) {
        // Update existing wallet
        await updateWallet.mutateAsync({
          accountId,
          periodId,
          walletId: editingWallet.id || '',
          updates: walletSetup,
        });
        presentToast({
          message: 'Wallet updated successfully',
          duration: 2000,
          color: 'success',
          position: 'top',
        });
      } else {
        // Create new wallet
        await createWallet.mutateAsync({
          accountId,
          periodId,
          data: {
            accountId,
            periodId,
            ...walletSetup,
          },
        });
        presentToast({
          message: 'Wallet created successfully',
          duration: 2000,
          color: 'success',
          position: 'top',
        });
      }

      // Return to wallet list view
      handleBackToList();
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

  // Handle edit wallet
  const handleEditWallet = (wallet: IWallet) => {
    setEditingWallet(wallet);
    setIsEditing(true);
  };

  // Handle back to wallet list
  const handleBackToList = () => {
    setEditingWallet(undefined);
    setIsEditing(false);
    reset();
  };

  // Handle delete wallet
  const handleDeleteWallet = async (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return;

    if (wallet.isDefault && wallets.length > 1) {
      presentToast({
        message: 'Cannot delete the default wallet. Make another wallet default first.',
        duration: 3000,
        color: 'warning',
        position: 'top',
      });
      return;
    }

    showConfirmPrompt({
      title: 'Delete Wallet',
      message: `Are you sure you want to delete "${wallet.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteWallet.mutateAsync({
            accountId,
            periodId,
            walletId,
          });
          presentToast({
            message: 'Wallet deleted successfully',
            duration: 2000,
            color: 'success',
            position: 'top',
          });
        } catch (error) {
          presentToast({
            message: 'Failed to delete wallet',
            duration: 3000,
            color: 'danger',
            position: 'top',
          });
        }
      },
      onCancel: () => {},
    });
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
        <IonTitle size='large' className='ion-text-center' style={{ marginBottom: '1rem' }}>
          {isEditing ? (editingWallet ? 'Edit Wallet' : 'Create Wallet') : 'Manage Wallets'}
        </IonTitle>

        {isEditing ? (
          // Edit/Create Form
          <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '0' }}>
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
                  onIonChange={(e) =>
                    setValue('isDefault', e.detail.checked, { shouldDirty: true })
                  }
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
              isLoading={createWallet.isPending || updateWallet.isPending}
              isDisabled={false}
              label={editingWallet ? 'Update Wallet' : 'Create Wallet'}
            />

            {/* Back Button */}
            <IonButton
              expand='block'
              fill='outline'
              className='ion-margin-bottom ion-margin-start ion-margin-end'
              onClick={handleBackToList}
              disabled={createWallet.isPending || updateWallet.isPending}
            >
              Back to Wallet List
            </IonButton>
          </form>
        ) : (
          // Wallet List
          <>
            {wallets.length === 0 ? (
              // Empty state for first-time users
              <EmptyStateContainer>
                <EmptyStateIcon icon={walletOutline} />
                <EmptyStateHeading>Welcome to Wallet Management</EmptyStateHeading>
                <EmptyStateDescription>
                  Wallets help you organize your spending by category like groceries, entertainment,
                  or bills. Set spending limits for each wallet to stay on budget.
                </EmptyStateDescription>

                <EmptyStateExamples>
                  <ExampleLabel>Popular wallet examples:</ExampleLabel>
                  <ExampleContainer>
                    <ExampleItem>Groceries - $400/month</ExampleItem>
                    <ExampleItem>Entertainment - $150/month</ExampleItem>
                    <ExampleItem>Transportation - $200/month</ExampleItem>
                  </ExampleContainer>
                </EmptyStateExamples>

                <EmptyStateButton
                  expand='block'
                  fill='solid'
                  onClick={() => setIsEditing(true)}
                  isLoading={false}
                  isDisabled={false}
                  label='Create Your First Wallet'
                />
              </EmptyStateContainer>
            ) : (
              // Existing wallets view
              <>
                <StyledIonList
                  style={{
                    background: 'var(--ion-color-light)',
                    borderRadius: designSystem.borderRadius.md,
                    margin: `0 0 ${designSystem.spacing.md} 0`,
                    overflow: 'hidden',
                  }}
                >
                  {wallets.map((wallet) => (
                    <WalletListItem
                      key={wallet.id}
                      wallet={wallet}
                      onEdit={handleEditWallet}
                      onDelete={handleDeleteWallet}
                      canDelete={!wallet.isDefault || wallets.length === 1}
                    />
                  ))}
                </StyledIonList>

                {/* Add New Wallet Button */}
                <ActionButton
                  expand='block'
                  fill='solid'
                  className='ion-margin-bottom ion-margin-start ion-margin-end'
                  onClick={() => setIsEditing(true)}
                  isLoading={false}
                  isDisabled={false}
                  label='Add New Wallet'
                />
              </>
            )}
          </>
        )}
      </CenterContainer>
    </ModalPageLayout>
  );
};

export const useWalletSetupModal = (): {
  open: (
    wallets: IWallet[],
    accountId: string,
    periodId: string,
    editWallet?: IWallet,
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    wallets: IWallet[];
    accountId: string;
    periodId: string;
    editWallet?: IWallet;
  }>();

  const [present, dismiss] = useIonModal(WalletSetupModal, {
    wallets: inputs?.wallets || [],
    accountId: inputs?.accountId || '',
    periodId: inputs?.periodId || '',
    editWallet: inputs?.editWallet,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (wallets: IWallet[], accountId: string, periodId: string, editWallet?: IWallet) => {
      setInputs({
        wallets,
        accountId,
        periodId,
        editWallet,
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

export default WalletSetupModal;
