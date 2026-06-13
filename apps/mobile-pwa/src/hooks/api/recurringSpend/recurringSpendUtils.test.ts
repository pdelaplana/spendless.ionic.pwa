import { createRecurringSpend } from '@/domain/RecurringSpend';
import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { mapFromFirestore, mapToFirestore } from './recurringSpendUtils';

const baseFirestoreData = {
  accountId: 'acc1',
  walletId: 'w1',
  startDate: Timestamp.fromDate(new Date('2026-01-01')),
  description: 'Netflix',
  amount: 15,
  category: 'rituals',
  tags: [],
  scheduleFrequency: 'monthly',
  dayOfWeek: null,
  dayOfMonth: 1,
  isActive: true,
  createdAt: Timestamp.fromDate(new Date('2026-01-01')),
  updatedAt: Timestamp.fromDate(new Date('2026-01-01')),
};

describe('recurringSpendUtils', () => {
  describe('mapToFirestore', () => {
    it('includes walletName when set', () => {
      const rs = createRecurringSpend({ walletId: 'w1', walletName: 'Savings' });
      const doc = mapToFirestore(rs);
      expect(doc.walletName).toBe('Savings');
    });

    it('maps walletName to null when undefined', () => {
      const rs = createRecurringSpend({ walletId: 'w1' });
      const doc = mapToFirestore(rs);
      expect(doc.walletName).toBeNull();
    });
  });

  describe('mapFromFirestore', () => {
    it('reads walletName from Firestore document', () => {
      const rs = mapFromFirestore('rs1', { ...baseFirestoreData, walletName: 'Savings' });
      expect(rs.walletName).toBe('Savings');
    });

    it('returns undefined walletName for legacy records without the field', () => {
      const rs = mapFromFirestore('rs1', baseFirestoreData);
      expect(rs.walletName).toBeUndefined();
    });

    it('returns undefined walletName when field is null', () => {
      const rs = mapFromFirestore('rs1', { ...baseFirestoreData, walletName: null });
      expect(rs.walletName).toBeUndefined();
    });
  });
});
