import type { RegisterOptions } from 'react-hook-form';
import type { CreateSpendDTO } from '../Spend';

export const spendValidation: Record<keyof CreateSpendDTO, RegisterOptions> = {
  date: {
    required: 'Date is required',
  },
  category: {
    required: 'Category is required',
  },
  description: {
    required: 'Description is required',
    minLength: { value: 3, message: 'Description must be at least 3 characters' },
    maxLength: { value: 100, message: 'Description must be less than 100 characters' },
  },
  amount: {
    required: 'Amount is required',
    min: { value: 0.01, message: 'Amount must be greater than 0' },
    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
    validate: (value) => !isNaN(value) || 'Please enter a valid number',
  },
  notes: {
    maxLength: { value: 500, message: 'Notes must be less than 500 characters' },
  },
  accountId: {
    required: 'Account ID is required',
  },
  periodId: {
    required: 'Period ID is required',
  },
  recurring: {
    required: 'Recurring is required',
  },
};
