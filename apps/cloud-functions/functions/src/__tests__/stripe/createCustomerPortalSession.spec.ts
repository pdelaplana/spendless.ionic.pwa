import functionsTest from 'firebase-functions-test';
import type Stripe from 'stripe';

// Initialize firebase-functions-test
const test = functionsTest();

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  return {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn(),
    }),
  };
});

// Mock Sentry
jest.mock('@sentry/node', () => ({
  default: {
    startSpan: jest.fn().mockImplementation((_options, fn) => fn()),
    captureException: jest.fn(),
  },
  startSpan: jest.fn().mockImplementation((_options, fn) => fn()),
  captureException: jest.fn(),
}));

// Mock Stripe configuration
jest.mock('../../config/stripe', () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  stripeSecretKey: { name: 'STRIPE_SECRET_KEY' },
}));

// Import after mocks
import * as admin from 'firebase-admin';
import { stripe } from '../../config/stripe';
import { createCustomerPortalSession } from '../../stripe/createCustomerPortalSession';

describe('createCustomerPortalSession', () => {
  const mockAuth = {
    uid: 'user123',
    token: {
      email: 'test@example.com',
    },
  };

  const mockPortalSession: Partial<Stripe.BillingPortal.Session> = {
    id: 'bps_123',
    url: 'https://billing.stripe.com/session/test_123',
  };

  const mockAccountData = {
    id: 'account123',
    userId: 'user123',
    stripeCustomerId: 'cus_123',
    subscriptionTier: 'premium',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:8100';
  });

  afterAll(() => {
    test.cleanup();
  });

  it('should create customer portal session successfully', async () => {
    // Setup mocks
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => mockAccountData,
    });

    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    (admin.firestore as unknown as jest.Mock).mockReturnValue({ collection: mockCollection });

    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockPortalSession);

    // Call function using wrapped approach
    const wrapped = test.wrap(createCustomerPortalSession);
    const result = await wrapped({ data: {}, auth: mockAuth } as any);

    // Assertions
    expect(result).toEqual({
      url: 'https://billing.stripe.com/session/test_123',
    });

    expect(mockCollection).toHaveBeenCalledWith('accounts');
    expect(mockDoc).toHaveBeenCalledWith('user123');
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'http://localhost:8100/settings',
    });
  });

  it('should use custom return URL when provided', async () => {
    // Setup mocks
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => mockAccountData,
    });

    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    (admin.firestore as unknown as jest.Mock).mockReturnValue({ collection: mockCollection });

    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockPortalSession);

    // Call function with custom return URL
    const wrapped = test.wrap(createCustomerPortalSession);
    await wrapped({
      data: { returnUrl: 'https://example.com/dashboard' },
      auth: mockAuth,
    } as any);

    // Verify custom return URL was used
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'https://example.com/dashboard',
    });
  });

  it('should throw unauthenticated error when user is not authenticated', async () => {
    const wrapped = test.wrap(createCustomerPortalSession);

    await expect(wrapped({ data: {}, auth: null } as any)).rejects.toThrow(
      'User must be authenticated to access the customer portal.',
    );
  });

  it('should throw invalid-argument error when user ID is missing', async () => {
    const wrapped = test.wrap(createCustomerPortalSession);

    await expect(
      wrapped({ data: {}, auth: { token: { email: 'test@example.com' } } } as any),
    ).rejects.toThrow('User ID is required.');
  });

  it('should throw not-found error when account does not exist', async () => {
    // Setup mocks
    const mockGet = jest.fn().mockResolvedValue({
      exists: false,
    });

    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    (admin.firestore as unknown as jest.Mock).mockReturnValue({ collection: mockCollection });

    const wrapped = test.wrap(createCustomerPortalSession);

    await expect(wrapped({ data: {}, auth: mockAuth } as any)).rejects.toThrow(
      'Account not found.',
    );
  });

  it('should throw failed-precondition error when account has no Stripe customer ID', async () => {
    // Setup mocks
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        id: 'account123',
        userId: 'user123',
        stripeCustomerId: null,
      }),
    });

    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    (admin.firestore as unknown as jest.Mock).mockReturnValue({ collection: mockCollection });

    const wrapped = test.wrap(createCustomerPortalSession);

    await expect(wrapped({ data: {}, auth: mockAuth } as any)).rejects.toThrow(
      'No Stripe customer found. Please create a subscription first.',
    );
  });

  it('should throw internal error when portal session creation fails', async () => {
    // Setup mocks
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => mockAccountData,
    });

    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    (admin.firestore as unknown as jest.Mock).mockReturnValue({ collection: mockCollection });

    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({
      id: 'bps_123',
      url: null,
    });

    const wrapped = test.wrap(createCustomerPortalSession);

    await expect(wrapped({ data: {}, auth: mockAuth } as any)).rejects.toThrow(
      'Failed to create customer portal session.',
    );
  });

  it('should throw internal error and log to Sentry when unexpected error occurs', async () => {
    // Setup mocks - simulate a database error
    const mockCollection = jest.fn().mockImplementation(() => {
      throw new Error('Database error');
    });
    (admin.firestore as unknown as jest.Mock).mockReturnValue({ collection: mockCollection });

    const Sentry = require('@sentry/node');
    const wrapped = test.wrap(createCustomerPortalSession);

    await expect(wrapped({ data: {}, auth: mockAuth } as any)).rejects.toThrow(
      'An error occurred while creating the customer portal session.',
    );

    // Verify error was logged to Sentry
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should use default return URL when returnUrl is not provided', async () => {
    // Setup mocks
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => mockAccountData,
    });

    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    (admin.firestore as unknown as jest.Mock).mockReturnValue({ collection: mockCollection });

    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockPortalSession);

    // Call function with empty data
    const wrapped = test.wrap(createCustomerPortalSession);
    await wrapped({ data: {}, auth: mockAuth } as any);

    // Verify default return URL was used
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        return_url: 'http://localhost:8100/settings',
      }),
    );
  });
});
