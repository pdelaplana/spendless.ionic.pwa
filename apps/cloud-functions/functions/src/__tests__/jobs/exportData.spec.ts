import * as fs from 'node:fs';

import * as admin from 'firebase-admin';
import { sendEmailNotification } from '../../helpers/sendEmail';
import { exportData } from '../../jobs/exportData';

// Mock firebase-admin and other dependencies
jest.mock('firebase-admin', () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  const bucket = {
    upload: jest.fn().mockResolvedValue([]),
    file: jest.fn().mockReturnThis(),
    getSignedUrl: jest.fn().mockResolvedValue(['https://download-url.com']),
  };

  return {
    firestore: jest.fn(() => firestore),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue(bucket),
    }),
  };
});

jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.mock('../../helpers/sendEmail', () => ({
  sendEmailNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('@sentry/node', () => ({
  startSpan: jest.fn().mockImplementation((_, fn) => fn()),
  captureException: jest.fn(),
}));

jest.mock('firebase-functions/params', () => ({
  storageBucket: {
    value: jest.fn().mockReturnValue('test-bucket'),
  },
}));

describe('exportData job', () => {
  const mockAccountRef = {
    collection: jest.fn(),
    get: jest.fn(),
  };

  const mockPeriodsSnapshot = {
    docs: [
      {
        id: 'period1',
        data: () => ({
          name: 'Test Period',
          goals: 1000,
          targetSpend: 800,
          targetSavings: 200,
          startAt: { toDate: () => new Date('2025-01-01') },
          endAt: { toDate: () => new Date('2025-01-31') },
          closedAt: { toDate: () => new Date('2025-02-01') },
          createdAt: { toDate: () => new Date('2024-12-31') },
          updatedAt: { toDate: () => new Date('2025-01-31') },
        }),
      },
    ],
  };

  const mockSpendingSnapshot = {
    docs: [
      {
        id: 'spending1',
        data: () => ({
          amount: 50,
          date: { toDate: () => new Date('2025-01-15') },
          description: 'Groceries',
          category: 'Food',
          notes: 'Weekly shopping',
          recurring: false,
          createdAt: { toDate: () => new Date('2025-01-15') },
          updatedAt: { toDate: () => new Date('2025-01-15') },
          periodId: 'period1',
        }),
      },
    ],
  };

  const mockAccountSnapshot = {
    data: () => ({
      id: 'user1',
      name: 'Test User',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      createdAt: { toDate: () => new Date('2024-01-01') },
      updatedAt: { toDate: () => new Date('2025-01-01') },
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock firestore responses
    (admin.firestore().collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue(mockAccountRef),
    });

    mockAccountRef.get.mockResolvedValue(mockAccountSnapshot);

    mockAccountRef.collection.mockImplementation((collectionName) => {
      if (collectionName === 'periods') {
        return { get: jest.fn().mockResolvedValue(mockPeriodsSnapshot) };
        // biome-ignore lint/style/noUselessElse: <explanation>
      } else if (collectionName === 'spending') {
        return { get: jest.fn().mockResolvedValue(mockSpendingSnapshot) };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [] }) };
    });
  });

  it('should successfully export data', async () => {
    // Call the function
    const result = await exportData({ userId: 'user1', userEmail: 'user@example.com' });

    // Verify admin.firestore was called correctly
    expect(admin.firestore().collection).toHaveBeenCalledWith('accounts');
    expect(admin.firestore().collection('account').doc).toHaveBeenCalledWith('user1');

    // Verify Firestore queries
    expect(mockAccountRef.collection).toHaveBeenCalledWith('periods');
    expect(mockAccountRef.collection).toHaveBeenCalledWith('spending');

    // Verify file operations
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalled();

    // Verify storage operations
    expect(admin.storage().bucket).toHaveBeenCalled();
    expect(admin.storage().bucket().upload).toHaveBeenCalled();
    expect(admin.storage().bucket().file('test').getSignedUrl).toHaveBeenCalled();

    // Verify email sent
    expect(sendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Your data export is ready',
      }),
    );

    // Verify successful result
    expect(result).toEqual({
      success: true,
      message: 'user@example.com data exported successfully.',
      downloadUrl: 'https://download-url.com',
    });
  });

  it('should handle missing userId', async () => {
    await expect(exportData({ userId: '', userEmail: 'user@example.com' })).rejects.toThrow(
      'User ID is required.',
    );
  });

  it('should handle no spending data', async () => {
    // Mock empty spending collection
    mockAccountRef.collection.mockImplementation((collectionName) => {
      if (collectionName === 'periods') {
        return { get: jest.fn().mockResolvedValue({ docs: [] }) };
        // biome-ignore lint/style/noUselessElse: <explanation>
      } else if (collectionName === 'spending') {
        return { get: jest.fn().mockResolvedValue({ docs: [] }) };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [] }) };
    });

    // Call the function
    const result = await exportData({ userId: 'user1', userEmail: 'user@example.com' });

    // Should fail with appropriate message
    expect(result).toEqual({
      success: false,
      message: expect.stringContaining('No data found'),
    });
  });

  it('should handle errors during execution', async () => {
    // Force an error
    (admin.firestore().collection as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    // Call the function
    const result = await exportData({ userId: 'user1', userEmail: 'user@example.com' });

    // Should return failure
    expect(result).toEqual({
      success: false,
      message: expect.stringContaining('Test error'),
    });
  });
});
