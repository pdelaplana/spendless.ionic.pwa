export interface IAccount {
  readonly id?: string;
  readonly name: string;
  readonly description?: string;
  readonly currency: string;
  readonly dateFormat?: string;
  readonly onboardingCompleted?: boolean;
  readonly onboardingCompletedAt?: Date;
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
  updatedAt: new Date(),
});
