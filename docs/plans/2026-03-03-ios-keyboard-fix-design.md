# iOS Keyboard Fix — CoachChatPage Design

**Date:** 2026-03-03
**Branch:** fix/ai-model

## Problem

On iOS Safari PWA, the on-screen keyboard overlays the viewport without resizing it. `dvh` units and Ionic's scroll assist are unaware of the keyboard, so the `InputArea` in `CoachChatPage` is hidden behind the keyboard when the user taps the textarea.

## Solution

Use the `window.visualViewport` API, which **does** shrink on iOS Safari when the keyboard opens. The difference between `window.innerHeight` and `visualViewport.height + visualViewport.offsetTop` gives the exact keyboard height. Apply this as `paddingBottom` on `ChatContainer` to push the input above the keyboard.

## Components

### `useVisualViewport` hook

**Location:** `src/hooks/ui/useVisualViewport.ts`

- Listens to `visualViewport` `resize` and `scroll` events
- Returns `keyboardOffset: number` — pixels obscured by keyboard (0 when closed)
- Formula: `window.innerHeight - viewport.height - viewport.offsetTop`
- Falls back to `0` if `visualViewport` is not supported

### `CoachChatPage` changes

- Import and call `useVisualViewport()`
- Apply `keyboardOffset` as inline `paddingBottom` on `ChatContainer`
- Add `keyboardOffset` to the `useEffect` dependency array for auto-scroll-to-bottom so the view scrolls when the keyboard opens

## Behaviour

| State | `keyboardOffset` | Effect |
|---|---|---|
| Keyboard closed | `0` | Layout unchanged |
| Keyboard open | ~300px (keyboard height) | Input pushed above keyboard |
| Keyboard dismissed | `0` | Layout snaps back |

## Out of Scope

- Android Chrome (viewport resizes natively — no fix needed)
- `IonFooter` refactor (not required for this fix)
- Capacitor Keyboard plugin (PWA only)
