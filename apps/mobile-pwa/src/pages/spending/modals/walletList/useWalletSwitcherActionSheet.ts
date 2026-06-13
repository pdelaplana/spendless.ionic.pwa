import type { IWallet } from '@/domain/Wallet';
import { useState } from 'react';

export const useWalletSwitcherActionSheet = (): {
  isOpen: boolean;
  open: (
    wallets: IWallet[],
    currentWallet?: IWallet,
    onWalletSelected?: (wallet: IWallet) => void,
  ) => void;
  close: () => void;
  wallets: IWallet[];
  currentWallet?: IWallet;
  onWalletSelected?: (wallet: IWallet) => void;
} => {
  const [isOpen, setIsOpen] = useState(false);
  const [wallets, setWallets] = useState<IWallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<IWallet | undefined>();
  const [onWalletSelected, setOnWalletSelected] = useState<
    ((wallet: IWallet) => void) | undefined
  >();

  const open = (
    walletsData: IWallet[],
    currentWalletData?: IWallet,
    onWalletSelectedCallback?: (wallet: IWallet) => void,
  ) => {
    setWallets(walletsData);
    setCurrentWallet(currentWalletData);
    setOnWalletSelected(() => onWalletSelectedCallback);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    // Clean up after animation completes
    setTimeout(() => {
      setWallets([]);
      setCurrentWallet(undefined);
      setOnWalletSelected(undefined);
    }, 300);
  };

  return {
    isOpen,
    open,
    close,
    wallets,
    currentWallet,
    onWalletSelected,
  };
};
