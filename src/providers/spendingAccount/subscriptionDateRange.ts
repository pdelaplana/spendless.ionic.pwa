export interface SubscriptionDateRange {
  startAt?: Date;
  endAt?: Date;
}

/**
 * Computes the date range restriction for fetching spending data based on subscription tier.
 *
 * Premium users have no restrictions.
 * Non-premium users are restricted to the last 30 days of history,
 * but endAt is intentionally NOT set so that future-dated scheduled spends
 * remain visible regardless of subscription tier.
 */
export function computeSubscriptionDateRange(
  subscriptionTier: string | undefined,
): SubscriptionDateRange {
  if (subscriptionTier === 'premium') {
    return { startAt: undefined, endAt: undefined };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return { startAt: thirtyDaysAgo, endAt: undefined };
}
