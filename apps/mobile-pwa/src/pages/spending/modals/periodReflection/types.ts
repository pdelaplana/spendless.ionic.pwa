export interface PeriodFormData {
  id?: string;
  accountId: string;
  periodId?: string;
  date: string;
  amount: string;
  description: string;
  notes?: string;
  recurring?: boolean;

  tags?: string[];

  emotionalState?: string;
  satisfactionRating?: number;
  necessityRating?: number;

  personalReflections?: Array<{
    question: string;
    answer: string;
  }>;
}
