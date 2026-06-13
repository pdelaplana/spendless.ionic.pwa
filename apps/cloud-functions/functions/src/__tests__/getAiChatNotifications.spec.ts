import * as admin from 'firebase-admin';
import functionsTest from 'firebase-functions-test';

// Initialize firebase-functions-test
const test = functionsTest();

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const mockTimestamp = {
    seconds: 1234567890,
    toDate: () => new Date('2025-01-15T10:00:00Z'),
  };

  const firestoreObj = {
    collection: jest.fn(),
    Timestamp: {
      now: jest.fn().mockReturnValue(mockTimestamp),
    },
  };

  return {
    firestore: Object.assign(jest.fn().mockReturnValue(firestoreObj), {
      Timestamp: {
        now: jest.fn().mockReturnValue(mockTimestamp),
      },
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

// Import after mocks
import { getAiChatNotifications } from '../getAiChatNotifications';
import type { GetAiChatNotificationsRequest } from '../types';

describe('getAiChatNotifications', () => {
  const mockBatch = {
    update: jest.fn(),
    commit: jest.fn(),
  };

  const mockNotificationsRef = {
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  const mockCollection = jest.fn().mockReturnValue({
    doc: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue(mockNotificationsRef),
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (admin.firestore as unknown as jest.Mock).mockReturnValue({
      collection: mockCollection,
      batch: () => mockBatch,
    });
    mockBatch.commit.mockResolvedValue(undefined);
  });

  afterAll(() => {
    test.cleanup();
  });

  it('should retrieve and mark notifications as read successfully', async () => {
    const mockNotifications = [
      {
        id: 'notif1',
        ref: { id: 'notif1' },
        data: () => ({
          userId: 'user123',
          accountId: 'user123',
          periodId: 'period123',
          periodName: 'January 2025',
          content: 'Hey! You are halfway through your period.',
          checkInType: 'milestone',
          createdAt: admin.firestore.Timestamp.now(),
          isRead: false,
          tokensUsed: 100,
          aiModel: 'gemini-2.5-flash',
        }),
      },
      {
        id: 'notif2',
        ref: { id: 'notif2' },
        data: () => ({
          userId: 'user123',
          accountId: 'user123',
          periodId: 'period123',
          periodName: 'January 2025',
          content: 'Heads up! You have used 80% of your budget.',
          checkInType: 'budget-warning',
          createdAt: admin.firestore.Timestamp.now(),
          isRead: true,
          readAt: admin.firestore.Timestamp.now(),
          tokensUsed: 120,
          aiModel: 'gemini-2.5-flash',
        }),
      },
    ];

    mockNotificationsRef.get.mockResolvedValue({
      empty: false,
      docs: mockNotifications,
    });

    const request = {
      auth: { uid: 'user123' },
      data: { limit: 10 } as GetAiChatNotificationsRequest,
    };

    const wrapped = test.wrap(getAiChatNotifications);
    const result = await wrapped(request as any);

    // Verify result
    expect(result.notifications).toHaveLength(2);
    expect(result.notifications[0].id).toBe('notif1');
    expect(result.notifications[0].content).toBe('Hey! You are halfway through your period.');
    expect(result.notifications[0].isRead).toBe(false);
    expect(result.notifications[1].isRead).toBe(true);

    // Verify batch update was called only for unread notification
    expect(mockBatch.update).toHaveBeenCalledTimes(1);
    expect(mockBatch.update).toHaveBeenCalledWith(
      { id: 'notif1' },
      {
        isRead: true,
        readAt: expect.any(Object),
      },
    );

    // Verify batch was committed
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it('should return empty array when no notifications found', async () => {
    mockNotificationsRef.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const request = {
      auth: { uid: 'user123' },
      data: {} as GetAiChatNotificationsRequest,
    };

    const wrapped = test.wrap(getAiChatNotifications);
    const result = await wrapped(request as any);

    expect(result.notifications).toEqual([]);
    expect(mockBatch.update).not.toHaveBeenCalled();
    expect(mockBatch.commit).not.toHaveBeenCalled();
  });

  it('should throw error when user is not authenticated', async () => {
    const request = {
      auth: null,
      data: {},
    };

    const wrapped = test.wrap(getAiChatNotifications);
    await expect(wrapped(request as any)).rejects.toThrow('User must be authenticated');
  });

  it('should throw error when user ID is missing', async () => {
    const request = {
      auth: { uid: undefined },
      data: {},
    };

    const wrapped = test.wrap(getAiChatNotifications);
    await expect(wrapped(request as any)).rejects.toThrow('User ID is required');
  });

  it('should throw error when limit exceeds 100', async () => {
    const request = {
      auth: { uid: 'user123' },
      data: { limit: 150 } as GetAiChatNotificationsRequest,
    };

    const wrapped = test.wrap(getAiChatNotifications);
    await expect(wrapped(request as any)).rejects.toThrow('Limit cannot exceed 100');
  });

  it('should use default limit of 50 when not provided', async () => {
    mockNotificationsRef.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const request = {
      auth: { uid: 'user123' },
      data: {} as GetAiChatNotificationsRequest,
    };

    const wrapped = test.wrap(getAiChatNotifications);
    await wrapped(request as any);

    // Verify limit was called with default value
    expect(mockNotificationsRef.limit).toHaveBeenCalledWith(50);
  });

  it('should handle batch commit error gracefully', async () => {
    const mockNotifications = [
      {
        id: 'notif1',
        ref: { id: 'notif1' },
        data: () => ({
          userId: 'user123',
          accountId: 'user123',
          periodId: 'period123',
          periodName: 'January 2025',
          content: 'Test notification',
          checkInType: 'milestone',
          createdAt: admin.firestore.Timestamp.now(),
          isRead: false,
          tokensUsed: 100,
          aiModel: 'gemini-2.5-flash',
        }),
      },
    ];

    mockNotificationsRef.get.mockResolvedValue({
      empty: false,
      docs: mockNotifications,
    });

    // Mock batch commit to fail
    const batchError = new Error('Firestore batch commit failed');
    mockBatch.commit.mockRejectedValue(batchError);

    const request = {
      auth: { uid: 'user123' },
      data: {} as GetAiChatNotificationsRequest,
    };

    // Function should not throw, just log error
    const wrapped = test.wrap(getAiChatNotifications);
    const result = await wrapped(request as any);

    // Should still return notifications even if marking as read failed
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].id).toBe('notif1');
  });

  it('should correctly order notifications by createdAt desc', async () => {
    mockNotificationsRef.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const request = {
      auth: { uid: 'user123' },
      data: {} as GetAiChatNotificationsRequest,
    };

    const wrapped = test.wrap(getAiChatNotifications);
    await wrapped(request as any);

    // Verify orderBy was called with correct parameters
    expect(mockNotificationsRef.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('should preserve all notification fields', async () => {
    const mockCreatedAt = {
      seconds: 1234567890,
      toDate: () => new Date('2025-01-15T10:00:00Z'),
    };
    const mockReadAt = {
      seconds: 1234567890,
      toDate: () => new Date('2025-01-15T10:00:00Z'),
    };

    const mockNotifications = [
      {
        id: 'notif1',
        ref: { id: 'notif1' },
        data: () => ({
          userId: 'user123',
          accountId: 'user123',
          periodId: 'period123',
          periodName: 'January 2025',
          content: 'Test notification content',
          checkInType: 'period-ending',
          createdAt: mockCreatedAt,
          readAt: mockReadAt,
          isRead: true,
          tokensUsed: 250,
          aiModel: 'gemini-2.5-flash',
        }),
      },
    ];

    mockNotificationsRef.get.mockResolvedValue({
      empty: false,
      docs: mockNotifications,
    });

    const request = {
      auth: { uid: 'user123' },
      data: {} as GetAiChatNotificationsRequest,
    };

    const wrapped = test.wrap(getAiChatNotifications);
    const result = await wrapped(request as any);

    // Verify all fields are preserved
    expect(result.notifications[0]).toEqual({
      id: 'notif1',
      userId: 'user123',
      accountId: 'user123',
      periodId: 'period123',
      periodName: 'January 2025',
      content: 'Test notification content',
      checkInType: 'period-ending',
      createdAt: mockCreatedAt,
      readAt: mockReadAt,
      isRead: true,
      tokensUsed: 250,
      aiModel: 'gemini-2.5-flash',
    });
  });
});
