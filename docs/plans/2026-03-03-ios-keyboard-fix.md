# iOS Keyboard Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent the on-screen keyboard from hiding the chat input on iOS Safari PWA in `CoachChatPage`.

**Architecture:** Add a `useVisualViewport` hook that listens to `window.visualViewport` resize/scroll events and returns the pixel height obscured by the keyboard. Apply that value as `paddingBottom` on `ChatContainer` in `CoachChatPage`, and re-trigger scroll-to-bottom when the keyboard opens.

**Tech Stack:** React hooks, `window.visualViewport` Web API, Vitest + `@testing-library/react` for tests.

---

### Task 1: Create `useVisualViewport` hook

**Files:**
- Create: `src/hooks/ui/useVisualViewport.ts`
- Create: `src/hooks/ui/useVisualViewport.test.ts`

---

**Step 1: Write the failing test**

Create `src/hooks/ui/useVisualViewport.test.ts`:

```ts
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
```

**Step 2: Run test to verify it fails**

```bash
npm run test.unit -- useVisualViewport
```

Expected: FAIL with "cannot find module './useVisualViewport'"

---

**Step 3: Write the hook**

Create `src/hooks/ui/useVisualViewport.ts`:

```ts
import { useEffect, useState } from 'react';

interface UseVisualViewportReturn {
  keyboardOffset: number;
}

export function useVisualViewport(): UseVisualViewportReturn {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const offset = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  return { keyboardOffset };
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test.unit -- useVisualViewport
```

Expected: all 3 tests PASS

**Step 5: Commit**

```bash
git add src/hooks/ui/useVisualViewport.ts src/hooks/ui/useVisualViewport.test.ts
git commit -m "feat(ui): add useVisualViewport hook for iOS keyboard offset"
```

---

### Task 2: Export hook and update CoachChatPage

**Files:**
- Modify: `src/hooks/ui/index.ts`
- Modify: `src/pages/spending/CoachChatPage.tsx`

---

**Step 1: Export the hook from the ui index**

In `src/hooks/ui/index.ts`, add the export:

```ts
export * from './useAppNotifications';
export * from './usePrompt';
export * from './useFormatters';
export * from './useInfiniteScrollList';
export * from './useVisualViewport';   // add this line
```

**Step 2: Update `CoachChatPage`**

In `src/pages/spending/CoachChatPage.tsx`:

1. Import the hook (add to existing import from `react`):

```ts
import { useVisualViewport } from '@/hooks/ui';
```

2. Call the hook inside `CoachChatPage` (add after the existing hook calls, around line 210):

```ts
const { keyboardOffset } = useVisualViewport();
```

3. Add `keyboardOffset` to the scroll-to-bottom `useEffect` dependency array (currently around line 230):

```ts
// biome-ignore lint/correctness/useExhaustiveDependencies: scroll when message list, typing indicator, or keyboard changes
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, isPending, keyboardOffset]);
```

4. Apply `keyboardOffset` as `paddingBottom` on `ChatContainer` (around line 274):

```tsx
<ChatContainer style={{ paddingBottom: keyboardOffset }}>
```

**Step 3: Run the unit tests to confirm nothing is broken**

```bash
npm run test.unit
```

Expected: all tests PASS

**Step 4: Run lint check**

```bash
npm run lint
```

Expected: no errors

**Step 5: Commit**

```bash
git add src/hooks/ui/index.ts src/pages/spending/CoachChatPage.tsx
git commit -m "fix(coach): keep input visible above iOS keyboard using visualViewport"
```

---

### Task 3: Manual verification on iOS Safari

Since automated tests can't simulate the iOS keyboard, verify manually:

1. Start the dev server: `npm run dev`
2. Open the app on an iOS device or Safari with DevTools responsive mode
3. Navigate to Financial Coach → open a session → tap the message input
4. Confirm the input stays visible above the keyboard
5. Confirm messages auto-scroll so the latest is visible when keyboard opens
6. Confirm layout snaps back correctly when keyboard is dismissed
