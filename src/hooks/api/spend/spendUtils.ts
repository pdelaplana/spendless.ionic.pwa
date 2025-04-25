import { Timestamp, type DocumentData } from 'firebase/firestore';
import { createSpend, type ISpend } from '@/domain/Spend';

export const ACCOUNTS_COLLECTION = 'accounts';
export const SPENDING_SUBCOLLECTION = 'spending';
export const PAGE_SIZE = 20;

// Mapper functions to handle Firestore data conversion
export const mapToFirestore = (spend: ISpend): DocumentData => ({
  accountId: spend.accountId,
  date: Timestamp.fromDate(spend.date),
  category: spend.category,
  amount: Number(spend.amount),
  description: spend.description,
  notes: spend.notes,
  periodId: spend.periodId,
  recurring: spend.recurring,
  createdAt: Timestamp.fromDate(spend.createdAt),
  updatedAt: Timestamp.fromDate(spend.updatedAt),
});

export const mapFromFirestore = (id: string, data: DocumentData): ISpend => {
  const spend = createSpend({
    accountId: data.accountId,
    date: data.date.toDate(),
    category: data.category,
    amount: Number(data.amount),
    description: data.description,
    notes: data.notes,
    periodId: data.periodId,
    recurring: data.recurring,
  });

  return {
    ...spend,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
