import type { IWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks';
import { useFetchWalletsByPeriod } from '@/hooks/api/wallet';
import { Preferences } from '@capacitor/preferences';
import * as Sentry from '@sentry/react';
import { type FC, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useSpendingAccount } from '../spendingAccount';
import { WalletContext } from './context';
import type { WalletState } from './types';

const WALLET_STORAGE_KEY = 'selectedWallet';

interface WalletProviderProps {
  children: ReactNode;
}

const initialState: WalletState = {
  selectedWallet: null,
  wallets: [],
  isLoading: false,
  error: null,
};

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>(initialState);
  const { logError } = useLogging();
  const { account, selectedPeriod } = useSpendingAccount();

  // Fetch wallets for the current period
  const {
    data: fetchedWallets = [],
    isLoading: isFetchingWallets,
    error: fetchError,
    refetch: refetchWallets,
  } = useFetchWalletsByPeriod(account?.id || '', selectedPeriod?.id || '');

  // Helper function to update state partially
  const updateState = useCallback((newState: Partial<WalletState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // Update wallets when fetched data changes
  useEffect(() => {
    updateState({
      wallets: fetchedWallets,
      isLoading: isFetchingWallets,
      error: fetchError ? 'Failed to load wallets' : null,
    });
  }, [fetchedWallets, isFetchingWallets, fetchError, updateState]);

  // Get default wallet from the list
  const getDefaultWallet = useCallback((): IWallet | null => {
    return state.wallets.find((wallet) => wallet.isDefault) || null;
  }, [state.wallets]);

  // Load selected wallet from storage when component mounts or period changes
  useEffect(() => {
    const loadSelectedWallet = async () => {
      if (!selectedPeriod?.id || state.wallets.length === 0) {
        return;
      }

      try {
        // Try to load from storage first
        const storageKey = `${WALLET_STORAGE_KEY}_${account?.id}_${selectedPeriod.id}`;
        const { value } = await Preferences.get({ key: storageKey });

        if (value) {
          const storedWalletId = value;
          const storedWallet = state.wallets.find((w) => w.id === storedWalletId);

          if (storedWallet) {
            updateState({ selectedWallet: storedWallet });
            return;
          }
        }

        // If no stored wallet or stored wallet not found, select default wallet
        const defaultWallet = getDefaultWallet();
        if (defaultWallet) {
          updateState({ selectedWallet: defaultWallet });
          // Store the default selection
          if (defaultWallet.id) {
            await Preferences.set({
              key: storageKey,
              value: defaultWallet.id,
            });
          }
        }
      } catch (error) {
        logError(error);
        // Fallback to default wallet if storage fails
        const defaultWallet = getDefaultWallet();
        if (defaultWallet) {
          updateState({ selectedWallet: defaultWallet });
        }
      }
    };

    loadSelectedWallet();
  }, [account?.id, selectedPeriod?.id, state.wallets, getDefaultWallet, updateState, logError]);

  // Select a wallet and persist to storage
  const selectWallet = useCallback(
    async (wallet: IWallet | null) => {
      if (!account?.id || !selectedPeriod?.id) {
        updateState({ error: 'No active account or period' });
        return;
      }

      try {
        updateState({ selectedWallet: wallet, error: null });

        // Persist selection to storage
        const storageKey = `${WALLET_STORAGE_KEY}_${account.id}_${selectedPeriod.id}`;
        if (wallet && wallet.id) {
          await Preferences.set({
            key: storageKey,
            value: wallet.id,
          });

          // Track wallet selection in Sentry
          Sentry.addBreadcrumb({
            message: 'Wallet selected',
            data: {
              walletId: wallet.id,
              walletName: wallet.name,
              periodId: selectedPeriod.id,
            },
            level: 'info',
          });
        } else {
          await Preferences.remove({ key: storageKey });
        }
      } catch (error) {
        logError(error);
        updateState({ error: 'Failed to save wallet selection' });
      }
    },
    [account?.id, selectedPeriod?.id, updateState, logError],
  );

  // Clear wallet selection
  const clearSelection = useCallback(() => {
    updateState({ selectedWallet: null, error: null });
  }, [updateState]);

  // Refresh wallets manually
  const refreshWallets = useCallback(async () => {
    try {
      updateState({ error: null });
      await refetchWallets();
    } catch (error) {
      logError(error);
      updateState({ error: 'Failed to refresh wallets' });
    }
  }, [refetchWallets, updateState, logError]);

  // Clear selection when period changes
  useEffect(() => {
    if (selectedPeriod?.id !== state.selectedWallet?.periodId) {
      clearSelection();
    }
  }, [selectedPeriod?.id, state.selectedWallet?.periodId, clearSelection]);

  // Computed values
  const hasWallets = useMemo(() => state.wallets.length > 0, [state.wallets.length]);

  const contextValue = useMemo(
    () => ({
      selectedWallet: state.selectedWallet,
      wallets: state.wallets,
      isLoading: state.isLoading,
      error: state.error,
      selectWallet,
      refreshWallets,
      hasWallets,
      getDefaultWallet,
      clearSelection,
    }),
    [
      state.selectedWallet,
      state.wallets,
      state.isLoading,
      state.error,
      selectWallet,
      refreshWallets,
      hasWallets,
      getDefaultWallet,
      clearSelection,
    ],
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};
