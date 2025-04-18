export type SpendCategory = 'need' | 'want' | 'culture' | 'unexpected';

export interface ISpend {
  readonly id?: string;
  readonly accountId: string;
  readonly date: Date;
  readonly category: SpendCategory;
  readonly amount: number;
  readonly description: string;
  readonly notes?: string;
  readonly periodId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type CreateSpendDTO = Omit<ISpend, 'id' | 'createdAt' | 'updatedAt'>;

export const createSpend = (data: Partial<CreateSpendDTO>): ISpend => ({
  accountId: data.accountId ?? '',
  date: data.date ?? new Date(),
  category: data.category ?? 'need',
  amount: Number(data.amount ?? 0),
  description: data.description ?? '',
  notes: data.notes ?? '',
  periodId: data.periodId ?? '',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createEmptySpend = (): ISpend => createSpend({});

export const updateSpend = (spend: ISpend, updates: Partial<ISpend>): ISpend => ({
  ...spend,
  ...(updates.date && { date: updates.date }),
  ...(updates.category && { category: updates.category }),
  ...(updates.amount !== undefined && { amount: Number(updates.amount) }),
  ...(updates.description && { description: updates.description }),
  ...(updates.notes !== undefined && { notes: updates.notes }),
  updatedAt: new Date(),
});
