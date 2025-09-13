import { createContext } from 'react';
import type { WalletContextType } from './types';

export const WalletContext = createContext<WalletContextType | undefined>(undefined);
