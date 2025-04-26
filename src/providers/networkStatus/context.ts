import { createContext } from 'react';
import type { NetworkStatusContextType } from './types';

export const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>({
  isOnline: navigator.onLine,
});
