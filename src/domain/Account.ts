export interface IAccount {
  readonly id?: string;
  readonly userId: string;
  readonly name: string;
  readonly description?: string;
  readonly currency: string;
  readonly spendingLimit: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type CreateAccountDTO = Omit<IAccount, 'id' | 'createdAt' | 'updatedAt'>;

export const createAccount = (data: Partial<CreateAccountDTO>): IAccount => ({
  userId: data.userId ?? '',
  name: data.name ?? '',
  description: data.description ?? '',
  currency: data.currency ?? 'USD',
  spendingLimit: data.spendingLimit ?? 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createEmptyAccount = (): IAccount => createAccount({});

export const updateAccount = (account: IAccount, updates: Partial<IAccount>): IAccount => ({
  ...account,
  ...(updates.name && { name: updates.name }),
  ...(updates.description !== undefined && { description: updates.description }),
  ...(updates.currency && { currency: updates.currency }),
  updatedAt: new Date(),
});
