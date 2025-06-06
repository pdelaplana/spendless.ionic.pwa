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
  readonly recurring?: boolean;
  readonly emotionalState?: string;
  readonly satisfactionRating?: number;
  readonly necessityRating?: number;
  readonly personalReflections?: Array<{
    question: string;
    answer: string;
  }>;
  readonly tags?: string[];
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
  recurring: data.recurring ?? false,
  periodId: data.periodId ?? '',
  emotionalState: data.emotionalState ?? 'Neutral',
  satisfactionRating: data.satisfactionRating ?? 0,
  necessityRating: data.necessityRating ?? 0,
  personalReflections: data.personalReflections ?? [],
  tags: data.tags ?? [],
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
  ...(updates.recurring !== undefined && { recurring: updates.recurring }),
  ...(updates.emotionalState && { emotionalState: updates.emotionalState }),
  ...(updates.satisfactionRating !== undefined && {
    satisfactionRating: updates.satisfactionRating,
  }),
  ...(updates.necessityRating !== undefined && { necessityRating: updates.necessityRating }),
  ...(updates.personalReflections && { personalReflections: updates.personalReflections }),
  ...(updates.tags && { tags: updates.tags }),
  updatedAt: new Date(),
});
