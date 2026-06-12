import { useContext } from 'react';
import { SpendingAccountContext } from './context';
import type { SpendingAccountContextType } from './types';

export const useSpendingAccount = (): SpendingAccountContextType => {
  const context = useContext(SpendingAccountContext);
  if (context === undefined) {
    throw new Error('useSpendingAccouint must be used within an SpendinghAccountProvider');
  }
  return context;
};
