import type * as admin from 'firebase-admin';
import type Stripe from 'stripe';
import type { Account } from '../../types';

// Mock firebase-admin
const mockTransaction = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
};

const mockRunTransaction = jest.fn(async (callback) => await callback(mockTransaction));

const mockGet = jest.fn();
const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
const mockWhere = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockCollectionGet = jest.fn();

const mockCollection = jest.fn((collectionName: string) => {
  if (collectionName === 'processedWebhookEvents') {
    return { doc: mockDoc };
  }
  if (collectionName === 'accounts') {
    return {
      where: mockWhere,
      limit: mockLimit,
      get: mockCollectionGet,
    };
  }
  return {};
});

const mockFirestoreInstance = {
  collection: mockCollection,
  runTransaction: mockRunTransaction,
};

jest.mock('firebase-admin', () => {
  const firestoreMock = Object.assign(jest.fn().mockReturnValue(mockFirestoreInstance), {
    FieldValue: {
      serverTimestamp: jest.fn().mockReturnValue('SERVER_TIMESTAMP'),
    },
    Timestamp: {
      now: jest.fn().mockReturnValue({ toMillis: () => Date.now() }),
      fromMillis: jest.fn((ms) => ({
        toMillis: () => ms,
        toDate: () => new Date(ms),
      })),
    },
  });

  return {
    firestore: firestoreMock,
  };
});

