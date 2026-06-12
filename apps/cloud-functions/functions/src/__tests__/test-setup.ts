import functionsTest from 'firebase-functions-test';

// Initialize firebase-functions-test
const test = functionsTest();

// Export for use in tests
export { test };

// Mock Admin SDK initialization to avoid credential errors
jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    credential: {
      applicationDefault: jest.fn(),
    },
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn(),
      settings: jest.fn(),
    }),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn(),
    }),
    auth: jest.fn().mockReturnValue({
      verifyIdToken: jest.fn(),
    }),
  };
});

// Clean up function to run after tests
export const cleanup = async () => {
  test.cleanup();
};
