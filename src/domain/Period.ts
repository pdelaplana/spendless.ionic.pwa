import { dateUtils } from '@/utils';
import type { IWalletSetup } from './Wallet';
import { validateWalletSetupArray } from './Wallet';

export interface IPeriod {
  readonly id?: string;
  readonly name: string;
  readonly goals: string;
  readonly targetSpend: number;
  readonly targetSavings: number;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly closedAt?: Date;
  readonly reflection: string;
  readonly walletSetup?: IWalletSetup[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type CreatePeriodDTO = Omit<IPeriod, 'id' | 'createdAt' | 'updatedAt' | 'closedAt'>;

export const createPeriod = (data: Partial<CreatePeriodDTO>): IPeriod => ({
  name: data.name ?? '',
  goals: data.goals ?? '',
  targetSpend: data.targetSpend ?? 0,
  targetSavings: data.targetSavings ?? 0,
  startAt: data.startAt ?? dateUtils.getCurrentDate(),
  endAt: data.endAt ?? dateUtils.getCurrentDate(),
  reflection: data.reflection ?? '',
  walletSetup: data.walletSetup ?? [
    {
      name: 'Default Wallet',
      spendingLimit: data.targetSpend ?? 0,
      isDefault: true,
    },
  ],
  createdAt: dateUtils.getCurrentDate(),
  updatedAt: dateUtils.getCurrentDate(),
});

export const updatePeriod = (period: IPeriod, updates: Partial<IPeriod>): IPeriod => ({
  ...period,
  ...(updates.name && { name: updates.name }),
  ...(updates.goals && { goals: updates.goals }),
  ...(updates.targetSpend !== undefined && { targetSpend: Number(updates.targetSpend) }),
  ...(updates.targetSavings && { targetSavings: updates.targetSavings }),
  ...(updates.startAt && { startAt: updates.startAt }),
  ...(updates.endAt && { endAt: updates.endAt }),
  ...(updates.reflection !== undefined && { reflection: updates.reflection }),
  ...(updates.walletSetup && { walletSetup: updates.walletSetup }),
  ...(updates.closedAt !== undefined && { closedAt: updates.closedAt }),
  updatedAt: dateUtils.getCurrentDate(),
});

export const closePeriod = (period: IPeriod): IPeriod => ({
  ...period,
  closedAt: dateUtils.getCurrentDate(),
  updatedAt: dateUtils.getCurrentDate(),
});

export const isPeriodActive = (period: IPeriod): boolean => {
  const now = dateUtils.getCurrentDate();
  return !period.closedAt && period.startAt <= now && period.endAt >= now;
};

export const isPeriodClosed = (period: IPeriod): boolean => {
  return !!period.closedAt;
};

export const validatePeriod = (period: IPeriod): string[] => {
  const errors: string[] = [];

  if (!period.name) errors.push('Name is required');
  if (!period.goals) errors.push('Goals are required');
  if (period.targetSpend < 0) errors.push('Target spend must be positive');
  if (period.startAt >= period.endAt) errors.push('Start date must be before end date');

  // Validate wallet setup if provided
  if (period.walletSetup && period.walletSetup.length > 0) {
    const walletErrors = validateWalletSetupArray(period.walletSetup);
    errors.push(...walletErrors);
  }

  return errors;
};

export const createDefaultWalletSetup = (targetSpend: number): IWalletSetup[] => [
  {
    name: 'Default Wallet',
    spendingLimit: targetSpend,
    isDefault: true,
  },
];

export const getTotalWalletLimits = (period: IPeriod): number => {
  if (!period.walletSetup || period.walletSetup.length === 0) {
    return period.targetSpend;
  }
  return period.walletSetup.reduce((total, wallet) => total + wallet.spendingLimit, 0);
};

export const getDefaultWallet = (period: IPeriod): IWalletSetup | undefined => {
  return period.walletSetup?.find((wallet) => wallet.isDefault);
};

export const hasWalletSetup = (period: IPeriod): boolean => {
  return !!(period.walletSetup && period.walletSetup.length > 0);
};
