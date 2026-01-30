import type { ISpend } from '@/domain/Spend';
import type { IWallet } from '@/domain/Wallet';
import { useCreateWallet, useDeleteWallet, useUpdateWallet } from '@/hooks/api/wallet';
import { useAppNotifications } from '@/hooks/ui/useAppNotifications';
import useFormatters from '@/hooks/ui/useFormatters';
import {
  EmptyContainer,
  EmptyMessage,
  ErrorContainer,
  ErrorMessage,
  LoadingContainer,
  LoadingText,
  RetryButton,
  WalletListContainer,
  WalletListContent,
  WalletListHeader,
  WalletListHeaderContainer,
  WalletListSettingsButton,
} from '@/pages/spending/components/common/walletList/WalletList.styled';
import WalletListItem from '@/pages/spending/components/common/walletList/WalletListItem';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { StyledIonList } from '@/styles/IonList.styled';
import { getCurrentWeek, getPreviousWeek, isDateInWeek } from '@/utils/weekUtils';
import { IonIcon, IonSpinner, IonToggle } from '@ionic/react';
import { add } from 'ionicons/icons';
import type React from 'react';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useWalletModal } from '../../../modals/walletModal';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--ion-color-medium);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

interface WalletListProps {
  onWalletClick?: (walletId: string) => void;
  spending?: ISpend[];
  className?: string;
}

const WalletList: React.FC<WalletListProps> = ({ onWalletClick, spending = [], className }) => {
  const { wallets, isLoading, error, refreshWallets } = useWallet();
  const { account, selectedPeriod } = useSpendingAccount();
  const { formatCurrency } = useFormatters();
  const { open: openWalletModal } = useWalletModal();
  const { showNotification, showErrorNotification } = useAppNotifications();
  const [showWeeklySpending, setShowWeeklySpending] = useState(false);

  // Create a currency-aware format function
  const formatAccountCurrency = (amount: number) => formatCurrency(amount, account?.currency);

  // Calculate weekly spending for each wallet
  const weeklySpendingData = useMemo(() => {
    const currentWeek = getCurrentWeek();
    const previousWeek = getPreviousWeek();

    return wallets.map((wallet) => {
      const walletSpending = spending.filter((spend) => spend.walletId === wallet.id);

      const currentWeekAmount = walletSpending
        .filter((spend) => isDateInWeek(spend.date, currentWeek.start, currentWeek.end))
        .reduce((sum, spend) => sum + spend.amount, 0);

      const previousWeekAmount = walletSpending
        .filter((spend) => isDateInWeek(spend.date, previousWeek.start, previousWeek.end))
        .reduce((sum, spend) => sum + spend.amount, 0);

      return {
        walletId: wallet.id,
        currentWeekAmount,
        previousWeekAmount,
      };
    });
  }, [wallets, spending]);

  // API hooks for wallet operations
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();

  const handleRetry = async () => {
    await refreshWallets();
  };

  const handleCreateWallet = async (walletData: {
    name: string;
    spendingLimit: number;
    isDefault: boolean;
  }) => {
    if (!account?.id || !selectedPeriod?.id) return;

    try {
      await createWallet.mutateAsync({
        accountId: account.id,
        periodId: selectedPeriod.id,
        data: {
          accountId: account.id,
          periodId: selectedPeriod.id,
          ...walletData,
        },
      });
      showNotification('Wallet created successfully');
    } catch (error) {
      console.error('Failed to create wallet:', error);
      showErrorNotification('Failed to create wallet');
    }
  };

  const handleUpdateWallet = async (
    wallet: IWallet,
    walletData: { name: string; spendingLimit: number; isDefault: boolean },
  ) => {
    if (!account?.id || !selectedPeriod?.id) return;

    try {
      await updateWallet.mutateAsync({
        accountId: account.id,
        periodId: selectedPeriod.id,
        walletId: wallet.id || '',
        updates: walletData,
      });
      showNotification('Wallet updated successfully');
    } catch (error) {
      console.error('Failed to update wallet:', error);
      showErrorNotification('Failed to update wallet');
    }
  };

  const handleAddWalletClick = () => {
    if (account?.id && selectedPeriod?.id) {
      openWalletModal(
        null, // null for create mode
        handleCreateWallet,
        account.id,
        selectedPeriod.id,
        wallets,
        account.currency, // Pass account currency
      );
    }
  };

  if (isLoading) {
    return (
      <WalletListContainer className={className}>
        <LoadingContainer>
          <IonSpinner name='crescent' />
          <LoadingText>Loading</LoadingText>
        </LoadingContainer>
      </WalletListContainer>
    );
  }

  if (error) {
    return (
      <WalletListContainer className={className}>
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={handleRetry} aria-label='Retry loading wallets' type='button'>
            Retry
          </RetryButton>
        </ErrorContainer>
      </WalletListContainer>
    );
  }

  if (wallets.length === 0) {
    return (
      <WalletListContainer className={className}>
        <WalletListHeaderContainer>
          <WalletListHeader>Wallets</WalletListHeader>
          <WalletListSettingsButton
            onClick={handleAddWalletClick}
            aria-label='Add new wallet'
            type='button'
          >
            <IonIcon icon={add} color='primary' />
          </WalletListSettingsButton>
        </WalletListHeaderContainer>
        <WalletListContent>
          <EmptyContainer>
            <EmptyMessage>No wallets found for this period</EmptyMessage>
          </EmptyContainer>
        </WalletListContent>
      </WalletListContainer>
    );
  }

  return (
    <WalletListContainer className={className}>
      <WalletListHeaderContainer>
        <WalletListHeader>Wallets</WalletListHeader>
        <WalletListSettingsButton
          onClick={handleAddWalletClick}
          aria-label='Add new wallet'
          type='button'
        >
          <IonIcon icon={add} color='primary' />
        </WalletListSettingsButton>
      </WalletListHeaderContainer>
      <WalletListContent>
        <StyledIonList lines='full' style={{ backgroundColor: 'transparent' }}>
          {wallets.map((wallet) => {
            const weeklyData = weeklySpendingData.find((w) => w.walletId === wallet.id);
            return (
              <WalletListItem
                key={wallet.id}
                wallet={wallet}
                onClick={onWalletClick}
                formatCurrency={formatAccountCurrency}
                showWeeklySpending={showWeeklySpending}
                currentWeekAmount={weeklyData?.currentWeekAmount ?? 0}
                previousWeekAmount={weeklyData?.previousWeekAmount ?? 0}
              />
            );
          })}
        </StyledIonList>
      </WalletListContent>
      <ToggleContainer>
        <span>Show Weekly Spending</span>
        <IonToggle
          checked={showWeeklySpending}
          onIonChange={(e) => setShowWeeklySpending(e.detail.checked)}
          aria-label='Toggle weekly spending view'
        />
      </ToggleContainer>
    </WalletListContainer>
  );
};

export default WalletList;
