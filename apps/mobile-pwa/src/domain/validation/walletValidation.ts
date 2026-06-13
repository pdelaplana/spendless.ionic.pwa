import type { IWallet, IWalletSetup } from '../Wallet';

export const WALLET_VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  SPENDING_LIMIT: {
    MIN: 0.01,
    MAX: 1000000,
  },
  MAX_WALLETS_PER_PERIOD: 10,
  MIN_WALLETS_PER_PERIOD: 1,
} as const;

export const validateWalletName = (name: string): string[] => {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Wallet name is required');
    return errors;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < WALLET_VALIDATION_RULES.NAME.MIN_LENGTH) {
    errors.push('Wallet name must be at least 1 character');
  }

  if (trimmedName.length > WALLET_VALIDATION_RULES.NAME.MAX_LENGTH) {
    errors.push(
      `Wallet name must be no more than ${WALLET_VALIDATION_RULES.NAME.MAX_LENGTH} characters`,
    );
  }

  return errors;
};

export const validateSpendingLimit = (limit: number): string[] => {
  const errors: string[] = [];

  if (typeof limit !== 'number' || Number.isNaN(limit)) {
    errors.push('Spending limit must be a valid number');
    return errors;
  }

  if (limit < WALLET_VALIDATION_RULES.SPENDING_LIMIT.MIN) {
    errors.push(`Spending limit must be at least $${WALLET_VALIDATION_RULES.SPENDING_LIMIT.MIN}`);
  }

  if (limit > WALLET_VALIDATION_RULES.SPENDING_LIMIT.MAX) {
    errors.push(
      `Spending limit cannot exceed $${WALLET_VALIDATION_RULES.SPENDING_LIMIT.MAX.toLocaleString()}`,
    );
  }

  return errors;
};

export const validateWalletSetupUniqueness = (wallets: IWalletSetup[]): string[] => {
  const errors: string[] = [];
  const names = wallets.map((w) => w.name.toLowerCase().trim());
  const uniqueNames = new Set(names);

  if (names.length !== uniqueNames.size) {
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];
    errors.push(`Duplicate wallet names found: ${uniqueDuplicates.join(', ')}`);
  }

  return errors;
};

export const validateDefaultWalletCount = (wallets: IWalletSetup[]): string[] => {
  const errors: string[] = [];
  const defaultWallets = wallets.filter((w) => w.isDefault);

  if (defaultWallets.length === 0) {
    errors.push('Exactly one wallet must be marked as default');
  } else if (defaultWallets.length > 1) {
    errors.push('Only one wallet can be marked as default');
  }

  return errors;
};

export const validateWalletCount = (wallets: IWalletSetup[]): string[] => {
  const errors: string[] = [];

  if (wallets.length < WALLET_VALIDATION_RULES.MIN_WALLETS_PER_PERIOD) {
    errors.push(`At least ${WALLET_VALIDATION_RULES.MIN_WALLETS_PER_PERIOD} wallet is required`);
  }

  if (wallets.length > WALLET_VALIDATION_RULES.MAX_WALLETS_PER_PERIOD) {
    errors.push(
      `Maximum ${WALLET_VALIDATION_RULES.MAX_WALLETS_PER_PERIOD} wallets allowed per period`,
    );
  }

  return errors;
};

export const validateSingleWallet = (wallet: IWallet): string[] => {
  const errors: string[] = [];

  // Basic required field validation
  if (!wallet.accountId) errors.push('Account ID is required');
  if (!wallet.periodId) errors.push('Period ID is required');

  // Name validation
  errors.push(...validateWalletName(wallet.name));

  // Spending limit validation
  errors.push(...validateSpendingLimit(wallet.spendingLimit));

  // Balance validation
  if (typeof wallet.currentBalance !== 'number' || Number.isNaN(wallet.currentBalance)) {
    errors.push('Current balance must be a valid number');
  } else if (wallet.currentBalance < 0) {
    errors.push('Current balance cannot be negative');
  }

  return errors;
};

export const validateSingleWalletSetup = (wallet: IWalletSetup): string[] => {
  const errors: string[] = [];

  // Name validation
  errors.push(...validateWalletName(wallet.name));

  // Spending limit validation
  errors.push(...validateSpendingLimit(wallet.spendingLimit));

  return errors;
};

export const validateCompleteWalletSetup = (wallets: IWalletSetup[]): string[] => {
  const errors: string[] = [];

  // Count validation
  errors.push(...validateWalletCount(wallets));

  if (wallets.length === 0) {
    return errors; // No point validating further if no wallets
  }

  // Uniqueness validation
  errors.push(...validateWalletSetupUniqueness(wallets));

  // Default wallet validation
  errors.push(...validateDefaultWalletCount(wallets));

  // Individual wallet validation
  for (let index = 0; index < wallets.length; index++) {
    const wallet = wallets[index];
    const walletErrors = validateSingleWalletSetup(wallet);
    for (const error of walletErrors) {
      errors.push(`Wallet ${index + 1}: ${error}`);
    }
  }

  return errors;
};
