import { type IWallet, updateWallet, validateWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { doc, updateDoc } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWalletDocumentPath, mapWalletToFirestore } from './walletUtils';

interface UpdateWalletParams {
  accountId: string;
  periodId: string;
  walletId: string;
  updates: Partial<Pick<IWallet, 'name' | 'spendingLimit' | 'isDefault'>>;
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, periodId, walletId, updates }: UpdateWalletParams) => {
      return Sentry.startSpan(
        {
          name: 'useUpdateWallet',
          attributes: { accountId, periodId, walletId },
        },
        async (span) => {
          if (!accountId || !periodId || !walletId) {
            throw new Error('Account ID, Period ID, and Wallet ID are required');
          }

          // Get current wallet data from cache
          const walletsCache = queryClient.getQueryData<IWallet[]>([
            'wallets',
            accountId,
            periodId,
          ]);
          const currentWallet = walletsCache?.find((w) => w.id === walletId);

          if (!currentWallet) {
            throw new Error('Wallet not found in cache. Please refresh and try again.');
          }

          // Apply updates to create updated wallet
          const updatedWallet = updateWallet(currentWallet, updates);

          // Validate the updated wallet
          const validationErrors = validateWallet(updatedWallet);
          if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
          }

          // If updating isDefault to true, we need to ensure no other wallet is default
          if (updates.isDefault === true && walletsCache) {
            const otherDefaultWallets = walletsCache.filter(
              (w) => w.id !== walletId && w.isDefault,
            );
            if (otherDefaultWallets.length > 0) {
              // Update other default wallets to false first
              for (const otherWallet of otherDefaultWallets) {
                if (otherWallet.id) {
                  const otherWalletPath = getWalletDocumentPath(accountId, periodId, otherWallet.id);
                  const otherWalletRef = doc(db, otherWalletPath);
                  await updateDoc(otherWalletRef, { isDefault: false, updatedAt: new Date() });
                }
              }
            }
          }

          // Update the wallet in Firestore
          const walletPath = getWalletDocumentPath(accountId, periodId, walletId);
          const walletRef = doc(db, walletPath);

          const updateData = {
            ...(updates.name && { name: updates.name }),
            ...(updates.spendingLimit !== undefined && {
              spendingLimit: Number(updates.spendingLimit),
            }),
            ...(updates.isDefault !== undefined && { isDefault: updates.isDefault }),
            updatedAt: new Date(),
          };

          await updateDoc(walletRef, updateData);

          span.setAttributes({
            updatedFields: Object.keys(updates).join(','),
            newIsDefault: updates.isDefault,
          });

          return { ...updatedWallet, id: walletId };
        },
      );
    },
    onSuccess: (updatedWallet, { accountId, periodId }) => {
      // Invalidate wallet cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });

      // Also invalidate wallet balance cache if it exists
      queryClient.invalidateQueries({
        queryKey: ['wallet-balance', accountId, periodId, updatedWallet.id],
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
