import { type IRecurringSpend, createRecurringSpend } from '@/domain/RecurringSpend';
import { type DocumentData, Timestamp } from 'firebase/firestore';

export const ACCOUNTS_COLLECTION = 'accounts';
export const RECURRING_SPENDING_SUBCOLLECTION = 'recurringSpending';

// Mapper functions to handle Firestore data conversion
export const mapToFirestore = (recurringSpend: IRecurringSpend): DocumentData => ({
  accountId: recurringSpend.accountId,
  walletId: recurringSpend.walletId,
  startDate: Timestamp.fromDate(recurringSpend.startDate),
  description: recurringSpend.description,
  amount: Number(recurringSpend.amount),
  category: recurringSpend.category,
  tags: recurringSpend.tags || [],
  scheduleFrequency: recurringSpend.scheduleFrequency,
  dayOfWeek: recurringSpend.dayOfWeek ?? null,
  dayOfMonth: recurringSpend.dayOfMonth ?? null,
  isActive: recurringSpend.isActive,
  createdAt: Timestamp.fromDate(recurringSpend.createdAt),
  updatedAt: Timestamp.fromDate(recurringSpend.updatedAt),
});

export const mapFromFirestore = (id: string, data: DocumentData): IRecurringSpend => {
  const recurringSpend = createRecurringSpend({
    accountId: data.accountId,
    walletId: data.walletId || '',
    startDate: data.startDate?.toDate(),
    description: data.description,
    amount: Number(data.amount),
    category: data.category,
    tags: data.tags || [],
    scheduleFrequency: data.scheduleFrequency,
    dayOfWeek: data.dayOfWeek ?? undefined,
    dayOfMonth: data.dayOfMonth ?? undefined,
    isActive: data.isActive ?? true,
  });

  return {
    ...recurringSpend,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