// Mock Sentry
jest.mock('@sentry/node', () => ({
  default: {
    startSpan: jest.fn().mockImplementation((_options, fn) => fn()),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
  startSpan: jest.fn().mockImplementation((_options, fn) => fn()),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock Stripe configuration
const mockRetrieveSubscription = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock('../../config/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
    subscriptions: {
      retrieve: mockRetrieveSubscription,
    },
  },
  getWebhookSecret: jest.fn().mockReturnValue('whsec_test_secret'),
}));

// Note: sendPremiumSubscriptionEmail is a Firestore trigger that will fire automatically
// when the subscriptionTier field is updated. No mocking needed here.

import Sentry from '@sentry/node';
// Import after mocks
import { handleStripeWebhook } from '../../stripe/handleStripeWebhook';

describe('handleStripeWebhook', () => {
  const mockRequest = {
    method: 'POST',
    headers: {
      'stripe-signature': 'test_signature',
    },
    rawBody: Buffer.from('test_payload'),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const now = Math.floor(Date.now() / 1000);
  const futureDate = now + 30 * 24 * 60 * 60; // 30 days from now

  const createMockSubscription = (overrides?: Partial<Stripe.Subscription>): Stripe.Subscription =>
    ({
      id: 'sub_123',
      object: 'subscription',
      customer: 'cus_123',
      status: 'active',
      current_period_end: futureDate,
      current_period_start: now,
      created: now,
      cancel_at_period_end: false,
      items: {} as Stripe.ApiList<Stripe.SubscriptionItem>,
      ...overrides,
    }) as Stripe.Subscription;

  const createMockAccount = (overrides?: Partial<Account>): Account => ({
    id: 'acc_123',
    userId: 'user_123',
    name: 'Test Account',
    currency: 'USD',
    subscriptionTier: 'essentials',
    expiresAt: null,
    createdAt: { toMillis: () => now * 1000 } as unknown as admin.firestore.Timestamp,
    updatedAt: { toMillis: () => now * 1000 } as unknown as admin.firestore.Timestamp,
    stripeCustomerId: 'cus_123',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockGet.mockResolvedValue({ exists: false });
    mockCollectionGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'acc_123',
          ref: { id: 'acc_123' },
          data: () => createMockAccount(),
        },
      ],
    });
    mockTransaction.get.mockResolvedValue({
      exists: false,
      data: () => createMockAccount(),
    });
  });

  describe('Request Validation', () => {
    it('should reject non-POST requests', async () => {
      const getRequest = { ...mockRequest, method: 'GET' };

      await handleStripeWebhook(getRequest as never, mockResponse as never);

      expect(mockResponse.status).toHaveBeenCalledWith(405);
      expect(mockResponse.send).toHaveBeenCalledWith('Method Not Allowed');
    });

    it('should reject requests without Stripe signature', async () => {
      const noSigRequest = {
        ...mockRequest,
        headers: {},
      };

      await handleStripeWebhook(noSigRequest as never, mockResponse as never);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('Missing Stripe signature');
    });

    it('should reject requests with invalid signature', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('Webhook Error: Invalid signature');
    });
  });

  describe('customer.subscription.created', () => {
    it('should create premium subscription and track cancel_at_period_end as false', async () => {
      const subscription = createMockSubscription();
      const event: Partial<Stripe.Event> = {
        id: 'evt_created_123',
        type: 'customer.subscription.created',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockRetrieveSubscription).toHaveBeenCalledWith('sub_123');
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
          stripeSubscriptionStatus: 'active',
          stripeCancelAtPeriodEnd: false,
          subscriptionCancelled: false,
          subscriptionTier: 'premium',
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle trialing subscription', async () => {
      const subscription = createMockSubscription({ status: 'trialing' });
      const event: Partial<Stripe.Event> = {
        id: 'evt_trialing_123',
        type: 'customer.subscription.created',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          subscriptionTier: 'premium',
          stripeSubscriptionStatus: 'trialing',
        }),
      );
    });

    it('should skip if event already processed', async () => {
      const subscription = createMockSubscription();
      const event: Partial<Stripe.Event> = {
        id: 'evt_duplicate_123',
        type: 'customer.subscription.created',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockGet.mockResolvedValue({ exists: true }); // Event already processed

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockRetrieveSubscription).not.toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should skip if no account found', async () => {
      const subscription = createMockSubscription();
      const event: Partial<Stripe.Event> = {
        id: 'evt_no_account_123',
        type: 'customer.subscription.created',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);
      mockCollectionGet.mockResolvedValue({ empty: true, docs: [] });

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('customer.subscription.updated', () => {
    it('should track cancel_at_period_end when user schedules cancellation', async () => {
      const subscription = createMockSubscription({
        status: 'active',
        cancel_at_period_end: true, // User scheduled cancellation
      });
      const event: Partial<Stripe.Event> = {
        id: 'evt_cancel_scheduled_123',
        type: 'customer.subscription.updated',
        created: now + 100,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          subscriptionTier: 'premium', // Still premium until period ends
          stripeCancelAtPeriodEnd: true, // But cancellation is scheduled
          subscriptionCancelled: true, // Subscription is cancelled (scheduled)
        }),
      );
    });

    it('should clear cancel_at_period_end when user reactivates', async () => {
      const subscription = createMockSubscription({
        status: 'active',
        cancel_at_period_end: false, // User reactivated
      });
      const event: Partial<Stripe.Event> = {
        id: 'evt_reactivated_123',
        type: 'customer.subscription.updated',
        created: now + 200,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          subscriptionTier: 'premium',
          stripeCancelAtPeriodEnd: false,
          subscriptionCancelled: false,
        }),
      );
    });

    it('should keep premium for past_due status (payment retry period)', async () => {
      const subscription = createMockSubscription({
        status: 'past_due',
      });
      const event: Partial<Stripe.Event> = {
        id: 'evt_past_due_123',
        type: 'customer.subscription.updated',
        created: now + 300,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          subscriptionTier: 'premium', // Keep premium during retry period
          stripeSubscriptionStatus: 'past_due',
        }),
      );
    });

    it('should downgrade to essentials for canceled status', async () => {
      const subscription = createMockSubscription({
        status: 'canceled',
      });
      const event: Partial<Stripe.Event> = {
        id: 'evt_canceled_123',
        type: 'customer.subscription.updated',
        created: now + 400,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          subscriptionTier: 'essentials',
          expiresAt: null,
          stripeSubscriptionStatus: 'canceled',
        }),
      );
    });

    it('should downgrade to essentials for unpaid status', async () => {
      const subscription = createMockSubscription({
        status: 'unpaid',
      });
      const event: Partial<Stripe.Event> = {
        id: 'evt_unpaid_123',
        type: 'customer.subscription.updated',
        created: now + 500,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          subscriptionTier: 'essentials',
          expiresAt: null,
          stripeSubscriptionStatus: 'unpaid',
        }),
      );
    });

    it('should downgrade to essentials for incomplete_expired status', async () => {
      const subscription = createMockSubscription({
        status: 'incomplete_expired',
      });
      const event: Partial<Stripe.Event> = {
        id: 'evt_incomplete_expired_123',
        type: 'customer.subscription.updated',
        created: now + 600,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          subscriptionTier: 'essentials',
          expiresAt: null,
          stripeSubscriptionStatus: 'incomplete_expired',
        }),
      );
    });

    it('should discard older events based on timestamp', async () => {
      const subscription = createMockSubscription();
      const olderEvent: Partial<Stripe.Event> = {
        id: 'evt_old_123',
        type: 'customer.subscription.updated',
        created: now - 1000, // Older event
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(olderEvent);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      // Setup mocks so that transaction.get returns account with newer event
      mockTransaction.get.mockResolvedValueOnce({
        exists: true,
        data: () =>
          createMockAccount({
            stripeSubscriptionLastEvent: now, // More recent event already processed
          }),
      });
      mockTransaction.get.mockResolvedValueOnce({ exists: false }); // processedCheck

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      // Should mark as processed but not update account
      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should downgrade to essentials and clear cancel_at_period_end', async () => {
      const subscription = createMockSubscription({ status: 'canceled' });
      const event: Partial<Stripe.Event> = {
        id: 'evt_deleted_123',
        type: 'customer.subscription.deleted',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          subscriptionTier: 'essentials',
          expiresAt: null,
          stripeSubscriptionStatus: 'canceled',
          stripeCancelAtPeriodEnd: false,
          subscriptionCancelled: true,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('invoice.payment_succeeded', () => {
    it('should update subscription on successful payment', async () => {
      const subscription = createMockSubscription();
      const invoice: Partial<Stripe.Invoice> = {
        id: 'in_123',
        subscription: 'sub_123',
        customer: 'cus_123',
        amount_paid: 1999,
      };
      const event: Partial<Stripe.Event> = {
        id: 'evt_payment_succeeded_123',
        type: 'invoice.payment_succeeded',
        created: now,
        data: {
          object: invoice as Stripe.Invoice,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockRetrieveSubscription).toHaveBeenCalledWith('sub_123');
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'acc_123' }),
        expect.objectContaining({
          stripeSubscriptionPaid: true,
          stripeSubscriptionPayment: 1999,
          stripeSubscriptionPaymentFailedAt: null,
        }),
      );
    });

    it('should handle non-subscription invoices without fetching subscription', async () => {
      const invoice: Partial<Stripe.Invoice> = {
        id: 'in_123',
        subscription: null,
        customer: 'cus_123',
        amount_paid: 999,
      };
      const event: Partial<Stripe.Event> = {
        id: 'evt_non_sub_invoice_123',
        type: 'invoice.payment_succeeded',
        created: now,
        data: {
          object: invoice as Stripe.Invoice,
        },
      };

      mockConstructEvent.mockReturnValue(event);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockRetrieveSubscription).not.toHaveBeenCalled();
      // Should still update payment status but without subscription data
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stripeSubscriptionPaid: true,
          stripeSubscriptionPayment: 999,
          stripeSubscriptionPaymentFailedAt: null,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('invoice.payment_failed', () => {
    it('should track payment failure timestamp', async () => {
      const invoice: Partial<Stripe.Invoice> = {
        id: 'in_failed_123',
        subscription: 'sub_123',
        customer: 'cus_123',
      };
      const event: Partial<Stripe.Event> = {
        id: 'evt_payment_failed_123',
        type: 'invoice.payment_failed',
        created: now,
        data: {
          object: invoice as Stripe.Invoice,
        },
      };

      mockConstructEvent.mockReturnValue(event);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stripeSubscriptionPaid: false,
          stripeSubscriptionPaymentFailedAt: expect.anything(),
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should acknowledge webhook even when processing fails', async () => {
      const subscription = createMockSubscription();
      const event: Partial<Stripe.Event> = {
        id: 'evt_error_123',
        type: 'customer.subscription.created',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);
      mockCollectionGet.mockRejectedValue(new Error('Database error'));

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(Sentry.captureException).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        received: true,
        error: 'Processing failed but acknowledged',
      });
    });

    it('should handle unhandled event types gracefully', async () => {
      const event: Partial<Stripe.Event> = {
        id: 'evt_unhandled_123',
        type: 'customer.created' as any,
        created: now,
        data: {
          object: {} as never,
        },
      };

      mockConstructEvent.mockReturnValue(event);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should log error and capture in Sentry when current_period_end is missing', async () => {
      const subscription = createMockSubscription({
        current_period_end: undefined as unknown as number,
      });
      const event: Partial<Stripe.Event> = {
        id: 'evt_missing_period_123',
        type: 'customer.subscription.created',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Subscription missing current_period_end',
        expect.objectContaining({
          level: 'error',
        }),
      );
    });
  });

  describe('Idempotency', () => {
    it('should not reprocess events marked as processed in transaction', async () => {
      const subscription = createMockSubscription();
      const event: Partial<Stripe.Event> = {
        id: 'evt_concurrent_123',
        type: 'customer.subscription.created',
        created: now,
        data: {
          object: subscription,
        },
      };

      mockConstructEvent.mockReturnValue(event);
      mockRetrieveSubscription.mockResolvedValue(subscription);

      // Simulate concurrent processing - event marked as processed during transaction
      mockTransaction.get.mockResolvedValueOnce({
        exists: false,
        data: () => createMockAccount(),
      });
      mockTransaction.get.mockResolvedValueOnce({ exists: true }); // processedCheck

      await handleStripeWebhook(mockRequest as never, mockResponse as never);

      expect(mockTransaction.update).not.toHaveBeenCalled();
    });
  });
});
