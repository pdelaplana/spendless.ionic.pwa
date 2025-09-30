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
import { IonIcon, IonSpinner } from '@ionic/react';
import { add } from 'ionicons/icons';
import type React from 'react';
import { useWalletModal } from '../../../modals/walletModal';

interface WalletListProps {
  onWalletClick?: (walletId: string) => void;
  className?: string;
}

const WalletList: React.FC<WalletListProps> = ({ onWalletClick, className }) => {
  const { wallets, isLoading, error, refreshWallets } = useWallet();
  const { account, selectedPeriod } = useSpendingAccount();
  const { formatCurrency } = useFormatters();
  const { open: openWalletModal } = useWalletModal();
  const { showNotification, showErrorNotification } = useAppNotifications();

  // Create a currency-aware format function
  const formatAccountCurrency = (amount: number) => formatCurrency(amount, account?.currency);

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
          <p style={{ marginTop: '12px', textAlign: 'center' }}>Loading</p>
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
          {wallets.map((wallet) => (
            <WalletListItem
              key={wallet.id}
              wallet={wallet}
              onClick={onWalletClick}
              formatCurrency={formatAccountCurrency}
            />
          ))}
        </StyledIonList>
      </WalletListContent>
    </WalletListContainer>
  );
};

export default WalletList;
