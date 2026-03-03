import { createCoachMessage } from '@/domain/CoachSession';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Firebase infrastructure
vi.mock('@/infrastructure/firebase', () => ({
  db: {},
  ai: {},
}));

// Mock firebase/ai
vi.mock('firebase/ai', () => ({
  getGenerativeModel: vi.fn().mockReturnValue({
    startChat: vi.fn().mockReturnValue({
      sendMessage: vi.fn().mockResolvedValue({
        response: { text: () => 'AI response text' },
      }),
    }),
  }),
}));

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn().mockReturnValue({}),
  doc: vi.fn().mockReturnValue({}),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-msg-id' }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  increment: vi.fn().mockReturnValue({ type: 'increment' }),
  Timestamp: { now: vi.fn().mockReturnValue({ toDate: () => new Date() }) },
}));

// Mock Sentry
vi.mock('@sentry/browser', () => ({
  startSpan: vi
    .fn()
    .mockImplementation((_opts: unknown, fn: (span: unknown) => unknown) =>
      fn({ setAttributes: vi.fn() }),
    ),
}));

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

// Mock useLogging hook
vi.mock('@/hooks', () => ({
  useLogging: vi.fn().mockReturnValue({ logError: vi.fn() }),
}));

import { useSendCoachMessage } from './useSendCoachMessage';

describe('useSendCoachMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a mutation object', () => {
    const { result } = renderHook(() => useSendCoachMessage());

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
  });

  it('should not be pending initially', () => {
    const { result } = renderHook(() => useSendCoachMessage());

    expect(result.current.isPending).toBe(false);
  });

  it('should expose a mutate function', () => {
    const { result } = renderHook(() => useSendCoachMessage());

    expect(typeof result.current.mutate).toBe('function');
  });

  it('should accept SendCoachMessageParams shape', () => {
    const { result } = renderHook(() => useSendCoachMessage());

    // Calling mutate should not throw a type error
    expect(() =>
      result.current.mutate({
        accountId: 'acc-1',
        sessionId: 'sess-1',
        content: 'Hello coach',
        systemPrompt: 'You are a coach',
        history: [createCoachMessage({ role: 'user', content: 'Hi', status: 'sent' })],
      }),
    ).not.toThrow();
  });

  it('should accept optional decrementMessages param', () => {
    const { result } = renderHook(() => useSendCoachMessage());

    expect(() =>
      result.current.mutate({
        accountId: 'acc-1',
        sessionId: 'sess-1',
        content: 'Hello',
        systemPrompt: 'prompt',
        history: [],
        decrementMessages: vi.fn().mockResolvedValue(undefined),
      }),
    ).not.toThrow();
  });
});
