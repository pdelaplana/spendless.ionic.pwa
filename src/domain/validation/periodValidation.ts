import type { PeriodFormData } from '@/pages/spending/modals/periodModal/types';
import type { RegisterOptions } from 'react-hook-form';
import type { CreatePeriodDTO } from '../Period';

export const periodValidation: Partial<
  Record<keyof CreatePeriodDTO, RegisterOptions<PeriodFormData>>
> = {
  goals: {
    required: 'Goals are required',
    minLength: { value: 3, message: 'Goals must be at least 3 characters' },
  },
  targetSpend: {
    required: 'Target spend is required',
    min: { value: 0, message: 'Target spend must be positive' },
  },
  targetSavings: {
    required: 'Target savings is required',
    min: { value: 0, message: 'Target savings must be positive' },
  },
  startAt: {
    required: 'Start date is required',
  },
  endAt: {
    required: 'End date is required',
    validate: (value, formValues) => {
      if (!value || !formValues?.startAt) return true;
      if (new Date(value) <= new Date(formValues.startAt)) {
        return 'End date must be after start date';
      }
      return true;
    },
  },
};
