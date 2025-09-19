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
import {
  chevronDown,
  ellipse,
  ellipseSharp,
  ellipsisHorizontal,
  options,
  settings,
} from 'ionicons/icons';
import type React from 'react';
import { useWalletSetupModal } from '../../../modals/walletSetup';

interface WalletListProps {
  onWalletClick?: (walletId: string) => void;
  className?: string;
}

const WalletList: React.FC<WalletListProps> = ({ onWalletClick, className }) => {
  const { wallets, isLoading, error, refreshWallets } = useWallet();
  const { account, selectedPeriod } = useSpendingAccount();
  const { formatCurrency } = useFormatters();
  const { open: openWalletSetupModal } = useWalletSetupModal();

  const handleRetry = async () => {
    await refreshWallets();
  };

  const handleSettingsClick = () => {
    if (account?.id && selectedPeriod?.id) {
      openWalletSetupModal(wallets, account.id, selectedPeriod.id);
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
        <EmptyContainer>
          <EmptyMessage>No wallets found for this period</EmptyMessage>
        </EmptyContainer>
      </WalletListContainer>
    );
  }

  return (
    <WalletListContainer className={className}>
      <WalletListHeaderContainer>
        <WalletListHeader>Wallets</WalletListHeader>
        <WalletListSettingsButton
          onClick={handleSettingsClick}
          aria-label='Manage wallets'
          type='button'
        >
          <IonIcon icon={options} color='primary' />
        </WalletListSettingsButton>
      </WalletListHeaderContainer>
      <WalletListContent>
        <StyledIonList lines='full' style={{ backgroundColor: 'transparent' }}>
          {wallets.map((wallet) => (
            <WalletListItem
              key={wallet.id}
              wallet={wallet}
              onClick={onWalletClick}
              formatCurrency={formatCurrency}
            />
          ))}
        </StyledIonList>
      </WalletListContent>
    </WalletListContainer>
  );
};

export default WalletList;
