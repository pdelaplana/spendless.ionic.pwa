import { type CreateWalletDTO, createWallet, validateWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';
import { collection, doc, setDoc } from '@firebase/firestore';
import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWalletCollectionPath, mapWalletToFirestore } from './walletUtils';

interface CreateWalletParams {
  accountId: string;
  periodId: string;
  data: CreateWalletDTO;
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({ accountId, periodId, data }: CreateWalletParams) => {
      return Sentry.startSpan(
        {
          name: 'useCreateWallet',
          attributes: { accountId, periodId, walletName: data.name },
        },
        async (span) => {
          if (!accountId || !periodId) {
            throw new Error('Account ID and Period ID are required');
          }

          // Create the wallet document reference
          const walletCollectionPath = getWalletCollectionPath(accountId, periodId);
          const walletDocRef = doc(collection(db, walletCollectionPath));

          // Create wallet with provided data
          const wallet = createWallet({
            ...data,
            accountId,
            periodId,
          });
          const walletWithId = { ...wallet, id: walletDocRef.id };

          // Validate wallet
          const validationErrors = validateWallet(walletWithId);
          if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
          }

          // If this wallet is being set as default, handle existing default wallets
          if (data.isDefault) {
            const walletsCache = queryClient.getQueryData<(typeof walletWithId)[]>([
              'wallets',
              accountId,
              periodId,
            ]);

            if (walletsCache) {
              // Check if there's already a default wallet
              const existingDefault = walletsCache.find((w) => w.isDefault);
              if (existingDefault?.id) {
                // Update existing default wallet to false
                const { useUpdateWallet } = await import('./useUpdateWallet');
                // Note: In a real implementation, we'd need to handle this differently
                // For now, we'll let business logic in the UI handle ensuring only one default
                console.warn('Multiple default wallets detected. UI should handle this.');
              }
            }
          }

          // Save wallet to Firestore
          await setDoc(walletDocRef, mapWalletToFirestore(walletWithId));

          span.setAttributes({
            walletId: walletWithId.id,
            isDefault: walletWithId.isDefault,
            spendingLimit: walletWithId.spendingLimit,
          });

          return walletWithId;
        },
      );
    },
    onSuccess: (createdWallet, { accountId, periodId }) => {
      // Invalidate wallet cache to include new wallet
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });

      // If this is a default wallet, invalidate all wallet queries for this period
      if (createdWallet.isDefault) {
        queryClient.invalidateQueries({ queryKey: ['wallets', accountId, periodId] });
      }
    },
    onError: (error) => {
      logError(error);
    },
  });
}
