import { InputFormField } from '@/components/forms';
import { ActionButton } from '@/components/shared';
import CurrencyAmountInput from '@/components/ui/CurrencyAmountInput';
import { Currency } from '@/domain/Currencies';
import { TransparentIonList } from '@/styles/IonList.styled';
import { SectionLabel } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonItem, IonLabel, IonNote, useIonToast } from '@ionic/react';
import { addOutline, trashOutline, walletOutline } from 'ionicons/icons';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { PeriodFormData } from '../hooks/useMultiStepForm';

const WalletSection = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  padding-left: 16px;
  padding-right: 16px;
`;

const ProminentWalletSection = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  padding-left: 16px;
  padding-right: 16px;
`;

const WalletSectionLabel = styled.h2`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

const WalletList = styled.div`
  margin-bottom: ${designSystem.spacing.lg};
`;

const WalletItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${designSystem.spacing.md};
  background: ${designSystem.colors.surface};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.lg};
  margin-bottom: ${designSystem.spacing.sm};
`;

const WalletInfo = styled.div`
  flex: 1;
`;

const WalletName = styled.div`
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const WalletAmount = styled.div`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.primary[600]};
  font-weight: ${designSystem.typography.fontWeight.semibold};
`;

const WalletBadge = styled.span`
  background: ${designSystem.colors.primary[100]};
  color: ${designSystem.colors.primary[700]};
  padding: ${designSystem.spacing.xs} ${designSystem.spacing.sm};
  border-radius: ${designSystem.borderRadius.full};
  font-size: ${designSystem.typography.fontSize.xs};
  font-weight: ${designSystem.typography.fontWeight.medium};
  margin-left: ${designSystem.spacing.sm};
`;

const DeleteButton = styled(IonButton)`
  --color: ${designSystem.colors.danger};
  --color-hover: ${designSystem.colors.danger};
`;

const AddWalletForm = styled.div`
  background: ${designSystem.colors.gray[50]};
  border: 2px dashed ${designSystem.colors.gray[300]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  margin-bottom: ${designSystem.spacing.lg};
`;

const TotalBudgetDisplay = styled.div`
  background: ${designSystem.colors.primary[50]};
  border: 1px solid ${designSystem.colors.primary[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  text-align: center;
`;

const TotalLabel = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const TotalAmount = styled.div`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.primary[600]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl};
  color: ${designSystem.colors.text.secondary};
`;

const EmptyIcon = styled(IonIcon)`
  font-size: 4rem;
  color: ${designSystem.colors.gray[400]};
  margin-bottom: ${designSystem.spacing.md};
`;

interface WalletFormData {
  name: string;
  spendingLimit: string;
}

interface StepWalletsProps {
  formData: PeriodFormData;
  totalBudget: number;
  onAddWallet: (wallet: { name: string; spendingLimit: string }) => void;
  onRemoveWallet: (walletId: string) => void;
  onSetDefaultWallet: (walletId: string) => void;
}

const StepWallets: React.FC<StepWalletsProps> = ({
  formData,
  totalBudget,
  onAddWallet,
  onRemoveWallet,
  onSetDefaultWallet,
}) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const currency = Currency.USD; // TODO: Get from user preferences

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<WalletFormData>({
    defaultValues: {
      name: '',
      spendingLimit: '0',
    },
  });

  const handleAmountChange = (value: number) => {
    setValue('spendingLimit', value.toFixed(2));
  };

  const onSubmit = (data: WalletFormData) => {
    if (!data.name.trim()) {
      presentToast({
        message: 'Wallet name is required',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      return;
    }

    if (Number.parseFloat(data.spendingLimit) <= 0) {
      presentToast({
        message: 'Spending limit must be greater than zero',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      return;
    }

    // Check for duplicate names
    const existingWallet = formData.wallets.find(
      (w) => w.name.toLowerCase().trim() === data.name.toLowerCase().trim(),
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

    onAddWallet(data);
    reset();
    setShowAddForm(false);
  };

  const handleDelete = (walletId: string) => {
    const wallet = formData.wallets.find((w) => w.id === walletId);
    if (wallet?.isDefault && formData.wallets.length > 1) {
      presentToast({
        message: 'Cannot delete the default wallet. Make another wallet default first.',
        duration: 3000,
        color: 'warning',
        position: 'top',
      });
      return;
    }
    onRemoveWallet(walletId);
  };

  return (
    <>
      {/* Prominent Wallet Section */}
      <ProminentWalletSection>
        <WalletSectionLabel>Setup Your Wallets</WalletSectionLabel>

        {formData.wallets.length === 0 && !showAddForm ? (
          <EmptyState>
            <EmptyIcon icon={walletOutline} />
            <h3>No wallets yet</h3>
            <p>Add your first wallet to get started with budgeting</p>
          </EmptyState>
        ) : formData.wallets.length > 0 ? (
          <WalletList>
            {formData.wallets.map((wallet) => (
              <WalletItem key={wallet.id}>
                <WalletInfo>
                  <WalletName>
                    {wallet.name}
                    {wallet.isDefault && <WalletBadge>Default</WalletBadge>}
                  </WalletName>
                  <WalletAmount>
                    {currency.format(Number.parseFloat(wallet.spendingLimit))}
                  </WalletAmount>
                </WalletInfo>
                <DeleteButton fill='clear' size='small' onClick={() => handleDelete(wallet.id)}>
                  <IonIcon icon={trashOutline} />
                </DeleteButton>
              </WalletItem>
            ))}
          </WalletList>
        ) : null}
      </ProminentWalletSection>

      {/* Add Wallet Form Section */}
      <WalletSection>
        {showAddForm ? (
          <AddWalletForm>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CurrencyAmountInput
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
              </TransparentIonList>

              <div
                style={{
                  display: 'flex',
                  gap: designSystem.spacing.sm,
                  marginTop: designSystem.spacing.md,
                }}
              >
                <ActionButton
                  expand='block'
                  fill='solid'
                  onClick={handleSubmit(onSubmit)}
                  isLoading={false}
                  isDisabled={false}
                  label='Add Wallet'
                />
                <IonButton
                  expand='block'
                  fill='outline'
                  onClick={() => {
                    setShowAddForm(false);
                    reset();
                  }}
                >
                  Cancel
                </IonButton>
              </div>
            </form>
          </AddWalletForm>
        ) : (
          <ActionButton
            expand='block'
            fill='outline'
            onClick={() => setShowAddForm(true)}
            isLoading={false}
            isDisabled={false}
            label='Add Wallet'
          >
            <IonIcon icon={addOutline} slot='start' />
          </ActionButton>
        )}

        {/* Total Budget Display */}
        {formData.wallets.length > 0 && (
          <TotalBudgetDisplay>
            <TotalLabel>Total Period Budget</TotalLabel>
            <TotalAmount>{currency.format(totalBudget)}</TotalAmount>
            <IonNote>This will be your total spending limit for the period</IonNote>
          </TotalBudgetDisplay>
        )}
      </WalletSection>
    </>
  );
};

export default StepWallets;
