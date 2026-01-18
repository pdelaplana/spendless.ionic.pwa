import { describe, expect, it } from 'vitest';
import { type IRecurringSpend, calculateOccurrencesInPeriod } from './RecurringSpend';

describe('RecurringSpend domain logic', () => {
  const baseRecurringSpend: IRecurringSpend = {
    id: 'test-id',
    accountId: 'test-account',
    walletId: 'test-wallet',
    startDate: new Date('2026-01-01T00:00:00Z'),
    description: 'Test Spend',
    amount: 100,
    category: 'rituals',
    scheduleFrequency: 'monthly',
    dayOfMonth: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('calculateOccurrencesInPeriod', () => {
    it('should generate monthly occurrences on the same day', () => {
      const periodStart = new Date('2026-01-01T00:00:00Z');
      const periodEnd = new Date('2026-03-31T23:59:59Z');
      const rs = { ...baseRecurringSpend, scheduleFrequency: 'monthly' as const, dayOfMonth: 15 };

      const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].getDate()).toBe(15);
      expect(occurrences[0].getMonth()).toBe(0); // Jan
      expect(occurrences[1].getMonth()).toBe(1); // Feb
      expect(occurrences[2].getMonth()).toBe(2); // Mar
    });

    it('should generate weekly occurrences', () => {
      const periodStart = new Date('2026-01-01T00:00:00Z'); // Thursday
      const periodEnd = new Date('2026-01-31T23:59:59Z');
      const rs = { ...baseRecurringSpend, scheduleFrequency: 'weekly' as const, dayOfWeek: 1 }; // Monday

      const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);

      // Mondays in Jan 2026: 5, 12, 19, 26
      expect(occurrences).toHaveLength(4);
      expect(occurrences[0].getDate()).toBe(5);
      expect(occurrences[3].getDate()).toBe(26);
    });

    it('should handle fortnightly occurrences', () => {
      const periodStart = new Date('2026-01-01T00:00:00Z');
      const periodEnd = new Date('2026-01-31T23:59:59Z');
      const rs = { ...baseRecurringSpend, scheduleFrequency: 'fortnightly' as const, dayOfWeek: 1 }; // Monday

      const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);

      // Mondays in Jan 2026: 5, 12, 19, 26
      // Starting from first Monday (5th), then 14 days later (19th)
      expect(occurrences).toHaveLength(2);
      expect(occurrences[0].getDate()).toBe(5);
      expect(occurrences[1].getDate()).toBe(19);
    });

    it('should NOT generate occurrences if startDate is after periodEnd', () => {
      const periodStart = new Date('2026-01-01T12:00:00');
      const periodEnd = new Date('2026-01-31T12:00:00');
      const rs = { ...baseRecurringSpend, startDate: new Date('2026-02-01T12:00:00') };

      const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);

      expect(occurrences).toHaveLength(0);
    });

    it('should respect startDate when it is within the period', () => {
      const periodStart = new Date('2026-01-01T00:00:00Z');
      const periodEnd = new Date('2026-01-31T23:59:59Z');
      const rs = {
        ...baseRecurringSpend,
        startDate: new Date('2026-01-15T00:00:00Z'),
        scheduleFrequency: 'weekly' as const,
        dayOfWeek: 4, // Thursday
      };

      const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);

      // Thursdays in Jan 2026: 1, 8, 15, 22, 29
      // Since startDate is Jan 15, it should start from there
      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].getDate()).toBe(15);
      expect(occurrences[2].getDate()).toBe(29);
    });

    it('should handle end of month correctly for monthly frequency', () => {
      const periodStart = new Date('2026-01-01T00:00:00Z');
      const periodEnd = new Date('2026-03-31T23:59:59Z');
      const rs = { ...baseRecurringSpend, dayOfMonth: 31 };

      const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].getDate()).toBe(31); // Jan 31
      expect(occurrences[1].getDate()).toBe(28); // Feb 28 (non-leap year)
      expect(occurrences[2].getDate()).toBe(31); // Mar 31
    });
  });
});
