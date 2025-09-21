import type { IWallet } from '@/domain/Wallet';

export interface WalletListItemProps {
  wallet: IWallet;
  isSelected: boolean;
  onSelect: (wallet: IWallet) => void;
}