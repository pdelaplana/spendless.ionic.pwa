import { useContext } from 'react';
import { WalletContext } from './context';
import type { WalletContextType } from './types';

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
