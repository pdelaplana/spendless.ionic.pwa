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

/**
 * Calculate all occurrence dates for a recurring spend within a given period
 * @param recurringSpend The recurring spend configuration
 * @param periodStart Start date of the period (inclusive)
 * @param periodEnd End date of the period (inclusive)
 * @returns Array of Date objects representing when the spend should occur
 */
export const calculateOccurrencesInPeriod = (
  recurringSpend: IRecurringSpend,
  periodStart: Date,
  periodEnd: Date,
): Date[] => {
  const occurrences: Date[] = [];
  const startDate = new Date(recurringSpend.startDate);
  startDate.setHours(0, 0, 0, 0);

  const periodStartCopy = new Date(periodStart);
  periodStartCopy.setHours(0, 0, 0, 0);

  const periodEndCopy = new Date(periodEnd);
  periodEndCopy.setHours(0, 0, 0, 0);

  // If recurring spend starts after period ends, no occurrences
  if (startDate > periodEndCopy) {
    return occurrences;
  }

  // Start from the later of startDate or periodStart
  const calculationStart = new Date(Math.max(startDate.getTime(), periodStartCopy.getTime()));

  if (recurringSpend.scheduleFrequency === 'weekly') {
    const targetDay = recurringSpend.dayOfWeek ?? 0;
    const current = new Date(calculationStart);

    // Find the first occurrence of the target day
    const daysUntilTarget = (targetDay - current.getDay() + 7) % 7;
    current.setDate(current.getDate() + daysUntilTarget);

    // Generate all weekly occurrences within the period
    while (current <= periodEndCopy) {
      occurrences.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
  } else if (recurringSpend.scheduleFrequency === 'fortnightly') {
    const targetDay = recurringSpend.dayOfWeek ?? 0;
    const current = new Date(calculationStart);

    // Find the first occurrence of the target day
    const daysUntilTarget = (targetDay - current.getDay() + 7) % 7;
    current.setDate(current.getDate() + daysUntilTarget);

    // Generate all fortnightly occurrences within the period
    while (current <= periodEndCopy) {
      occurrences.push(new Date(current));
      current.setDate(current.getDate() + 14);
    }
  } else if (recurringSpend.scheduleFrequency === 'monthly') {
    const targetDay = recurringSpend.dayOfMonth ?? 1;
    const current = new Date(calculationStart);

    // Helper to get last day of month
    const getLastDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    // Set to target day of current month (capped at last day of month)
    const currentMonthLastDay = getLastDayOfMonth(current);
    current.setDate(Math.min(targetDay, currentMonthLastDay));

    // If we're past the target day this month, move to next month
    if (current < calculationStart) {
      current.setDate(1);
      current.setMonth(current.getMonth() + 1);
      const nextMonthLastDay = getLastDayOfMonth(current);
      current.setDate(Math.min(targetDay, nextMonthLastDay));
    }

    // Generate all monthly occurrences within the period
    while (current <= periodEndCopy) {
      occurrences.push(new Date(current));
      current.setDate(1); // Set to day 1 before incrementing month
      current.setMonth(current.getMonth() + 1);
      const monthLastDay = getLastDayOfMonth(current);
      current.setDate(Math.min(targetDay, monthLastDay));
    }
  }

  return occurrences;
};
