import type { IWallet } from '@/domain/Wallet';

export interface WalletListItemProps {
  wallet: IWallet;
  onEdit: (wallet: IWallet) => void;
  onDelete: (walletId: string) => void;
  canDelete: boolean;
}
