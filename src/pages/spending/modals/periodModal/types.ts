export interface PeriodFormData {
  id?: string;
  accountId: string;
  goals: string;
  targetSpend: string;
  targetSavings: string;
  startAt: string;
  endAt: string;
  reflection: string;
  closedAt?: Date;
}
