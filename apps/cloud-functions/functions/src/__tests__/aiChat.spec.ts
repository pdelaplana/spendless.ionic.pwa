/// <reference types="jest" />
import * as admin from 'firebase-admin';
import functionsTest from 'firebase-functions-test';

// Initialize firebase-functions-test
const test = functionsTest();

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  return {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn(),
    }),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn(),
    }),
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
  getCurrentActivePeriod: jest.fn(),
  getSpendingDataForPeriod: jest.fn(),
  calculateCategoryBreakdown: jest.fn(),
  calculateTagAnalysis: jest.fn(),
  selectContextForMessage: jest.fn(),
}));

jest.mock('../helpers/aiChatPrompt', () => ({
  buildAiChatPrompt: jest.fn(),
}));

jest.mock('../helpers/rateLimit', () => ({
  checkRateLimit: jest.fn(),
}));

// Import after mocks
import { aiChat } from '../aiChat';
import {
  calculateCategoryBreakdown,
  getCurrentActivePeriod,
  getSpendingDataForPeriod,
  selectContextForMessage,
} from '../helpers/aiChatContext';
import { buildAiChatPrompt } from '../helpers/aiChatPrompt';
import { checkRateLimit } from '../helpers/rateLimit';
import { hasActiveSubscription } from '../stripe/helpers';
import type { AiChatRequest } from '../types';

