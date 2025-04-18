import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
  type DocumentData,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import { createAccount, type IAccount, type CreateAccountDTO } from '@/domain/Account';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const ACCOUNTS_COLLECTION = 'accounts';

// Mapper functions to handle Firestore data conversion
const mapToFirestore = (account: IAccount): DocumentData => ({
  userId: account.userId,
  spendingLimit: account.spendingLimit,
  createdAt: Timestamp.fromDate(account.createdAt),
  updatedAt: Timestamp.fromDate(account.updatedAt),
});

const mapFromFirestore = (id: string, data: DocumentData): IAccount => {
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

export function useFetchAccountByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['account', userId],
    queryFn: async () => {
      try {
        if (!userId) return null;

        const q = query(collection(db, ACCOUNTS_COLLECTION), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return null;
        }

        const doc = querySnapshot.docs[0];
        return mapFromFirestore(doc.id, doc.data());
      } catch (error) {
        console.error('Error fetching account:', error);
        throw error;
      }
    },
    enabled: !!userId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountDTO) => {
      try {
        const docRef = doc(collection(db, ACCOUNTS_COLLECTION));
        const account = createAccount(data);
        const accountWithId = { ...account, id: docRef.id };

        await setDoc(docRef, mapToFirestore(accountWithId));
        return accountWithId;
      } catch (error) {
        console.error('Error creating account:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', data.userId] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IAccount> }) => {
      try {
        const docRef = doc(db, ACCOUNTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Account not found');
        }

        const existingAccount = mapFromFirestore(id, docSnap.data());
        const updatedAccount = { ...existingAccount, ...data, updatedAt: new Date() };

        await setDoc(docRef, mapToFirestore(updatedAccount));
        return updatedAccount;
      } catch (error) {
        console.error('Error updating account:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', data.userId] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const docRef = doc(db, ACCOUNTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Account not found');
        }

        const account = mapFromFirestore(id, docSnap.data());
        await deleteDoc(docRef);
        return account;
      } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', data.userId] });
    },
  });
}
