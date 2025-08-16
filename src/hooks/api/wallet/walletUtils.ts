import { type IWallet, createWallet } from '@/domain/Wallet';
import { type DocumentData, Timestamp } from 'firebase/firestore';

export const ACCOUNTS_COLLECTION = 'accounts';
export const PERIODS_SUBCOLLECTION = 'periods';
export const WALLETS_SUBCOLLECTION = 'wallets';

// Mapper functions to handle Firestore data conversion
export const mapWalletToFirestore = (wallet: IWallet): DocumentData => ({
  accountId: wallet.accountId,
  periodId: wallet.periodId,
  name: wallet.name,
  spendingLimit: Number(wallet.spendingLimit),
  currentBalance: Number(wallet.currentBalance),
  isDefault: wallet.isDefault,
  createdAt: Timestamp.fromDate(wallet.createdAt),
  updatedAt: Timestamp.fromDate(wallet.updatedAt),
});

export const mapWalletFromFirestore = (id: string, data: DocumentData): IWallet => {
  const wallet = createWallet({
    accountId: data.accountId,
    periodId: data.periodId,
    name: data.name,
    spendingLimit: Number(data.spendingLimit),
    isDefault: data.isDefault,
  });

  return {
    ...wallet,
    id,
    currentBalance: Number(data.currentBalance || 0),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

// Helper function to get wallet collection path
export const getWalletCollectionPath = (accountId: string, periodId: string): string => {
  return `${ACCOUNTS_COLLECTION}/${accountId}/${PERIODS_SUBCOLLECTION}/${periodId}/${WALLETS_SUBCOLLECTION}`;
};

// Helper function to get wallet document path
export const getWalletDocumentPath = (
  accountId: string,
  periodId: string,
  walletId: string,
): string => {
  return `${getWalletCollectionPath(accountId, periodId)}/${walletId}`;
};
