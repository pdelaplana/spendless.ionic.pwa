import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVisualViewport } from './useVisualViewport';

interface WindowWithVpHandlers extends Window {
  __vpHandlers?: Record<string, () => void>;
}
const win = window as WindowWithVpHandlers;

describe('useVisualViewport', () => {
  const originalInnerHeight = window.innerHeight;

  // Mutable viewport state so we can change height/offsetTop in place
  const viewportState = { height: 800, offsetTop: 0 };

  function mockViewport(height: number, offsetTop = 0) {
    viewportState.height = height;
    viewportState.offsetTop = offsetTop;
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        get height() {
          return viewportState.height;
        },
        get offsetTop() {
          return viewportState.offsetTop;
        },
        addEventListener: vi.fn((event, handler) => {
          win.__vpHandlers = win.__vpHandlers ?? {};
          win.__vpHandlers[event] = handler;
        }),
        removeEventListener: vi.fn(),
      },
    });
  }

  function fireViewportEvent(event: string) {
    win.__vpHandlers?.[event]?.();
  }

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
    // biome-ignore lint/performance/noDelete: test cleanup
    delete (window as any).visualViewport;
  });

  it('returns 0 when keyboard is not open', () => {
    mockViewport(800, 0);
    const { result } = renderHook(() => useVisualViewport());
    expect(result.current.keyboardOffset).toBe(0);
  });

  it('returns keyboard height when keyboard is open', () => {
    mockViewport(800, 0);
    const { result } = renderHook(() => useVisualViewport());

    act(() => {
      // Simulate keyboard opening: viewport shrinks by 300px
      viewportState.height = 500;
      viewportState.offsetTop = 0;
      fireViewportEvent('resize');
    });

    expect(result.current.keyboardOffset).toBe(300);
  });

  it('updates keyboardOffset on scroll event', () => {
    mockViewport(800, 0);
    const { result } = renderHook(() => useVisualViewport());

    act(() => {
      viewportState.height = 500;
      viewportState.offsetTop = 0;
      fireViewportEvent('scroll');
    });

    expect(result.current.keyboardOffset).toBe(300);
  });

  it('returns 0 if visualViewport is not supported', () => {
    // biome-ignore lint/performance/noDelete: test cleanup
    delete (window as any).visualViewport;
    const { result } = renderHook(() => useVisualViewport());
    expect(result.current.keyboardOffset).toBe(0);
  });
});
