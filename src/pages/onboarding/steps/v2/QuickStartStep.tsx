import { SpendlessLogo } from '@/components/brand';
import { InputFormField, TextAreaFormField } from '@/components/forms';
import { Gap } from '@/components/shared';
import { useCreatePeriod, useCreateWallet } from '@/hooks/api';
import { useAppNotifications } from '@/hooks/ui';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, IonItem, IonLabel, IonList } from '@ionic/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../../components/OnboardingStep';

const CenterContainer = styled.div`
  max-width: 450px;
  margin: 0 auto;
  text-align: center;
`;

const LogoContainer = styled.div`
  margin-bottom: ${designSystem.spacing.lg};
`;

const WelcomeMessage = styled.div`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${designSystem.spacing.xs};
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const HighlightCard = styled(IonCard)`
  background: ${designSystem.colors.primary[50]};
  border: 1px solid ${designSystem.colors.primary[200]};
  margin-left: 0;
  margin-right:0;
`;

const HighlightText = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.primary[700]};
  text-align: center;
  margin: 0;
  line-height: 1.5;
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

const FormSection = styled.div`
  text-align: left;
  margin-top: ${designSystem.spacing.lg};
  background: ${designSystem.colors.surface};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.xs};
`;

const SectionLabel = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

const SmartDefaultsNote = styled.div`
  background: ${designSystem.colors.gray[50]};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  margin: ${designSystem.spacing.md};
  text-align: center;
`;

const SmartDefaultsText = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

interface QuickStartForm {
  goals: string;
  walletName: string;
  spendingLimit: string;
}

interface QuickStartStepProps extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  onComplete: (periodId: string, walletId: string) => void;
}

const QuickStartStep: React.FC<QuickStartStepProps> = ({ onComplete, ...stepProps }) => {
  const { account } = useSpendingAccount();
  const createPeriod = useCreatePeriod();
  const createWallet = useCreateWallet();
  const { showErrorNotification, showNotification } = useAppNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuickStartForm>({
    mode: 'onChange',
    defaultValues: {
      goals: 'Practice mindful spending awareness and reduce impulse purchases',
      walletName: 'Main Wallet',
      spendingLimit: '500',
    },
  });

  const watchedGoals = watch('goals');
  const watchedWalletName = watch('walletName');
  const watchedSpendingLimit = watch('spendingLimit');

  // Set default dates
  useEffect(() => {
    // Pre-populate with smart defaults based on best practices
    setValue('goals', 'Practice mindful spending awareness and reduce impulse purchases');
    setValue('walletName', 'Main Wallet');
    setValue('spendingLimit', '500');
  }, [setValue]);

  const onSubmit = async (data: QuickStartForm) => {
    if (!account?.id) {
      showErrorNotification('Account not found. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create period with smart defaults (7-day period starting today)
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);

      const period = await createPeriod.mutateAsync({
        accountId: account.id,
        data: {
          name: `${today.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
          goals: data.goals,
          targetSpend: Number(data.spendingLimit),
          targetSavings: 0,
          startAt: today,
          endAt: endDate,
          reflection: '',
          walletSetup: [],
        },
      });

      // Create wallet immediately after period
      const wallet = await createWallet.mutateAsync({
        accountId: account.id,
        periodId: period.id,
        data: {
          accountId: account.id,
          periodId: period.id,
          name: data.walletName,
          spendingLimit: Number(data.spendingLimit),
          isDefault: true,
        },
      });

      showNotification("Quick setup complete! Let's try your first mindful spend.");
      onComplete(period.id, wallet.id);
      stepProps.onNext?.();
    } catch (error) {
      console.error('Failed to create period/wallet:', error);
      showErrorNotification('Setup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = Boolean(
    watchedGoals &&
      watchedGoals.length >= 10 &&
      watchedWalletName &&
      watchedWalletName.length >= 2 &&
      watchedSpendingLimit &&
      Number(watchedSpendingLimit) > 0,
  );

  return (
    <OnboardingStep
      {...stepProps}
      title='Welcome'
      subtitle='Your mindful spending journey starts with a simple setup'
      canGoNext={canProceed && !isSubmitting}
      isLoading={isSubmitting}
      nextButtonLabel='Start Journey'
      onNext={handleSubmit(onSubmit)}
    >
      <CenterContainer>
        <LogoContainer>
          <SpendlessLogo variant='primary' size='large' />
        </LogoContainer>

        <WelcomeMessage>
          Track emotions and thoughts around spending to build awareness, not restriction.
        </WelcomeMessage>

        <HighlightCard>
          <IonCardContent>
            <HighlightText>
              🧘 Mindful • 📊 Simple • 💡 Insightful
              <br />
              We'll set you up with smart defaults to get you started quickly
            </HighlightText>
          </IonCardContent>
        </HighlightCard>

        <FormSection>
          <SectionLabel>Quick Setup</SectionLabel>

          <IonList lines='none'>
            <IonItem>
              <IonLabel>
                <TextAreaFormField
                  name='goals'
                  label='What do you want to achieve? (Optional - we have a suggestion)'
                  placeholder='Practice mindful spending awareness and reduce impulse purchases'
                  register={register}
                  setValue={setValue}
                  error={errors.goals}
                  fill='outline'
                  counter={true}
                  maxlength={200}
                  validationRules={{
                    required: 'Goals are helpful for tracking progress',
                    minLength: {
                      value: 10,
                      message: 'Please add a bit more detail',
                    },
                  }}
                />
              </IonLabel>
            </IonItem>

            <Gap size='md' />

            <IonItem>
              <IonLabel>
                <InputFormField
                  name='walletName'
                  label='What should we call your first wallet?'
                  type='text'
                  placeholder='Main Wallet'
                  register={register}
                  error={errors.walletName}
                  fill='outline'
                  validationRules={{
                    required: 'Wallet name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  }}
                />
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <InputFormField
                  name='spendingLimit'
                  label='Spending limit for your first week'
                  type='number'
                  placeholder='500'
                  register={register}
                  error={errors.spendingLimit}
                  fill='outline'
                  validationRules={{
                    required: 'Spending limit helps with awareness',
                    min: {
                      value: 1,
                      message: 'Please enter an amount greater than 0',
                    },
                    max: {
                      value: 10000,
                      message: 'That seems like a lot for one week',
                    },
                  }}
                />
              </IonLabel>
            </IonItem>
          </IonList>

          <SmartDefaultsNote>
            <SmartDefaultsText>
              💡 We'll create a 7-day mindful spending period starting today. You can adjust
              everything later!
            </SmartDefaultsText>
          </SmartDefaultsNote>
        </FormSection>
      </CenterContainer>
    </OnboardingStep>
  );
};

export default QuickStartStep;
