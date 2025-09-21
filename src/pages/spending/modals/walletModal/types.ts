import type { ISpend } from '@/domain/Spend';
import type { IWallet } from '@/domain/Wallet';

export interface WalletFormData {
  name: string;
  spendingLimit: string;
  isDefault: boolean;
}

export interface WalletModalProps {
  wallet?: IWallet | null; // null/undefined for create mode, wallet object for edit mode
  onSave: (walletData: { name: string; spendingLimit: number; isDefault: boolean }) => void;
  onDelete?: (walletId: string) => void; // Optional delete handler
  accountId: string;
  periodId: string;
  existingWallets?: IWallet[]; // For validation purposes
  currency?: string;
  walletSpending?: ISpend[]; // Optional spending data for validation
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}
