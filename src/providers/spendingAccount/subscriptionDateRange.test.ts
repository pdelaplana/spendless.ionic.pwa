import { describe, expect, it } from 'vitest';
import { computeSubscriptionDateRange } from './subscriptionDateRange';

describe('computeSubscriptionDateRange', () => {
  it('returns no restrictions for premium users', () => {
    const { startAt, endAt } = computeSubscriptionDateRange('premium');
    expect(startAt).toBeUndefined();
    expect(endAt).toBeUndefined();
  });

  it('restricts startAt to 30 days ago for essentials users', () => {
    const { startAt } = computeSubscriptionDateRange('essentials');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Allow 1 second tolerance for test execution time
    expect(startAt?.getTime()).toBeCloseTo(thirtyDaysAgo.getTime(), -3);
  });

  it('does not set endAt for essentials users so future-dated spends remain visible', () => {
    const { endAt } = computeSubscriptionDateRange('essentials');
    expect(endAt).toBeUndefined();
  });

  it('restricts startAt to 30 days ago for unknown subscription tiers', () => {
    const { startAt } = computeSubscriptionDateRange(undefined);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    expect(startAt?.getTime()).toBeCloseTo(thirtyDaysAgo.getTime(), -3);
  });

  it('does not set endAt for unknown subscription tiers', () => {
    const { endAt } = computeSubscriptionDateRange(undefined);
    expect(endAt).toBeUndefined();
  });
});
