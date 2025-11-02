export type SubscriptionTier = 'essentials' | 'premium';

export interface IAccount {
  readonly id?: string;
  readonly name: string;
  readonly description?: string;
  readonly currency: string;
  readonly dateFormat?: string;
  readonly onboardingCompleted?: boolean;
  readonly onboardingCompletedAt?: Date;
  readonly subscriptionTier: SubscriptionTier;
  readonly expiresAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type CreateAccountDTO = Omit<IAccount, 'id' | 'createdAt' | 'updatedAt'>;

export const createAccount = (data: Partial<CreateAccountDTO>): IAccount => ({
  name: data.name ?? '',
  description: data.description ?? '',
  currency: data.currency ?? 'USD',
  dateFormat: data.dateFormat ?? 'dd/MM/yyyy',
  onboardingCompleted: data.onboardingCompleted ?? false,
  onboardingCompletedAt: data.onboardingCompletedAt,
  subscriptionTier: data.subscriptionTier ?? 'essentials',
  expiresAt: data.expiresAt,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createEmptyAccount = (): IAccount => createAccount({});

export const updateAccount = (account: IAccount, updates: Partial<IAccount>): IAccount => ({
  ...account,
  ...(updates.name && { name: updates.name }),
  ...(updates.description !== undefined && { description: updates.description }),
  ...(updates.currency && { currency: updates.currency }),
  ...(updates.onboardingCompleted !== undefined && {
    onboardingCompleted: updates.onboardingCompleted,
  }),
  ...(updates.onboardingCompletedAt !== undefined && {
    onboardingCompletedAt: updates.onboardingCompletedAt,
  }),
  ...(updates.subscriptionTier && { subscriptionTier: updates.subscriptionTier }),
  ...(updates.expiresAt !== undefined && { expiresAt: updates.expiresAt }),
  updatedAt: new Date(),
});
