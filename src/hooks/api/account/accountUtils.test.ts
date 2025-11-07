import { createAccount } from '@/domain/Account';
import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { mapFromFirestore, mapToFirestore } from './accountUtils';

describe('accountUtils', () => {
  describe('mapToFirestore', () => {
    it('should map account to Firestore document format', () => {
      const account = createAccount({
        currency: 'USD',
        dateFormat: 'dd/MM/yyyy',
        onboardingCompleted: true,
        subscriptionTier: 'essentials',
      });

      const firestoreDoc = mapToFirestore(account);

      expect(firestoreDoc.currency).toBe('USD');
      expect(firestoreDoc.dateFormat).toBe('dd/MM/yyyy');
      expect(firestoreDoc.onboardingCompleted).toBe(true);
      expect(firestoreDoc.subscriptionTier).toBe('essentials');
      expect(firestoreDoc.createdAt).toBeInstanceOf(Timestamp);
      expect(firestoreDoc.updatedAt).toBeInstanceOf(Timestamp);
    });

    it('should map subscriptionTier to Firestore', () => {
      const account = createAccount({ subscriptionTier: 'premium' });
      const firestoreDoc = mapToFirestore(account);

      expect(firestoreDoc.subscriptionTier).toBe('premium');
    });

    it('should convert expiresAt Date to Timestamp', () => {
      const expiryDate = new Date('2025-12-31');
      const account = createAccount({ expiresAt: expiryDate });
      const firestoreDoc = mapToFirestore(account);

      expect(firestoreDoc.expiresAt).toBeInstanceOf(Timestamp);
      expect(firestoreDoc.expiresAt.toDate()).toEqual(expiryDate);
    });

    it('should map expiresAt to null when undefined', () => {
      const account = createAccount({ expiresAt: undefined });
      const firestoreDoc = mapToFirestore(account);

      expect(firestoreDoc.expiresAt).toBeNull();
    });

    it('should handle both subscription tiers correctly', () => {
      const essentialsAccount = createAccount({ subscriptionTier: 'essentials' });
      const premiumAccount = createAccount({ subscriptionTier: 'premium' });

      const essentialsDoc = mapToFirestore(essentialsAccount);
      const premiumDoc = mapToFirestore(premiumAccount);

      expect(essentialsDoc.subscriptionTier).toBe('essentials');
      expect(premiumDoc.subscriptionTier).toBe('premium');
    });
  });

  describe('mapFromFirestore', () => {
    it('should map Firestore document to Account', () => {
      const firestoreData = {
        currency: 'EUR',
        dateFormat: 'MM/dd/yyyy',
        onboardingCompleted: true,
        onBoardingCompletedAt: Timestamp.fromDate(new Date('2024-01-01')),
        subscriptionTier: 'premium',
        expiresAt: Timestamp.fromDate(new Date('2025-12-31')),
        createdAt: Timestamp.fromDate(new Date('2024-01-01')),
        updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
      };

      const account = mapFromFirestore('user123', firestoreData);

      expect(account.id).toBe('user123');
      expect(account.currency).toBe('EUR');
      expect(account.dateFormat).toBe('MM/dd/yyyy');
      expect(account.onboardingCompleted).toBe(true);
      expect(account.subscriptionTier).toBe('premium');
      expect(account.expiresAt).toBeInstanceOf(Date);
      expect(account.expiresAt?.toISOString()).toBe(new Date('2025-12-31').toISOString());
    });

    it('should default subscriptionTier to essentials when missing', () => {
      const firestoreData = {
        currency: 'USD',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const account = mapFromFirestore('user123', firestoreData);

      expect(account.subscriptionTier).toBe('essentials');
    });

    it('should handle missing expiresAt field', () => {
      const firestoreData = {
        currency: 'USD',
        subscriptionTier: 'essentials',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const account = mapFromFirestore('user123', firestoreData);

      expect(account.expiresAt).toBeUndefined();
    });

    it('should convert expiresAt Timestamp to Date', () => {
      const expiryDate = new Date('2025-12-31');
      const firestoreData = {
        currency: 'USD',
        subscriptionTier: 'premium',
        expiresAt: Timestamp.fromDate(expiryDate),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const account = mapFromFirestore('user123', firestoreData);

      expect(account.expiresAt).toBeInstanceOf(Date);
      expect(account.expiresAt?.toISOString()).toBe(expiryDate.toISOString());
    });

    it('should handle null expiresAt', () => {
      const firestoreData = {
        currency: 'USD',
        subscriptionTier: 'essentials',
        expiresAt: null,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const account = mapFromFirestore('user123', firestoreData);

      expect(account.expiresAt).toBeUndefined();
    });

    it('should handle both subscription tiers from Firestore', () => {
      const baseData = {
        currency: 'USD',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const essentialsAccount = mapFromFirestore('user1', {
        ...baseData,
        subscriptionTier: 'essentials',
      });
      const premiumAccount = mapFromFirestore('user2', {
        ...baseData,
        subscriptionTier: 'premium',
      });

      expect(essentialsAccount.subscriptionTier).toBe('essentials');
      expect(premiumAccount.subscriptionTier).toBe('premium');
    });

    it('should handle legacy accounts without subscription fields', () => {
      const firestoreData = {
        currency: 'USD',
        dateFormat: 'dd/MM/yyyy',
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const account = mapFromFirestore('user123', firestoreData);

      expect(account.subscriptionTier).toBe('essentials');
      expect(account.expiresAt).toBeUndefined();
    });
  });
});
