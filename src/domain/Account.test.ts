import { describe, expect, it } from 'vitest';
import {
  type IAccount,
  type SubscriptionTier,
  createAccount,
  createEmptyAccount,
  updateAccount,
} from './Account';

describe('Account Domain', () => {
  describe('createAccount', () => {
    it('should create account with default values', () => {
      const account = createAccount({});

      expect(account.name).toBe('');
      expect(account.description).toBe('');
      expect(account.currency).toBe('USD');
      expect(account.dateFormat).toBe('dd/MM/yyyy');
      expect(account.onboardingCompleted).toBe(false);
      expect(account.onboardingCompletedAt).toBeUndefined();
      expect(account.subscriptionTier).toBe('essentials');
      expect(account.expiresAt).toBeUndefined();
      expect(account.createdAt).toBeInstanceOf(Date);
      expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it('should create account with provided values', () => {
      const expiresAt = new Date('2025-12-31');
      const account = createAccount({
        name: 'Test Account',
        description: 'Test Description',
        currency: 'EUR',
        dateFormat: 'MM/dd/yyyy',
        onboardingCompleted: true,
        subscriptionTier: 'premium',
        expiresAt,
      });

      expect(account.name).toBe('Test Account');
      expect(account.description).toBe('Test Description');
      expect(account.currency).toBe('EUR');
      expect(account.dateFormat).toBe('MM/dd/yyyy');
      expect(account.onboardingCompleted).toBe(true);
      expect(account.subscriptionTier).toBe('premium');
      expect(account.expiresAt).toBe(expiresAt);
    });

    it('should set subscriptionTier to essentials by default', () => {
      const account = createAccount({ name: 'Test' });

      expect(account.subscriptionTier).toBe('essentials');
    });

    it('should accept premium subscription tier', () => {
      const account = createAccount({ subscriptionTier: 'premium' });

      expect(account.subscriptionTier).toBe('premium');
    });

    it('should handle expiresAt as undefined when not provided', () => {
      const account = createAccount({});

      expect(account.expiresAt).toBeUndefined();
    });

    it('should handle expiresAt when provided', () => {
      const expiryDate = new Date('2025-12-31');
      const account = createAccount({ expiresAt: expiryDate });

      expect(account.expiresAt).toBe(expiryDate);
    });
  });

  describe('createEmptyAccount', () => {
    it('should create account with all default values', () => {
      const account = createEmptyAccount();

      expect(account.name).toBe('');
      expect(account.currency).toBe('USD');
      expect(account.subscriptionTier).toBe('essentials');
      expect(account.expiresAt).toBeUndefined();
    });
  });

  describe('updateAccount', () => {
    it('should update subscriptionTier', () => {
      const account = createAccount({ name: 'Test' });
      const updated = updateAccount(account, { subscriptionTier: 'premium' });

      expect(updated.subscriptionTier).toBe('premium');
      expect(updated.name).toBe('Test');
    });

    it('should update expiresAt', () => {
      const account = createAccount({});
      const expiryDate = new Date('2025-12-31');
      const updated = updateAccount(account, { expiresAt: expiryDate });

      expect(updated.expiresAt).toBe(expiryDate);
    });

    it('should preserve expiresAt when update does not include it', () => {
      const initialExpiry = new Date('2025-12-31');
      const account = createAccount({ expiresAt: initialExpiry });
      const updated = updateAccount(account, { name: 'Updated Name' });

      expect(updated.expiresAt).toBe(initialExpiry);
    });

    it('should update updatedAt timestamp', () => {
      const account = createAccount({});
      const originalUpdatedAt = account.updatedAt;

      // Small delay to ensure different timestamp
      const updated = updateAccount(account, { name: 'Updated' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should preserve other fields when updating subscription', () => {
      const account = createAccount({
        name: 'Test Account',
        currency: 'EUR',
        subscriptionTier: 'essentials',
      });

      const updated = updateAccount(account, { subscriptionTier: 'premium' });

      expect(updated.name).toBe('Test Account');
      expect(updated.currency).toBe('EUR');
      expect(updated.subscriptionTier).toBe('premium');
    });
  });

  describe('SubscriptionTier type', () => {
    it('should only allow essentials or premium values', () => {
      const essentials: SubscriptionTier = 'essentials';
      const premium: SubscriptionTier = 'premium';

      expect(essentials).toBe('essentials');
      expect(premium).toBe('premium');
    });
  });
});
