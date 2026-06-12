import { type IAccount, createAccount } from '@/domain/Account';
import { type DocumentData, Timestamp } from 'firebase/firestore';

export const ACCOUNTS_COLLECTION = 'accounts';

// Mapper functions to handle Firestore data conversion
export const mapToFirestore = (account: IAccount): DocumentData => ({
  currency: account.currency,
  dateFormat: account.dateFormat ?? 'dd/MM/yyyy',
  onboardingCompleted: account.onboardingCompleted ?? false,
  onBoardingCompletedAt: account.onboardingCompletedAt
    ? Timestamp.fromDate(account.onboardingCompletedAt)
    : null,
  subscriptionTier: account.subscriptionTier,
  expiresAt: account.expiresAt ? Timestamp.fromDate(account.expiresAt) : null,
  subscriptionCancelled: account.subscriptionCancelled ?? null,
  aiCheckinEnabled: account.aiCheckinEnabled ?? false,
  lastAiCheckinAt: account.lastAiCheckinAt ? Timestamp.fromDate(account.lastAiCheckinAt) : null,
  customEmotionalContexts: account.customEmotionalContexts ?? {},
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
    subscriptionTier: data.subscriptionTier ?? 'essentials',
    expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
    subscriptionCancelled: data.subscriptionCancelled ?? undefined,
    aiCheckinEnabled: data.aiCheckinEnabled ?? false,
    lastAiCheckinAt: data.lastAiCheckinAt ? data.lastAiCheckinAt.toDate() : undefined,
    customEmotionalContexts: data.customEmotionalContexts ?? {},
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};
