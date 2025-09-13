import type { IWallet } from '@/domain/Wallet';

export interface WalletContextType {
  selectedWallet: IWallet | null;
  wallets: IWallet[];
  isLoading: boolean;
  error: string | null;
  selectWallet: (wallet: IWallet | null) => void;
  refreshWallets: () => Promise<void>;
  hasWallets: boolean;
  getDefaultWallet: () => IWallet | null;
  clearSelection: () => void;
}

export interface WalletState {
  selectedWallet: IWallet | null;
  wallets: IWallet[];
  isLoading: boolean;
  error: string | null;
}
