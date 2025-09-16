import type { IWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks';
import { useFetchWalletsByPeriod, useMigrateSpendingToWallets } from '@/hooks/api/wallet';
import { Preferences } from '@capacitor/preferences';
import * as Sentry from '@sentry/react';
import { type FC, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useSpendingAccount } from '../spendingAccount';
import { WalletContext } from './context';
import type { WalletState } from './types';

const WALLET_STORAGE_KEY = 'selectedWallet';

interface WalletProviderProps {
  walletId?: string;
  children: ReactNode;
}

const initialState: WalletState = {
  selectedWallet: null,
  isLoading: false,
  error: null,
};

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  console.log('🔄 WalletProvider render started');

  const [state, setState] = useState<WalletState>(initialState);
  const { logError } = useLogging();
  const { account, selectedPeriod } = useSpendingAccount();

  console.log('🔍 WalletProvider dependencies:', {
    accountId: account?.id,
    periodId: selectedPeriod?.id,
    accountExists: !!account,
    periodExists: !!selectedPeriod,
  });

  // Fetch wallets for the current period
  const {
    data: fetchedWallets = [],
    isLoading: isFetchingWallets,
    error: fetchError,
    refetch: refetchWallets,
  } = useFetchWalletsByPeriod(account?.id || '', selectedPeriod?.id || '');

  // Add debugging
  console.log('WalletProvider - Fetched wallets:', fetchedWallets);
  console.log('WalletProvider - Is loading:', isFetchingWallets);
  console.log('WalletProvider - Account ID:', account?.id);
  console.log('WalletProvider - Period ID:', selectedPeriod?.id);

  // Migration hook to handle existing spending without wallet assignments
  const migrationMutation = useMigrateSpendingToWallets();

  // Helper function to update state partially
  const updateState = useCallback((newState: Partial<WalletState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // Update loading and error state when fetched data changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isLoading: isFetchingWallets,
      error: fetchError ? 'Failed to load wallets' : null,
    }));
  }, [isFetchingWallets, fetchError]);

  /*
  // Run migration when period is loaded and not already running
  useEffect(() => {
    const runMigration = async () => {
      if (!account?.id || !selectedPeriod?.id || migrationMutation.isPending) {
        return;
      }

      // Only run migration if we have spending data loaded
      try {
        await migrationMutation.mutateAsync({
          accountId: account.id,
          periodId: selectedPeriod.id,
          targetSpend: selectedPeriod.targetSpend || 1000,
        });
      } catch (error) {
        // Migration failures are non-critical, just log them
        logError(error);
        console.warn('Wallet migration failed, but this is non-critical:', error);
      }
    };

    // Run migration after wallets are fetched and we have account/period
    if (!isFetchingWallets && account?.id && selectedPeriod?.id) {
      runMigration();
    }
  }, [
    account?.id,
    selectedPeriod?.id,
    selectedPeriod?.targetSpend,
    isFetchingWallets,
    migrationMutation,
    logError,
  ]);
  */

  // Get default wallet from the list
  const getDefaultWallet = useCallback((): IWallet | null => {
    return fetchedWallets.find((wallet) => wallet.isDefault) || null;
  }, [fetchedWallets]);

  // Load selected wallet from storage when component mounts or period changes
  useEffect(() => {
    const loadSelectedWallet = async () => {
      if (!selectedPeriod?.id || fetchedWallets.length === 0) {
        return;
      }

      try {
        // Try to load from storage first
        const storageKey = `${WALLET_STORAGE_KEY}_${account?.id}_${selectedPeriod.id}`;
        const { value } = await Preferences.get({ key: storageKey });

        if (value) {
          const storedWalletId = value;
          const storedWallet = fetchedWallets.find((w) => w.id === storedWalletId);

          if (storedWallet) {
            setState((prev) => ({ ...prev, selectedWallet: storedWallet }));
            return;
          }
        }

        // If no stored wallet or stored wallet not found, select default wallet
        const defaultWallet = fetchedWallets.find((wallet) => wallet.isDefault) || null;
        if (defaultWallet) {
          setState((prev) => ({ ...prev, selectedWallet: defaultWallet }));
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
        const defaultWallet = fetchedWallets.find((wallet) => wallet.isDefault) || null;
        if (defaultWallet) {
          setState((prev) => ({ ...prev, selectedWallet: defaultWallet }));
        }
      }
    };

    loadSelectedWallet();
  }, [account?.id, selectedPeriod?.id, fetchedWallets, logError]);

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
        if (wallet?.id) {
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
    if (
      selectedPeriod?.id &&
      state.selectedWallet?.periodId &&
      selectedPeriod.id !== state.selectedWallet.periodId
    ) {
      setState((prev) => ({ ...prev, selectedWallet: null, error: null }));
    }
  }, [selectedPeriod?.id, state.selectedWallet?.periodId]);

  // Computed values
  const hasWallets = useMemo(() => fetchedWallets.length > 0, [fetchedWallets.length]);

  const contextValue = useMemo(
    () => ({
      selectedWallet: state.selectedWallet,
      wallets: fetchedWallets,
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
      fetchedWallets,
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
