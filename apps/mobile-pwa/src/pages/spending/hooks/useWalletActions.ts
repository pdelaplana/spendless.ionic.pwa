import type { IWallet } from '@/domain/Wallet';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { useWalletListModal } from '../modals/walletList/WalletListModal';
import { useWalletSwitcherActionSheet } from '../modals/walletList/useWalletSwitcherActionSheet';
import { useWalletSetupModal } from '../modals/walletSetup/WalletSetupModal';

export const useWalletActions = () => {
  const { open: openWalletListModal } = useWalletListModal();
  const { open: openWalletSetupModal } = useWalletSetupModal();
  const actionSheet = useWalletSwitcherActionSheet();
  const { account, selectedPeriod } = useSpendingAccount();
  const { selectedWallet, selectWallet, wallets } = useWallet();

  const handleWalletSelected = (wallet: IWallet) => {
    selectWallet(wallet);
  };

  const walletListHandler = () => {
    openWalletListModal(wallets, selectedWallet || undefined, handleWalletSelected);
  };

  const walletActionSheetHandler = () => {
    actionSheet.open(wallets, selectedWallet || undefined, handleWalletSelected);
  };

  const walletSetupHandler = () => {
    if (!account?.id || !selectedPeriod?.id) return;
    console.log('Opening wallet setup modal with wallets:', wallets);
    openWalletSetupModal(wallets, account.id, selectedPeriod.id);
  };

  return {
    walletListHandler,
    walletActionSheetHandler,
    walletSetupHandler,
    handleWalletSelected,
    actionSheet, // Expose the action sheet for rendering
  };
};
