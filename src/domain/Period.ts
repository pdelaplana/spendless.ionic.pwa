export interface IPeriod {
  readonly id?: string;
  readonly name: string;
  readonly goals: string;
  readonly targetSpend: number;
  readonly targetSavings: number;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly closedAt?: Date;
  readonly reflection: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type CreatePeriodDTO = Omit<IPeriod, 'id' | 'createdAt' | 'updatedAt' | 'closedAt'>;

export const createPeriod = (data: Partial<CreatePeriodDTO>): IPeriod => ({
  name: data.name ?? '',
  goals: data.goals ?? '',
  targetSpend: data.targetSpend ?? 0,
  targetSavings: data.targetSavings ?? 0,
  startAt: data.startAt ?? new Date(),
  endAt: data.endAt ?? new Date(),
  reflection: data.reflection ?? '',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const updatePeriod = (period: IPeriod, updates: Partial<IPeriod>): IPeriod => ({
  ...period,
  ...(updates.name && { name: updates.name }),
  ...(updates.goals && { goals: updates.goals }),
  ...(updates.targetSpend !== undefined && { targetSpend: Number(updates.targetSpend) }),
  ...(updates.targetSavings && { targetSavings: updates.targetSavings }),
  ...(updates.startAt && { startAt: updates.startAt }),
  ...(updates.endAt && { endAt: updates.endAt }),
  ...(updates.reflection !== undefined && { reflection: updates.reflection }),
  ...(updates.closedAt !== undefined && { closedAt: updates.closedAt }),
  updatedAt: new Date(),
});

export const closePeriod = (period: IPeriod): IPeriod => ({
  ...period,
  closedAt: new Date(),
  updatedAt: new Date(),
});

export const isPeriodActive = (period: IPeriod): boolean => {
  const now = new Date();
  return !period.closedAt && period.startAt <= now && period.endAt >= now;
};

export const isPeriodClosed = (period: IPeriod): boolean => {
  return !!period.closedAt;
};

export const validatePeriod = (period: IPeriod): string[] => {
  const errors: string[] = [];

  if (!period.name) errors.push('Name is required');
  if (!period.goals) errors.push('Goals are required');
  if (period.targetSpend < 0) errors.push('Target spend must be positive');
  if (period.startAt >= period.endAt) errors.push('Start date must be before end date');

  return errors;
};
