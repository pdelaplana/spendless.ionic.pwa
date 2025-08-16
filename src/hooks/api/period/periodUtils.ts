import { type IPeriod, createPeriod } from '@/domain/Period';
import { type DocumentData, Timestamp } from 'firebase/firestore';

export const ACCOUNTS_COLLECTION = 'accounts';
export const PERIODS_SUBCOLLECTION = 'periods';

export const mapToFirestore = (period: IPeriod): DocumentData => ({
  name: period.name,
  goals: period.goals,
  targetSpend: Number(period.targetSpend),
  targetSavings: Number(period.targetSavings),
  startAt: Timestamp.fromDate(period.startAt),
  endAt: Timestamp.fromDate(period.endAt),
  closedAt: period.closedAt ? Timestamp.fromDate(period.closedAt) : null,
  reflection: period.reflection,
  walletSetup: period.walletSetup || [],
  createdAt: Timestamp.fromDate(period.createdAt),
  updatedAt: Timestamp.fromDate(period.updatedAt),
});

export const mapFromFirestore = (id: string, data: DocumentData): IPeriod => {
  const period = createPeriod({
    name: data.name,
    goals: data.goals,
    targetSpend: data.targetSpend,
    targetSavings: data.targetSavings,
    startAt: data.startAt.toDate(),
    endAt: data.endAt.toDate(),
    reflection: data.reflection,
    walletSetup: data.walletSetup || [],
  });

  return {
    ...period,
    id,
    closedAt: data.closedAt?.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
