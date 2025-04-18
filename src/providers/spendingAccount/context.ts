import { createContext } from 'react';
import type { SpendingAccountContextType } from './types';

export const SpendingAccountContext = createContext<SpendingAccountContextType | undefined>(
  undefined,
);
