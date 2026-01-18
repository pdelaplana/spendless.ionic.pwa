import type { SpendCategory } from '@/domain/Spend';

export interface SpendFormData {
  id?: string;
  accountId: string;
  periodId?: string;
  walletId?: string;
  date: string;
  category: SpendCategory;
  amount: string;
  description: string;
  notes?: string;

  emotionalState?: string;
  satisfactionRating?: number;
  necessityRating?: number;
  personalReflections?: Array<{
    question: string;
    answer: string;
  }>;
  tags?: string[];
}
