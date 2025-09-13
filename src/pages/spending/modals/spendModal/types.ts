import type { SpendCategory } from '@/domain/Spend';

export interface SpendFormData {
  id?: string;
  accountId: string;
  periodId?: string;
  date: string;
  category: SpendCategory;
  amount: string;
  description: string;
  notes?: string;
  recurring?: boolean;

  tags?: string[];
}