describe('aiChat', () => {
  const mockAccountRef = {
    get: jest.fn(),
  };

  const mockCollection = jest.fn().mockReturnValue({
    doc: jest.fn().mockReturnValue(mockAccountRef),
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
  });

  afterAll(() => {
    test.cleanup();
  });

  it('should return AI response successfully', async () => {
    // Setup mocks
    const mockAccount = {
      userId: 'user123',
      name: 'John Doe',
      currency: 'USD',
      aiChatEnabled: true,
    };

    mockAccountRef.get.mockResolvedValue({
      exists: true,
      data: () => mockAccount,
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);
    (checkRateLimit as jest.Mock).mockResolvedValue(undefined);

    (getCurrentActivePeriod as jest.Mock).mockResolvedValue({
      periodId: 'period123',
      periodData: {
        name: 'January 2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        targetSpend: 1000,
        targetSavings: 500,
        goals: 'Save for vacation',
      },
    });

    (selectContextForMessage as jest.Mock).mockReturnValue({
      includeRecentSpending: true,
      includeCategoryBreakdown: true,
      includeTagAnalysis: false,
      spendingLimit: 50,
    });

    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([
      {
        date: new Date('2025-01-15'),
        amount: 50,
        description: 'Coffee',
        category: 'rewards',
        tags: ['coffee'],
        recurring: false,
      },
    ]);

    (calculateCategoryBreakdown as jest.Mock).mockReturnValue([
      { category: 'rewards', amount: 50, count: 1 },
    ]);

    (buildAiChatPrompt as jest.Mock).mockReturnValue('Mock prompt');

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Hey John! You've spent $50 on coffee so far this month.",
        usageMetadata: { totalTokenCount: 150 },
      },
    });

    // Create request
    const request = {
      auth: { uid: 'user123', token: { email: 'john@example.com' } },
      data: {
        message: 'How much have I spent on coffee?',
        sessionHistory: [],
      } as AiChatRequest,
    };

    // Execute function
    const wrapped = test.wrap(aiChat);
    const result = await wrapped(request as any);

    // Assertions
    expect(result.response).toBe("Hey John! You've spent $50 on coffee so far this month.");
    expect(result.tokensUsed).toBe(150);
    expect(hasActiveSubscription).toHaveBeenCalledWith('user123');
    expect(checkRateLimit).toHaveBeenCalledWith('user123');
  });

  it('should throw error when user is not authenticated', async () => {
    const request = {
      auth: null,
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow('User must be authenticated');
  });

  it('should throw error when user ID is missing', async () => {
    const request = {
      auth: { uid: undefined },
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow('User ID is required');
  });

  it('should throw error when message is missing', async () => {
    const request = {
      auth: { uid: 'user123' },
      data: {},
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow('Message is required');
  });

  it('should throw error when message is too long', async () => {
    const request = {
      auth: { uid: 'user123' },
      data: { message: 'x'.repeat(1001) },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow(
      'Message must be 1000 characters or less',
    );
  });

  it('should throw error when account not found', async () => {
    mockAccountRef.get.mockResolvedValue({
      exists: false,
    });

    const request = {
      auth: { uid: 'user123' },
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow('Account not found');
  });

  it('should throw error when user is not premium', async () => {
    mockAccountRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ userId: 'user123', name: 'John Doe' }),
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(false);

    const request = {
      auth: { uid: 'user123' },
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow(
      'AI Chat is only available for premium subscribers',
    );
  });

  it('should throw error when AI Chat is not enabled', async () => {
    mockAccountRef.get.mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'user123',
        name: 'John Doe',
        aiChatEnabled: false,
      }),
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);

    const request = {
      auth: { uid: 'user123' },
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow(
      'AI Chat is not enabled for your account',
    );
  });

  it('should throw error when rate limit is exceeded', async () => {
    mockAccountRef.get.mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'user123',
        name: 'John Doe',
        aiChatEnabled: true,
      }),
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);
    (checkRateLimit as jest.Mock).mockRejectedValue(new Error('Rate limit exceeded'));

    const request = {
      auth: { uid: 'user123' },
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow('Rate limit exceeded');
  });

  it('should throw error when no active period found', async () => {
    mockAccountRef.get.mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'user123',
        name: 'John Doe',
        aiChatEnabled: true,
      }),
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);
    (checkRateLimit as jest.Mock).mockResolvedValue(undefined);
    (getCurrentActivePeriod as jest.Mock).mockResolvedValue(null);

    const request = {
      auth: { uid: 'user123' },
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow('No active spending period found');
  });

  it('should limit session history to last 10 messages', async () => {
    const mockAccount = {
      userId: 'user123',
      name: 'John Doe',
      aiChatEnabled: true,
    };

    mockAccountRef.get.mockResolvedValue({
      exists: true,
      data: () => mockAccount,
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);
    (checkRateLimit as jest.Mock).mockResolvedValue(undefined);

    (getCurrentActivePeriod as jest.Mock).mockResolvedValue({
      periodId: 'period123',
      periodData: {
        name: 'January 2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      },
    });

    (selectContextForMessage as jest.Mock).mockReturnValue({
      includeRecentSpending: false,
      includeCategoryBreakdown: false,
      includeTagAnalysis: false,
    });

    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([
      {
        date: new Date('2025-01-15'),
        amount: 50,
        description: 'Coffee',
        category: 'rewards',
        tags: [],
        recurring: false,
      },
    ]);
    (calculateCategoryBreakdown as jest.Mock).mockReturnValue([
      { category: 'rewards', amount: 50, count: 1 },
    ]);
    (buildAiChatPrompt as jest.Mock).mockReturnValue('Mock prompt');

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'Response',
        usageMetadata: { totalTokenCount: 100 },
      },
    });

    // Create 15 messages in history
    const sessionHistory = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
    }));

    const request = {
      auth: { uid: 'user123' },
      data: {
        message: 'Test message',
        sessionHistory,
      } as AiChatRequest,
    };

    const wrapped = test.wrap(aiChat);
    await wrapped(request as any);

    // Verify buildAiChatPrompt was called with limited history (last 10)
    expect(buildAiChatPrompt).toHaveBeenCalledWith(
      'Test message',
      'John',
      expect.any(Object),
      sessionHistory.slice(-10), // Should only include last 10
      undefined,
      expect.any(Array),
      undefined,
      undefined,
    );
  });

  it('should handle Gemini API error gracefully', async () => {
    mockAccountRef.get.mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'user123',
        name: 'John Doe',
        aiChatEnabled: true,
      }),
    });

    (hasActiveSubscription as jest.Mock).mockResolvedValue(true);
    (checkRateLimit as jest.Mock).mockResolvedValue(undefined);

    (getCurrentActivePeriod as jest.Mock).mockResolvedValue({
      periodId: 'period123',
      periodData: {
        name: 'January 2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      },
    });

    (selectContextForMessage as jest.Mock).mockReturnValue({
      includeRecentSpending: false,
      includeCategoryBreakdown: false,
      includeTagAnalysis: false,
    });

    (getSpendingDataForPeriod as jest.Mock).mockResolvedValue([]);
    (buildAiChatPrompt as jest.Mock).mockReturnValue('Mock prompt');

    mockGenerateContent.mockRejectedValue(new Error('Gemini API error'));

    const request = {
      auth: { uid: 'user123' },
      data: { message: 'Test message' },
    };

    const wrapped = test.wrap(aiChat);
    await expect(wrapped(request as any)).rejects.toThrow('Failed to generate AI response');
  });
});
