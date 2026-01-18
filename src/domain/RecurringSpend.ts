import { dateUtils } from '@/utils';
import type { SpendCategory } from './Spend';

export type ScheduleFrequency = 'weekly' | 'fortnightly' | 'monthly';

export interface IRecurringSpend {
  readonly id?: string;
  readonly accountId: string;
  readonly walletId: string;
  readonly startDate: Date;
  readonly description: string;
  readonly amount: number;
  readonly category: SpendCategory;
  readonly tags?: string[];
  readonly scheduleFrequency: ScheduleFrequency;
  readonly dayOfWeek?: number; // 0-6 for weekly/fortnightly (0 = Sunday)
  readonly dayOfMonth?: number; // 1-31 for monthly
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type CreateRecurringSpendDTO = Omit<IRecurringSpend, 'id' | 'createdAt' | 'updatedAt'>;

export const createRecurringSpend = (data: Partial<CreateRecurringSpendDTO>): IRecurringSpend => ({
  accountId: data.accountId ?? '',
  walletId: data.walletId ?? '',
  startDate: data.startDate ?? dateUtils.getCurrentDate(),
  description: data.description ?? '',
  amount: Number(data.amount ?? 0),
  category: data.category ?? 'need',
  tags: data.tags ?? [],
  scheduleFrequency: data.scheduleFrequency ?? 'monthly',
  dayOfWeek: data.dayOfWeek,
  dayOfMonth: data.dayOfMonth ?? 1,
  isActive: data.isActive ?? true,
  createdAt: dateUtils.getCurrentDate(),
  updatedAt: dateUtils.getCurrentDate(),
});

export const createEmptyRecurringSpend = (): IRecurringSpend => createRecurringSpend({});

export const updateRecurringSpend = (
  recurringSpend: IRecurringSpend,
  updates: Partial<IRecurringSpend>,
): IRecurringSpend => ({
  ...recurringSpend,
  ...(updates.walletId && { walletId: updates.walletId }),
  ...(updates.startDate && { startDate: updates.startDate }),
  ...(updates.description && { description: updates.description }),
  ...(updates.amount !== undefined && { amount: Number(updates.amount) }),
  ...(updates.category && { category: updates.category }),
  ...(updates.tags && { tags: updates.tags }),
  ...(updates.scheduleFrequency && { scheduleFrequency: updates.scheduleFrequency }),
  ...(updates.dayOfWeek !== undefined && { dayOfWeek: updates.dayOfWeek }),
  ...(updates.dayOfMonth !== undefined && { dayOfMonth: updates.dayOfMonth }),
  ...(updates.isActive !== undefined && { isActive: updates.isActive }),
  updatedAt: dateUtils.getCurrentDate(),
});

// Helper to get the day label for display
export const getDayOfWeekLabel = (day: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] ?? '';
};

export const getDayOfMonthLabel = (day: number): string => {
  if (day === 1 || day === 21 || day === 31) return `${day}st`;
  if (day === 2 || day === 22) return `${day}nd`;
  if (day === 3 || day === 23) return `${day}rd`;
  return `${day}th`;
};

export const getScheduleDescription = (recurringSpend: IRecurringSpend): string => {
  switch (recurringSpend.scheduleFrequency) {
    case 'weekly':
      return `Every week on ${getDayOfWeekLabel(recurringSpend.dayOfWeek ?? 0)}`;
    case 'fortnightly':
      return `Every 2 weeks on ${getDayOfWeekLabel(recurringSpend.dayOfWeek ?? 0)}`;
    case 'monthly':
      return `Monthly on the ${getDayOfMonthLabel(recurringSpend.dayOfMonth ?? 1)}`;
    default:
      return '';
  }
};
