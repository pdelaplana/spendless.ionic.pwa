import { Timestamp, type DocumentData } from 'firebase/firestore';
import { createAccount, type IAccount } from '@/domain/Account';

export const ACCOUNTS_COLLECTION = 'accounts';

// Mapper functions to handle Firestore data conversion
export const mapToFirestore = (account: IAccount): DocumentData => ({
  currency: account.currency,
  dateFormat: account.dateFormat ?? 'dd/MM/yyyy',
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
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
