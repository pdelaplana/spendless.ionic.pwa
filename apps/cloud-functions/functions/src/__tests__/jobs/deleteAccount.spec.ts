import * as admin from 'firebase-admin';
import { sendEmailNotification } from '../../helpers/sendEmail';
import { deleteAccount } from '../../jobs/deleteAccount';

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),

    get: jest.fn(),
    delete: jest.fn().mockResolvedValue({}),
  };

  const mockBucket = {
    deleteFiles: jest.fn().mockResolvedValue([]),
  };

  return {
    firestore: jest.fn(() => firestore),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue(mockBucket),
    }),
    auth: jest.fn().mockReturnValue({
      deleteUser: jest.fn().mockResolvedValue({}),
    }),
  };
});

// Mock firebase-functions params
jest.mock('firebase-functions', () => ({
  params: {
    storageBucket: {
      value: jest.fn().mockReturnValue('test-bucket'),
    },
  },
}));

// Mock email sending
jest.mock('../../helpers/sendEmail', () => ({
  sendEmailNotification: jest.fn().mockResolvedValue({}),
}));

// Mock Sentry
jest.mock('@sentry/node', () => ({
  startSpan: jest.fn().mockImplementation((_, fn) => fn()),
  captureException: jest.fn(),
}));

describe('deleteAccount job', () => {
  const mockAccountDocRef = {
    get: jest.fn(),
    delete: jest.fn().mockResolvedValue({}),
    collection: jest.fn(),
  };

  const mockAccountSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue({
      id: 'user1',
      name: 'Test User',
    }),
  };

  const mockPeriodsCollection = {
    get: jest.fn(),
  };

  const mockSpendingCollection = {
    get: jest.fn(),
  };

  const mockPeriodsSnapshot = {
    docs: [
      {
        ref: {
          delete: jest.fn().mockResolvedValue({}),
          collection: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              docs: [
                { ref: { delete: jest.fn().mockResolvedValue({}) } },
                { ref: { delete: jest.fn().mockResolvedValue({}) } },
              ],
            }),
          }),
        },
        id: 'period1',
      },
      {
        ref: {
          delete: jest.fn().mockResolvedValue({}),
          collection: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              docs: [{ ref: { delete: jest.fn().mockResolvedValue({}) } }],
            }),
          }),
        },
        id: 'period2',
      },
    ],
  };

  const mockSpendingSnapshot = {
    docs: [
      {
        ref: {
          delete: jest.fn().mockResolvedValue({}),
        },
        id: 'spending1',
      },
      {
        ref: {
          delete: jest.fn().mockResolvedValue({}),
        },
        id: 'spending2',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Firestore responses
    (admin.firestore().collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue(mockAccountDocRef),
    });

    mockAccountDocRef.get.mockResolvedValue(mockAccountSnapshot);

    // Setup collection mocks
    mockAccountDocRef.collection.mockImplementation((collectionName) => {
      if (collectionName === 'periods') {
        return mockPeriodsCollection;
        // biome-ignore lint/style/noUselessElse: <explanation>
      } else if (collectionName === 'spending') {
        return mockSpendingCollection;
      }
      return {
        get: jest.fn().mockResolvedValue({ docs: [] }),
      };
    });

    mockPeriodsCollection.get.mockResolvedValue(mockPeriodsSnapshot);
    mockSpendingCollection.get.mockResolvedValue(mockSpendingSnapshot);
  });

  it('should successfully delete account and all associated data', async () => {
    // Call the function
    const result = await deleteAccount({ userId: 'user1', userEmail: 'user@example.com' });

    // Verify account lookup
    expect(admin.firestore().collection).toHaveBeenCalledWith('accounts');
    expect(admin.firestore().collection('accounts').doc).toHaveBeenCalledWith('user1');

    // Verify subcollections were queried
    expect(mockAccountDocRef.collection).toHaveBeenCalledWith('periods');
    expect(mockAccountDocRef.collection).toHaveBeenCalledWith('spending');

    // Verify wallet subcollections were accessed
    expect(mockPeriodsSnapshot.docs[0].ref.collection).toHaveBeenCalledWith('wallets');
    expect(mockPeriodsSnapshot.docs[1].ref.collection).toHaveBeenCalledWith('wallets');

    // Verify document deletion operations
    expect(mockPeriodsSnapshot.docs[0].ref.delete).toHaveBeenCalled();
    expect(mockPeriodsSnapshot.docs[1].ref.delete).toHaveBeenCalled();
    expect(mockSpendingSnapshot.docs[0].ref.delete).toHaveBeenCalled();
    expect(mockSpendingSnapshot.docs[1].ref.delete).toHaveBeenCalled();
    expect(mockAccountDocRef.delete).toHaveBeenCalled();

    // Verify authentication deletion
    expect(admin.auth().deleteUser).toHaveBeenCalledWith('user1');

    // Verify storage cleanup
    expect(admin.storage().bucket).toHaveBeenCalled();
    expect(admin.storage().bucket().deleteFiles).toHaveBeenCalledWith({
      prefix: 'users/user1/',
    });

    // Verify email sent
    expect(sendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Your account has been deleted',
      }),
    );

    // Verify successful result
    expect(result).toEqual({
      success: true,
      message: 'Account for user@example.com deleted successfully.',
      accountId: 'user1',
    });
  });

  it('should handle missing userId', async () => {
    await expect(deleteAccount({ userId: '', userEmail: 'user@example.com' })).rejects.toThrow(
      'User ID is required.',
    );
  });

  it('should handle non-existent account', async () => {
    // Setup mock to return a non-existent account
    mockAccountDocRef.get.mockResolvedValue({
      exists: false,
    });

    // Call the function
    const result = await deleteAccount({ userId: 'nonexistent', userEmail: 'user@example.com' });

    // Should fail with appropriate message
    expect(result).toEqual({
      success: false,
      message: expect.stringContaining('Account with ID nonexistent not found'),
    });
  });

  it('should handle storage errors gracefully', async () => {
    // Force a storage error but let the rest proceed
    (admin.storage().bucket().deleteFiles as jest.Mock).mockRejectedValue(
      new Error('Storage error'),
    );

    // Ensure all other mocks are properly set up for this test
    mockAccountDocRef.get.mockResolvedValue(mockAccountSnapshot);
    mockPeriodsCollection.get.mockResolvedValue(mockPeriodsSnapshot);
    mockSpendingCollection.get.mockResolvedValue(mockSpendingSnapshot);

    // Call the function
    const result = await deleteAccount({ userId: 'user1', userEmail: 'user@example.com' });

    // Should still succeed despite storage error
    expect(result.success).toBe(true);
  });

  it('should handle errors during execution', async () => {
    // Force an error in the main process
    (admin.firestore().collection as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    // Call the function
    const result = await deleteAccount({ userId: 'user1', userEmail: 'user@example.com' });

    // Should return failure
    expect(result).toEqual({
      success: false,
      message: expect.stringContaining('Test error'),
    });
  });
});
