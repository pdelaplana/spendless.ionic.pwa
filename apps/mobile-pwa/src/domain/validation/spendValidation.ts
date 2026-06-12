import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import type { RegisterOptions } from 'react-hook-form';
import type { CreateSpendDTO } from '../Spend';

export const spendValidation: Record<keyof CreateSpendDTO, RegisterOptions<SpendFormData>> = {
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
    validate: (value) => !isNaN(Number(value)) || 'Please enter a valid number',
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
  walletId: {
    required: 'Wallet ID is required',
  },
  recurring: {
    required: 'Recurring is required',
  },
  emotionalState: {
    validate: (value) =>
      ['happy', 'neutral', 'sad', 'angry', 'stressed', 'tired'].includes(value?.toString() || '') ||
      'Invalid emotional state',
  },
  emotionalContext: {},
  satisfactionRating: {
    min: { value: 0, message: 'Satisfaction rating must be at least 0' },
    max: { value: 5, message: 'Satisfaction rating must be at most 5' },
    validate: (value) => !Number.isNaN(Number(value)) || 'Please enter a valid number',
  },
  necessityRating: {
    min: { value: 0, message: 'Necessity rating must be at least 0' },
    max: { value: 5, message: 'Necessity rating must be at most 5' },
    validate: (value) => !Number.isNaN(Number(value)) || 'Please enter a valid number',
  },
  personalReflections: {},
  tags: {},
};
