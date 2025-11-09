import type { IAccount } from '@/domain/Account';
import { useMemo } from 'react';

interface UseSubscriptionReturn {
  /**
   * Current subscription tier
   */
  tier: 'essentials' | 'premium';

  /**
   * Whether the user is on the essentials tier
   */
  isEssentials: boolean;

  /**
   * Whether the user is on the premium tier
   */
  isPremium: boolean;

  /**
   * Whether the premium subscription has expired
   */
  isExpired: boolean;

  /**
   * Date when the subscription expires (null for essentials or expired premium)
   */
  expiresAt: Date | null;

  /**
   * Number of days until the subscription expires (null if not applicable)
   */
  daysUntilExpiry: number | null;

  /**
   * Whether the subscription is about to expire (within 7 days)
   */
  isExpiringSoon: boolean;

  /**
   * Whether the subscription has been cancelled
   */
  isCancelled: boolean;
}

/**
 * Hook to manage subscription-related logic and utilities
 *
 * @param account - The user's account data
 * @returns Subscription state and utility functions
 *
 * @example
 * ```tsx
 * const { account } = useSpendingAccount();
 * const subscription = useSubscription(account);
 *
 * if (subscription.isPremium) {
 *   // Show premium features
 * }
 *
 * if (subscription.isExpiringSoon) {
 *   // Show renewal reminder
 * }
 * ```
 */
export function useSubscription(account: IAccount | null): UseSubscriptionReturn {
  return useMemo(() => {
    if (!account) {
      return {
        tier: 'essentials',
        isEssentials: true,
        isPremium: false,
        isExpired: false,
        expiresAt: null,
        daysUntilExpiry: null,
        isExpiringSoon: false,
        isCancelled: false,
      };
    }

    const tier = account.subscriptionTier;
    const expiresAt = account.expiresAt || null;
    const now = new Date();

    // Check if subscription is expired
    const isExpired = expiresAt ? expiresAt < now : false;

    // Calculate days until expiry
    let daysUntilExpiry: number | null = null;
    if (expiresAt && !isExpired) {
      const diffTime = expiresAt.getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Check if expiring soon (within 7 days)
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7;

    // Check if subscription is cancelled
    const isCancelled = account.subscriptionCancelled === true;

    // Determine effective tier (expired premium = essentials)
    const effectiveTier = tier === 'premium' && !isExpired ? 'premium' : 'essentials';

    return {
      tier: effectiveTier,
      isEssentials: effectiveTier === 'essentials',
      isPremium: effectiveTier === 'premium',
      isExpired,
      expiresAt,
      daysUntilExpiry,
      isExpiringSoon,
      isCancelled,
    };
  }, [account]);
}
