import { useContext } from 'react';
import { NetworkStatusContext } from './context';
import type { NetworkStatusContextType } from './types';

export const useNetworkStatus = (): NetworkStatusContextType => {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error('useNetworkStatus must be used within an NetworkStatusProvider');
  }
  return context;
};
