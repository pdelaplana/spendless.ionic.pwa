import { InputFormField } from '@/components/forms';
import { Gap } from '@/components/shared';
import { useCreateWallet } from '@/hooks/api';
import { useAppNotifications } from '@/hooks/ui';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, IonItem, IonLabel, IonList } from '@ionic/react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../components/OnboardingStep';

const GuideContainer = styled.div`
  max-width: 450px;
  margin: 0 auto;
`;

const ExplanationCard = styled(IonCard)`
  background: ${designSystem.colors.primary[50]};
  margin-bottom: ${designSystem.spacing.lg};
`;

const WalletTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.lg};
`;

const WalletTypeCard = styled.button<{ $isSelected: boolean }>`
  background: ${(props) => (props.$isSelected ? designSystem.colors.primary[100] : 'white')};
  border: 2px solid ${(props) => (props.$isSelected ? designSystem.colors.primary[500] : designSystem.colors.gray[300])};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.sm};

  &:hover {
    border-color: ${designSystem.colors.primary[400]};
    transform: translateY(-1px);
  }
`;

const WalletIcon = styled.div`
  font-size: ${designSystem.typography.fontSize['2xl']};
  margin-bottom: ${designSystem.spacing.xs};
`;

const WalletTypeName = styled.div`
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  font-size: ${designSystem.typography.fontSize.sm};
`;

const WalletTypeDescription = styled.div`
  font-size: ${designSystem.typography.fontSize.xs};
  color: ${designSystem.colors.text.secondary};
  text-align: center;
`;

const FormSection = styled.div`
  margin-top: ${designSystem.spacing.lg};
`;

const SectionLabel = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

interface WalletForm {
  name: string;
  spendingLimit: string;
}

interface WalletSetupStepProps
  extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  periodId?: string;
  onComplete: (walletId: string) => void;
}

interface WalletType {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultName: string;
  suggestedLimit: string;
}

const walletTypes: WalletType[] = [
  {
    id: 'checking',
    name: 'Checking Account',
    icon: '🏦',
    description: 'Daily spending from your main account',
    defaultName: 'Main Checking',
    suggestedLimit: '500',
  },
  {
    id: 'cash',
    name: 'Cash',
    icon: '💵',
    description: 'Physical cash spending',
    defaultName: 'Cash Wallet',
    suggestedLimit: '100',
  },
  {
    id: 'credit',
    name: 'Credit Card',
    icon: '💳',
    description: 'Credit card purchases',
    defaultName: 'Credit Card',
    suggestedLimit: '300',
  },
  {
    id: 'savings',
    name: 'Savings',
    icon: '💰',
    description: 'Occasional spending from savings',
    defaultName: 'Savings Account',
    suggestedLimit: '200',
  },
];

const WalletSetupStep: React.FC<WalletSetupStepProps> = ({
  periodId,
  onComplete,
  ...stepProps
}) => {
  const { account } = useSpendingAccount();
  const createWallet = useCreateWallet();
  const { showErrorNotification, showNotification } = useAppNotifications();
  const [selectedWalletType, setSelectedWalletType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WalletForm>({
    mode: 'onChange',
  });

  const watchedName = watch('name');
  const watchedLimit = watch('spendingLimit');

  const handleWalletTypeSelect = (walletType: WalletType) => {
    setSelectedWalletType(walletType.id);
    setValue('name', walletType.defaultName);
    setValue('spendingLimit', walletType.suggestedLimit);
  };

  const onSubmit = async (data: WalletForm) => {
    if (!account?.id || !periodId) {
      showErrorNotification('Account or period not found. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const wallet = await createWallet.mutateAsync({
        accountId: account.id,
        periodId: periodId,
        data: {
          accountId: account.id,
          periodId: periodId,
          name: data.name,
          spendingLimit: Number(data.spendingLimit),
          isDefault: true, // First wallet is always default
        },
      });

      showNotification(`${data.name} wallet created successfully!`);
      onComplete(wallet.id);
      stepProps.onNext?.();
    } catch (error) {
      console.error('Failed to create wallet:', error);
      showErrorNotification('Failed to create wallet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = Boolean(
    watchedName && watchedName.length >= 2 && watchedLimit && Number(watchedLimit) > 0,
  );

  return (
    <OnboardingStep
      {...stepProps}
      title='Set Up Your First Wallet'
      subtitle='Wallets help you track spending from different sources like bank accounts or cash'
      canGoNext={canProceed && !isSubmitting}
      isLoading={isSubmitting}
      nextButtonLabel='Create Wallet'
      onNext={handleSubmit(onSubmit)}
    >
      <GuideContainer>
        <ExplanationCard>
          <IonCardContent>
            <p
              style={{
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.text.secondary,
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Think of wallets as digital versions of your real wallets and cards. Start with one -
              you can add more later!
            </p>
          </IonCardContent>
        </ExplanationCard>

        <SectionLabel>Choose Your Wallet Type</SectionLabel>

        <WalletTypesGrid>
          {walletTypes.map((walletType) => (
            <WalletTypeCard
              key={walletType.id}
              type='button'
              $isSelected={selectedWalletType === walletType.id}
              onClick={() => handleWalletTypeSelect(walletType)}
            >
              <WalletIcon>{walletType.icon}</WalletIcon>
              <WalletTypeName>{walletType.name}</WalletTypeName>
              <WalletTypeDescription>{walletType.description}</WalletTypeDescription>
            </WalletTypeCard>
          ))}
        </WalletTypesGrid>

        <FormSection>
          <IonList lines='none'>
            <IonItem>
              <IonLabel>
                <InputFormField
                  name='name'
                  label='Wallet Name'
                  type='text'
                  placeholder='e.g., Main Checking, Cash Wallet'
                  register={register}
                  error={errors.name}
                  fill='outline'
                  validationRules={{
                    required: 'Wallet name is required',
                    minLength: {
                      value: 2,
                      message: 'Wallet name must be at least 2 characters',
                    },
                  }}
                />
              </IonLabel>
            </IonItem>

            <Gap size='md' />

            <IonItem>
              <IonLabel>
                <InputFormField
                  name='spendingLimit'
                  label='Spending Limit for This Period'
                  type='number'
                  placeholder='How much do you want to spend from this wallet?'
                  register={register}
                  error={errors.spendingLimit}
                  fill='outline'
                  validationRules={{
                    required: 'Spending limit is required',
                    min: {
                      value: 1,
                      message: 'Spending limit must be greater than 0',
                    },
                    max: {
                      value: 100000,
                      message: 'Spending limit seems too high',
                    },
                  }}
                />
              </IonLabel>
            </IonItem>
          </IonList>

          {watchedLimit && Number(watchedLimit) > 0 && (
            <div
              style={{
                textAlign: 'center',
                marginTop: designSystem.spacing.md,
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.text.secondary,
              }}
            >
              💡 You can adjust this limit anytime and add more wallets later
            </div>
          )}
        </FormSection>
      </GuideContainer>
    </OnboardingStep>
  );
};

export default WalletSetupStep;
