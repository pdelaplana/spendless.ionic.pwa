import type { ScheduleFrequency } from '@/domain/RecurringSpend';
import type { SpendCategory } from '@/domain/Spend';

export interface RecurringSpendFormData {
  id?: string;
  accountId: string;
  walletId: string;
  startDate: string;
  description: string;
  amount: string;
  category: SpendCategory;
  tags?: string[];
  scheduleFrequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isActive: boolean;
}
