import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVisualViewport } from './useVisualViewport';

describe('useVisualViewport', () => {
  const originalInnerHeight = window.innerHeight;

  function mockViewport(height: number, offsetTop = 0) {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height,
        offsetTop,
        addEventListener: vi.fn((event, handler) => {
          (window as any).__vpHandlers = (window as any).__vpHandlers ?? {};
          (window as any).__vpHandlers[event] = handler;
        }),
        removeEventListener: vi.fn(),
      },
    });
  }

  function fireViewportEvent(event: string) {
    (window as any).__vpHandlers?.[event]?.();
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
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: { ...window.visualViewport, height: 500, offsetTop: 0 },
      });
      fireViewportEvent('resize');
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
