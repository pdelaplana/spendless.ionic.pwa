// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { vi } from 'vitest';

// Mock matchmedia
window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  }));

// Mock Firebase Analytics to prevent IndexedDB errors in tests
vi.mock('@firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  isSupported: vi.fn().mockResolvedValue(true),
  logEvent: vi.fn(),
  setUserId: vi.fn(),
  setUserProperties: vi.fn(),
  setCurrentScreen: vi.fn(),
  setAnalyticsCollectionEnabled: vi.fn(),
}));

// Mock React DOM's createPortal for component tests that use portals
vi.mock('react-dom', async () => {
  const actual = (await vi.importActual('react-dom')) as object;
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});
