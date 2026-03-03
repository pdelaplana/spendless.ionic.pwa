# Design: AI Financial Coach UI (Phase 4)

Date: 2026-03-02
Track: ai_financial_coach_20260302

## Overview

Three UI pieces: a session list page, a chat interface page, and a reusable context banner component. All approved by user.

## Trial Access Model

- **Everyone** can access the Financial Coach (no hard gate).
- Free users see a trial counter ("3 free messages remaining").
- When counter reaches 0, a soft upgrade prompt appears above the input — they can still read previous sessions but cannot send new messages.
- Premium users see no trial UI at all.

## Component 1: `FinancialCoachPage`

**Path:** `src/pages/spending/FinancialCoachPage.tsx`

**Layout:** `BasePageLayout` with "New" button in the header end slot.

**Structure:**
- Trial banner (free users only, driven by `useCoachTrialStatus`)
- List of coach sessions, newest-first, each as a `GlassCard`
- Each card shows: session title + date + message count
- Swipe-to-archive via `IonItemSliding`
- `EmptyState` when no sessions exist
- `LoadingState` during fetch

**Data:** `useFetchCoachSessions(accountId)`, `useCreateCoachSession()`, `useArchiveCoachSession()`

## Component 2: `CoachChatPage`

**Path:** `src/pages/spending/CoachChatPage.tsx`

**Layout:** `BasePageLayout` with back button, session title in header.

**Structure (top to bottom):**
1. `SpendingContextBanner` — context toggle, just below header
2. Scrollable message list (real-time via `useCoachSessionMessages`)
3. User bubbles: right-aligned, brand purple bg, white text
4. AI bubbles: left-aligned, `GlassCard` style, dark text
5. Error messages: red tint with helper text
6. Typing indicator (3 animated dots) shown while `useSendCoachMessage` is pending
7. Trial counter above input (shown when ≤2 messages remaining, free users only)
8. Sticky footer: text input + Send button (disabled while pending)

**Behaviour:**
- Auto-scrolls to bottom on new messages via `useEffect` + `IonContent` `scrollToBottom`
- Send button disabled while AI is responding
- `buildSystemPrompt` called with current `includeContext` state and last 30 spends from `useFetchSpends`

**Data:** `useCoachSessionMessages`, `useSendCoachMessage`, `useCoachTrialStatus`, `useFetchSpends` (existing hook), `buildSystemPrompt`

## Component 3: `SpendingContextBanner`

**Path:** `src/pages/spending/components/coach/SpendingContextBanner.tsx`

**Props:**
```ts
interface SpendingContextBannerProps {
  includeContext: boolean;
  onToggle: (value: boolean) => void;
}
```

**Appearance:**
- Thin horizontal banner
- Left: 📊 icon + label ("Share spending context") + subtitle (on: "Coach can see your recent transactions" / off: "Coach will answer generally")
- Right: `IonToggle`

## Styling Approach

Inline styled-components per file (matching `AiInsightsListPage` pattern). Uses:
- `GlassCard` from `@theme/components`
- `designSystem` tokens for colours, spacing, border-radius
- Brand purple (`designSystem.colors.brand.primary`) for user bubbles
- Gray/glass for AI bubbles

## Data Flow

```
CoachChatPage
  ├── includeContext (useState)
  ├── SpendingContextBanner (read/write includeContext)
  ├── useFetchSpends → spends (for system prompt)
  ├── buildSystemPrompt(includeContext, spends, currency)
  ├── useCoachSessionMessages → messages (real-time)
  ├── useSendCoachMessage → mutate({ ..., systemPrompt, history })
  └── useCoachTrialStatus → messagesRemaining, hasTrialExpired
```
