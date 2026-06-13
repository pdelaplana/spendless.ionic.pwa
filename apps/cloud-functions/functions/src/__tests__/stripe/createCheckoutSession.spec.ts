import functionsTest from 'firebase-functions-test';
import type Stripe from 'stripe';

// Initialize firebase-functions-test
const test = functionsTest();

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
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  isValidPriceId: jest.fn(),
  stripeSecretKey: { name: 'STRIPE_SECRET_KEY' },
}));

// Mock helper functions
jest.mock('../../stripe/helpers', () => ({
  getOrCreateStripeCustomer: jest.fn(),
  hasActiveSubscription: jest.fn(),
}));

import { isValidPriceId, stripe } from '../../config/stripe';
// Import after mocks
import { createCheckoutSession } from '../../stripe/createCheckoutSession';
import { getOrCreateStripeCustomer, hasActiveSubscription } from '../../stripe/helpers';

describe('createCheckoutSession', () => {
  const mockAuth = {
    uid: 'user123',
    token: {
      email: 'test@example.com',
    },
  };

  const mockCustomer: Partial<Stripe.Customer> = {
    id: 'cus_123',
    email: 'test@example.com',
  };

  const mockSession: Partial<Stripe.Checkout.Session> = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/pay/cs_test_123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:8100';
  });

  afterAll(() => {
    test.cleanup();
  });

  it('should create checkout session successfully', async () => {
    // Setup mocks
    (isValidPriceId as jest.Mock).mockReturnValue(true);
    (hasActiveSubscription as jest.Mock).mockResolvedValue(false);
    (getOrCreateStripeCustomer as jest.Mock).mockResolvedValue(mockCustomer);
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);

    // Call function using wrapped approach
    const wrapped = test.wrap(createCheckoutSession);
    const result = await wrapped({ data: { priceId: 'price_123' }, auth: mockAuth } as any);

    // Assertions
    expect(result).toEqual({
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    expect(hasActiveSubscription).toHaveBeenCalledWith('user123');
    expect(getOrCreateStripeCustomer).toHaveBeenCalledWith(
      'user123',
      'user123',
      'test@example.com',
    );
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_123',
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: 'price_123', quantity: 1 }],
        metadata: { accountId: 'user123', userId: 'user123' },
        subscription_data: {
          metadata: { accountId: 'user123', userId: 'user123' },
        },
      }),
    );
  });

  it('should use custom success and cancel URLs when provided', async () => {
    // Setup mocks
    (isValidPriceId as jest.Mock).mockReturnValue(true);
    (hasActiveSubscription as jest.Mock).mockResolvedValue(false);
    (getOrCreateStripeCustomer as jest.Mock).mockResolvedValue(mockCustomer);
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);

    // Call function with custom URLs
    const wrapped = test.wrap(createCheckoutSession);
    await wrapped({
      data: {
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      },
      auth: mockAuth,
    } as any);

    // Verify custom URLs were used
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      }),
    );
  });

  it('should throw unauthenticated error when user is not authenticated', async () => {
    const wrapped = test.wrap(createCheckoutSession);

    await expect(wrapped({ data: { priceId: 'price_123' }, auth: null } as any)).rejects.toThrow(
      'User must be authenticated to create a checkout session.',
    );
  });

  it('should throw invalid-argument error when priceId is missing', async () => {
    const wrapped = test.wrap(createCheckoutSession);

    await expect(wrapped({ data: {}, auth: mockAuth } as any)).rejects.toThrow(
      'Price ID is required.',
    );
  });

  it('should throw invalid-argument error when priceId is invalid', async () => {
    // Setup mocks
    (isValidPriceId as jest.Mock).mockReturnValue(false);

    const wrapped = test.wrap(createCheckoutSession);

    await expect(
      wrapped({ data: { priceId: 'invalid_price' }, auth: mockAuth } as any),
    ).rejects.toThrow('Invalid price ID.');
  });

  it('should throw already-exists error when user has active subscription', async () => {
    // Setup mocks
    (isValidPriceId as jest.Mock).mockReturnValue(true);
    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    const wrapped = test.wrap(createCheckoutSession);

    await expect(
      wrapped({ data: { priceId: 'price_123' }, auth: mockAuth } as any),
    ).rejects.toThrow('User already has an active subscription.');

    // Verify customer creation was not called
    expect(getOrCreateStripeCustomer).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('should throw internal error when Stripe checkout session creation fails', async () => {
    // Setup mocks
    (isValidPriceId as jest.Mock).mockReturnValue(true);
    (hasActiveSubscription as jest.Mock).mockResolvedValue(false);
    (getOrCreateStripeCustomer as jest.Mock).mockResolvedValue(mockCustomer);
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      id: null,
      url: null,
    });

    const wrapped = test.wrap(createCheckoutSession);

    await expect(
      wrapped({ data: { priceId: 'price_123' }, auth: mockAuth } as any),
    ).rejects.toThrow('Failed to create checkout session.');
  });

  it('should throw internal error and log to Sentry when unexpected error occurs', async () => {
    // Setup mocks
    (isValidPriceId as jest.Mock).mockReturnValue(true);
    (hasActiveSubscription as jest.Mock).mockResolvedValue(false);
    (getOrCreateStripeCustomer as jest.Mock).mockRejectedValue(new Error('Stripe API error'));

    const Sentry = require('@sentry/node');
    const wrapped = test.wrap(createCheckoutSession);

    await expect(
      wrapped({ data: { priceId: 'price_123' }, auth: mockAuth } as any),
    ).rejects.toThrow('An error occurred while creating the checkout session.');

    // Verify error was logged to Sentry
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should throw invalid-argument error when user email is missing', async () => {
    const wrapped = test.wrap(createCheckoutSession);

    await expect(
      wrapped({
        data: { priceId: 'price_123' },
        auth: {
          uid: 'user123',
          token: {},
        },
      } as any),
    ).rejects.toThrow('User ID and email are required.');
  });

  it('should use default URLs when not provided', async () => {
    // Setup mocks
    (isValidPriceId as jest.Mock).mockReturnValue(true);
    (hasActiveSubscription as jest.Mock).mockResolvedValue(false);
    (getOrCreateStripeCustomer as jest.Mock).mockResolvedValue(mockCustomer);
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);

    const wrapped = test.wrap(createCheckoutSession);

    await wrapped({ data: { priceId: 'price_123' }, auth: mockAuth } as any);

    // Verify default URLs were used
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: expect.stringContaining('http://localhost:8100/success'),
        cancel_url: expect.stringContaining('http://localhost:8100/pricing'),
      }),
    );
  });
});
