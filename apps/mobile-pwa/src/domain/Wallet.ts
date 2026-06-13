export interface IWallet {
  readonly id?: string;
  readonly accountId: string;
  readonly periodId: string;
  readonly name: string;
  readonly spendingLimit: number;
  readonly currentBalance: number;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IWalletSetup {
  readonly name: string;
  readonly spendingLimit: number;
  readonly isDefault: boolean;
}

export type CreateWalletDTO = Omit<IWallet, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'>;

export const createWallet = (data: Partial<CreateWalletDTO>): IWallet => ({
  accountId: data.accountId ?? '',
  periodId: data.periodId ?? '',
  name: data.name ?? '',
  spendingLimit: Number(data.spendingLimit ?? 0),
  currentBalance: 0,
  isDefault: data.isDefault ?? false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createEmptyWallet = (): IWallet => createWallet({});

export const updateWallet = (wallet: IWallet, updates: Partial<IWallet>): IWallet => ({
  ...wallet,
  ...(updates.name && { name: updates.name }),
  ...(updates.spendingLimit !== undefined && { spendingLimit: Number(updates.spendingLimit) }),
  ...(updates.currentBalance !== undefined && { currentBalance: Number(updates.currentBalance) }),
  ...(updates.isDefault !== undefined && { isDefault: updates.isDefault }),
  updatedAt: new Date(),
});

export const createWalletFromSetup = (
  setup: IWalletSetup,
  accountId: string,
  periodId: string,
): IWallet => ({
  accountId,
  periodId,
  name: setup.name,
  spendingLimit: setup.spendingLimit,
  currentBalance: 0,
  isDefault: setup.isDefault,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const calculateWalletAvailable = (wallet: IWallet): number => {
  return Math.max(0, wallet.spendingLimit - wallet.currentBalance);
};

export const isWalletOverLimit = (wallet: IWallet): boolean => {
  return wallet.currentBalance > wallet.spendingLimit;
};

export const getWalletUsagePercentage = (wallet: IWallet): number => {
  if (wallet.spendingLimit === 0) return 0;
  return Math.min(100, (wallet.currentBalance / wallet.spendingLimit) * 100);
};

export const validateWallet = (wallet: IWallet): string[] => {
  const errors: string[] = [];

  if (!wallet.name) errors.push('Wallet name is required');
  if (!wallet.accountId) errors.push('Account ID is required');
  if (!wallet.periodId) errors.push('Period ID is required');
  if (wallet.spendingLimit < 0) errors.push('Spending limit must be positive');
  if (wallet.currentBalance < 0) errors.push('Current balance cannot be negative');

  return errors;
};

export const validateWalletSetup = (setup: IWalletSetup): string[] => {
  const errors: string[] = [];

  if (!setup.name) errors.push('Wallet name is required');
  if (setup.spendingLimit <= 0) errors.push('Spending limit must be greater than zero');

  return errors;
};

export const validateWalletSetupArray = (wallets: IWalletSetup[]): string[] => {
  const errors: string[] = [];

  if (wallets.length === 0) {
    errors.push('At least one wallet is required');
    return errors;
  }

  // Check for unique names
  const names = wallets.map((w) => w.name.toLowerCase().trim());
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    errors.push('Wallet names must be unique');
  }

  // Check for exactly one default wallet
  const defaultWallets = wallets.filter((w) => w.isDefault);
  if (defaultWallets.length === 0) {
    errors.push('Exactly one wallet must be marked as default');
  } else if (defaultWallets.length > 1) {
    errors.push('Only one wallet can be marked as default');
  }

  // Validate each wallet setup
  for (let index = 0; index < wallets.length; index++) {
    const wallet = wallets[index];
    const walletErrors = validateWalletSetup(wallet);
    for (const error of walletErrors) {
      errors.push(`Wallet ${index + 1}: ${error}`);
    }
  }

  return errors;
};
