import { useCreateAccount } from '@/hooks/api';
import { useAppNotifications } from '@/hooks/ui';
import { useAuth } from '@/providers/auth';
import { detectCurrencyFromTimezone } from '@/utils/timezoneDetection';
import { useEffect, useRef } from 'react';

/**
 * Custom hook that ensures an authenticated user has an account.
 * If the user is authenticated but no account exists, it automatically creates one.
 *
 * This handles edge cases like:
 * - Account creation failed during signup
 * - User signs in on different device where account hasn't synced
 * - Data corruption or manual account deletion
 * - Race conditions between auth and account creation
 */
export const useEnsureAccount = () => {
  const { user, account: authAccount, authStateLoading, reloadAccount } = useAuth();
  const { showErrorNotification } = useAppNotifications();
  const createAccount = useCreateAccount();
  const accountCreationAttempted = useRef(false);

  useEffect(() => {
    const ensureAccountExists = async () => {
      // Only proceed if we have a user, auth state is not loading, and we haven't attempted account creation yet
      if (user && !authStateLoading && !authAccount && !accountCreationAttempted.current) {
        accountCreationAttempted.current = true;

        try {
          console.log('No account found for authenticated user, creating account...');

          // Auto-detect currency from browser timezone
          const detectedCurrency = detectCurrencyFromTimezone();
          console.log('Detected currency from timezone:', detectedCurrency);

          await createAccount.mutateAsync({
            userId: user.uid,
            data: {
              name: user.displayName || user.email || '',
              currency: detectedCurrency,
              onboardingCompleted: false,
              onboardingCompletedAt: undefined,
              subscriptionTier: 'essentials',
            },
          });

          // Reload account data to refresh the AuthProvider state
          await reloadAccount();
          console.log('Account created successfully for user');
        } catch (error) {
          console.error('Error creating account for user:', error);
          showErrorNotification('Failed to set up your account. Please refresh the page.');
        }
      }
    };

    ensureAccountExists();
  }, [user, authStateLoading, authAccount, createAccount, reloadAccount, showErrorNotification]);

  return {
    isAccountLoading: authStateLoading || (user && !authAccount),
    account: authAccount,
    user,
  };
};
