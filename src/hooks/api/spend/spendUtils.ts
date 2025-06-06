import { type ISpend, createSpend } from '@/domain/Spend';
import { dataTagSymbol } from '@tanstack/react-query';
import { type DocumentData, Timestamp } from 'firebase/firestore';

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
  emotionalState: spend.emotionalState,
  satisfactionRating: spend.satisfactionRating,
  necessityRating: spend.necessityRating,
  personalReflections: spend.personalReflections,
  tags: spend.tags || [], // Ensure tags are always an array
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
    emotionalState: data.emotionalState,
    satisfactionRating: data.satisfactionRating,
    necessityRating: data.necessityRating,
    tags: data.tags || [],
    personalReflections: data.personalReflections || [],
  });

  return {
    ...spend,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
