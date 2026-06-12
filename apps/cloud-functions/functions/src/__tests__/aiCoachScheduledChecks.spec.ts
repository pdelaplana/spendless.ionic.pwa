import * as admin from 'firebase-admin';

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const mockTimestamp = {
    now: jest.fn().mockReturnValue({
      seconds: 1705316400, // 2025-01-15 09:00:00 UTC (mid-period for Jan 1-31)
      toDate: () => new Date('2025-01-15T09:00:00Z'),
    }),
    fromDate: jest.fn((date: Date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      toDate: () => date,
    })),
  };

  return {
    firestore: Object.assign(
      jest.fn().mockReturnValue({
        collection: jest.fn(),
      }),
      {
        Timestamp: mockTimestamp,
      },
    ),
    auth: jest.fn().mockReturnValue({
      getUser: jest.fn(),
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

// Mock Gemini API
const mockGenerateContent = jest.fn();
jest.mock('../config/gemini', () => ({
  geminiApiKey: 'mock-secret',
  getGeminiModel: jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
  }),
}));

// Mock Stripe helpers
jest.mock('../stripe/helpers', () => ({
  hasActiveSubscription: jest.fn(),
}));

// Mock AI Chat helpers
jest.mock('../helpers/aiChatContext', () => ({
  getSpendingDataForPeriod: jest.fn(),
  calculateCategoryBreakdown: jest.fn(),
}));

jest.mock('../helpers/aiChatPrompt', () => ({
  buildNotificationPrompt: jest.fn(),
}));

import { calculateCategoryBreakdown, getSpendingDataForPeriod } from '../helpers/aiChatContext';
import { buildNotificationPrompt } from '../helpers/aiChatPrompt';
// Import after mocks
import { aiCoachScheduledChecksHandler } from '../scheduled/aiCoachScheduledChecks';
import { hasActiveSubscription } from '../stripe/helpers';

describe('aiCoachScheduledChecks', () => {
  const mockAccountsRef = {
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    doc: jest.fn(),
  };

  const mockPeriodsRef = {
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  const mockNotificationsRef = {
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(),
    doc: jest.fn(),
  };

  const mockNotificationDoc = {
    set: jest.fn().mockResolvedValue(undefined),
  };

  const mockCollection = jest.fn((name: string) => {
    if (name === 'accounts') {
      return mockAccountsRef;
    }
    return {
      doc: jest.fn().mockReturnValue({
        collection: jest.fn((subName: string) => {
          if (subName === 'periods') {
            return mockPeriodsRef;
          }
          if (subName === 'aiChatNotifications') {
            return mockNotificationsRef;
          }
          return {};
        }),
      }),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (admin.firestore as unknown as jest.Mock).mockReturnValue({
      collection: mockCollection,
    });

    // Mock auth().getUser()
    (admin.auth as unknown as jest.Mock).mockReturnValue({
      getUser: jest.fn().mockResolvedValue({
        uid: 'user123',
        displayName: 'John Doe',
        email: 'john@example.com',
      }),
    });

    // Setup mockAccountsRef.doc to return an object with collection method
    mockAccountsRef.doc.mockReturnValue({
      collection: jest.fn((subName: string) => {
        if (subName === 'periods') {
          return mockPeriodsRef;
        }
        if (subName === 'aiChatNotifications') {
          return mockNotificationsRef;
        }
        return {};
      }),
    });

    mockNotificationsRef.doc.mockReturnValue(mockNotificationDoc);
    mockNotificationDoc.set.mockResolvedValue(undefined);
  });

  it('should generate milestone notification for mid-period account', async () => {
    // Mock account with AI Chat enabled
    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'John Doe',
            currency: 'USD',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    // Mock premium subscription
    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    // Mock active period (Jan 1-31, we're at Jan 15 = 48% through)
    mockPeriodsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'period123',
          data: () => ({
            name: 'January 2025',
            startAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01T00:00:00Z')),
            endAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-31T23:59:59Z')),
            targetSpend: 1000,
            targetSavings: 500,
            goals: 'Save for vacation',
          }),
        },
      ],
    });

    // Mock no recent notifications
    mockNotificationsRef.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    // Mock spending data
    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([
      { date: new Date(), amount: 400, description: 'Groceries', category: 'essentials' },
    ]);

    (calculateCategoryBreakdown as jest.Mock).mockReturnValue([
      { category: 'essentials', amount: 400, count: 1 },
    ]);

    (buildNotificationPrompt as jest.Mock).mockReturnValue('Mock prompt for milestone');

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Hey John! You're halfway through January. Great job staying on track!",
        usageMetadata: { totalTokenCount: 150 },
      },
    });

    // Execute function
    await aiCoachScheduledChecksHandler();

    // Verify notification was created
    expect(mockNotificationDoc.set).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user123',
        accountId: 'user123',
        periodId: 'period123',
        periodName: 'January 2025',
        content: "Hey John! You're halfway through January. Great job staying on track!",
        checkInType: 'milestone',
        isRead: false,
        tokensUsed: 150,
        aiModel: 'gemini-2.5-flash',
      }),
    );

    expect(buildNotificationPrompt).toHaveBeenCalledWith(
      'John',
      'milestone',
      expect.any(Object),
      expect.any(Array),
      expect.any(Array),
      'USD',
    );
  });

  it('should generate budget-warning notification when 75%+ of budget spent', async () => {
    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'Jane Smith',
            currency: 'USD',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    // Mock active period (Jan 1-31, we're at Jan 15 = 48% through)
    // Budget is 1000, spending is 800 = 80% of budget
    mockPeriodsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'period123',
          data: () => ({
            name: 'January 2025',
            startAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01T00:00:00Z')),
            endAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-31T23:59:59Z')),
            targetSpend: 1000,
          }),
        },
      ],
    });

    mockNotificationsRef.get.mockResolvedValue({ empty: true, docs: [] });

    // Mock high spending (80% of budget)
    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([
      { date: new Date(), amount: 800, description: 'Various', category: 'rewards' },
    ]);

    (calculateCategoryBreakdown as jest.Mock).mockReturnValue([
      { category: 'rewards', amount: 800, count: 1 },
    ]);

    (buildNotificationPrompt as jest.Mock).mockReturnValue('Mock prompt for budget warning');

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Heads up Jane! You've used 80% of your budget with 16 days remaining.",
        usageMetadata: { totalTokenCount: 120 },
      },
    });

    await aiCoachScheduledChecksHandler();

    expect(mockNotificationDoc.set).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Heads up Jane! You've used 80% of your budget with 16 days remaining.",
        checkInType: 'budget-warning',
      }),
    );
  });

  it('should generate period-ending notification when 3 days or less remaining', async () => {
    // Set date to Jan 29 (3 days before end of Jan 31)
    (admin.firestore.Timestamp.now as jest.Mock).mockReturnValue({
      seconds: 1706515200, // 2025-01-29 00:00:00 UTC
      toDate: () => new Date('2025-01-29T00:00:00Z'),
    });

    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'Bob',
            currency: 'USD',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    mockPeriodsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'period123',
          data: () => ({
            name: 'January 2025',
            startAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01T00:00:00Z')),
            endAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-31T23:59:59Z')),
            targetSpend: 1000,
          }),
        },
      ],
    });

    mockNotificationsRef.get.mockResolvedValue({ empty: true, docs: [] });

    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([
      { date: new Date(), amount: 500, description: 'Various', category: 'essentials' },
    ]);

    (calculateCategoryBreakdown as jest.Mock).mockReturnValue([
      { category: 'essentials', amount: 500, count: 1 },
    ]);

    (buildNotificationPrompt as jest.Mock).mockReturnValue('Mock prompt for period ending');

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'Your period ends in 3 days! Great job staying on budget this month.',
        usageMetadata: { totalTokenCount: 100 },
      },
    });

    await aiCoachScheduledChecksHandler();

    expect(mockNotificationDoc.set).toHaveBeenCalledWith(
      expect.objectContaining({
        checkInType: 'period-ending',
      }),
    );
  });

  it('should skip accounts without premium subscription', async () => {
    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'John Doe',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(false);

    await aiCoachScheduledChecksHandler();

    // Should not create any notifications
    expect(mockNotificationDoc.set).not.toHaveBeenCalled();
  });

  it('should skip accounts without active periods', async () => {
    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'John Doe',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    // No active periods
    mockPeriodsRef.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    await aiCoachScheduledChecksHandler();

    expect(mockNotificationDoc.set).not.toHaveBeenCalled();
  });

  it('should skip accounts with notifications sent in last 24 hours', async () => {
    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'John Doe',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    mockPeriodsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'period123',
          data: () => ({
            name: 'January 2025',
            startAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01T00:00:00Z')),
            endAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-31T23:59:59Z')),
          }),
        },
      ],
    });

    // Mock recent notification exists
    mockNotificationsRef.get.mockResolvedValue({
      empty: false,
      docs: [{ id: 'recent-notif' }],
    });

    await aiCoachScheduledChecksHandler();

    expect(mockNotificationDoc.set).not.toHaveBeenCalled();
  });

  it('should respect 24-hour notification cooldown', async () => {
    // Set date to Jan 10 (32% through period, not mid-point)
    (admin.firestore.Timestamp.now as jest.Mock).mockReturnValue({
      seconds: 1704880800, // 2025-01-10 12:00:00 UTC
      toDate: () => new Date('2025-01-10T12:00:00Z'),
    });

    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'John Doe',
            currency: 'USD',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    mockPeriodsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'period123',
          data: () => ({
            name: 'January 2025',
            startAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01T00:00:00Z')),
            endAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-31T23:59:59Z')),
            targetSpend: 1000,
          }),
        },
      ],
    });

    mockNotificationsRef.get.mockResolvedValue({ empty: true, docs: [] });

    // Low spending (50% of budget, not 75%+)
    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([
      { date: new Date(), amount: 500, description: 'Various', category: 'essentials' },
    ]);

    (calculateCategoryBreakdown as jest.Mock).mockReturnValue([
      { category: 'essentials', amount: 500, count: 1 },
    ]);

    await aiCoachScheduledChecksHandler();

    // Should not create notification (32% through period, 50% budget - no conditions met)
    expect(mockNotificationDoc.set).not.toHaveBeenCalled();
  });

  it('should handle Gemini API error gracefully', async () => {
    mockAccountsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'user123',
          data: () => ({
            userId: 'user123',
            name: 'John Doe',
            currency: 'USD',
            aiChatEnabled: true,
          }),
        },
      ],
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    mockPeriodsRef.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'period123',
          data: () => ({
            name: 'January 2025',
            startAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01T00:00:00Z')),
            endAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-31T23:59:59Z')),
            targetSpend: 1000,
          }),
        },
      ],
    });

    mockNotificationsRef.get.mockResolvedValue({ empty: true, docs: [] });

    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([
      { date: new Date(), amount: 400, description: 'Various', category: 'essentials' },
    ]);

    (calculateCategoryBreakdown as jest.Mock).mockReturnValue([
      { category: 'essentials', amount: 400, count: 1 },
    ]);

    (buildNotificationPrompt as jest.Mock).mockReturnValue('Mock prompt');

    // Mock Gemini API to fail
    mockGenerateContent.mockRejectedValue(new Error('Gemini API error'));

    // Should not throw, but log error
    await expect(aiCoachScheduledChecksHandler()).resolves.not.toThrow();

    // Should not create notification
    expect(mockNotificationDoc.set).not.toHaveBeenCalled();
  });

  it('should handle when no accounts have AI Chat enabled', async () => {
    mockAccountsRef.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    await expect(aiCoachScheduledChecksHandler()).resolves.not.toThrow();

    expect(mockNotificationDoc.set).not.toHaveBeenCalled();
  });
});
