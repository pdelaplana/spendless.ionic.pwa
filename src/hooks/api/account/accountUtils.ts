import { type IAccount, createAccount } from '@/domain/Account';
import { type DocumentData, Timestamp } from 'firebase/firestore';

export const ACCOUNTS_COLLECTION = 'accounts';

// Mapper functions to handle Firestore data conversion
export const mapToFirestore = (account: IAccount): DocumentData => ({
  currency: account.currency,
  dateFormat: account.dateFormat ?? 'dd/MM/yyyy',
  onboardingCompleted: account.onboardingCompleted ?? false,
  onBoardingCompletedAt: account.onboardingCompletedAt ? Timestamp.fromDate(account.onboardingCompletedAt) : null,
  createdAt: Timestamp.fromDate(account.createdAt),
  updatedAt: Timestamp.fromDate(account.updatedAt),
});

export const mapFromFirestore = (id: string, data: DocumentData): IAccount => {
  const account = createAccount({
    currency: data.currency,
  });

  return {
    ...account,
    id,
    currency: data.currency,
    dateFormat: data.dateFormat,
    onboardingCompleted: data.onboardingCompleted,
    onboardingCompletedAt: data.onboardingCompletedAt ? data.onboardingCompletedAt.toDate() : null,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
