import { Timestamp, type DocumentData } from 'firebase/firestore';
import { createAccount, type IAccount } from '@/domain/Account';

export const ACCOUNTS_COLLECTION = 'accounts';

// Mapper functions to handle Firestore data conversion
export const mapToFirestore = (account: IAccount): DocumentData => ({
  userId: account.userId,
  spendingLimit: account.spendingLimit,
  createdAt: Timestamp.fromDate(account.createdAt),
  updatedAt: Timestamp.fromDate(account.updatedAt),
});

export const mapFromFirestore = (id: string, data: DocumentData): IAccount => {
  const account = createAccount({
    userId: data.userId,
    spendingLimit: data.spendingLimit,
  });

  return {
    ...account,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
