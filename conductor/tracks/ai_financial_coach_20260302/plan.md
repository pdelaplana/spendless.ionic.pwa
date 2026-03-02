# Implementation Plan: AI Financial Coach (Track: ai_financial_coach_20260302)

## Phase 1: Infrastructure & Domain Setup
- [ ] **Task: Initialize Firebase AI Logic**
    - [ ] Modify `src/infrastructure/firebase.ts` to export `ai` using `getAI` and `GoogleAIBackend`.
    - [ ] Verify Firebase v11.6.0+ is in `package.json`.
- [ ] **Task: Define Domain Models**
    - [ ] Create `src/domain/CoachSession.ts` with `ICoachSession` and `ICoachMessage` interfaces.
    - [ ] Implement factory functions (e.g., `createCoachSession`, `createCoachMessage`).
    - [ ] Write unit tests in `src/domain/CoachSession.test.ts`.
- [ ] **Task: Update i18n Locales**
    - [ ] Add `coach` namespace to `src/i18n/locales/en.ts`.
    - [ ] Add `coach` namespace to `src/i18n/locales/pt.ts`.
    - [ ] Ensure all keys (title, trial, context, errors) are present in both.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Domain Setup' (Protocol in workflow.md)**

## Phase 2: Data Access Layer (Hooks)
- [ ] **Task: Create Firestore Utilities**
    - [ ] Create `src/hooks/api/coachSessions/coachSessionUtils.ts` for paths and mappers.
    - [ ] Implement `buildSystemPrompt` utility.
- [ ] **Task: Implement Session Hooks**
    - [ ] Create `useCreateCoachSession.ts` (mutation).
    - [ ] Create `useFetchCoachSessions.ts` (query, infinite scroll support).
    - [ ] Create `useArchiveCoachSession.ts` (mutation).
- [ ] **Task: Implement Real-time Message Hook**
    - [ ] Create `useCoachSessionMessages.ts` using `onSnapshot` pattern.
- [ ] **Task: Implement Trial Tracking Hook**
    - [ ] Update user profile logic or create `useCoachTrialStatus.ts` to track `freeCoachMessagesRemaining`.
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Data Access Layer (Hooks)' (Protocol in workflow.md)**

## Phase 3: Core AI Integration
- [ ] **Task: Implement AI Message Sending**
    - [ ] Create `useSendCoachMessage.ts`.
    - [ ] Logic: Save user message (sending) -> Gemini call -> Save AI response -> Update session metadata.
    - [ ] Implement error handling and "sending" status updates.
    - [ ] Integrate `freeCoachMessagesRemaining` decrement logic.
- [ ] **Task: Implement System Prompt Building**
    - [ ] Refine `buildSystemPrompt` to include 30 recent transactions and user profile context.
    - [ ] Implement the **Global Context Toggle** logic within the prompt builder.
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Core AI Integration' (Protocol in workflow.md)**

## Phase 4: UI Development
- [ ] **Task: Session List Page**
    - [ ] Create `src/pages/spending/FinancialCoachPage.tsx`.
    - [ ] Implement `FeatureGate` with trial support.
    - [ ] Show list of sessions with "New Session" button.
- [ ] **Task: Chat Interface Page**
    - [ ] Create `src/pages/spending/CoachChatPage.tsx`.
    - [ ] Implement chat bubbles, typing indicator, and auto-scroll.
    - [ ] Add **Global Context Toggle** in the chat header or input area.
- [ ] **Task: Context Banner Component**
    - [ ] Create `SpendingContextBanner` component for use in both pages.
- [ ] **Task: Conductor - User Manual Verification 'Phase 4: UI Development' (Protocol in workflow.md)**

## Phase 5: Routing & Final Integration
- [ ] **Task: Configure Routes**
    - [ ] Add constants to `src/routes/routes.constants.ts`.
    - [ ] Update `src/routes/AppRoutes.tsx` with new routes (ordering matters!).
- [ ] **Task: Add Entry Point**
    - [ ] Add link to Financial Coach in `InsightsPage.tsx` or `SpendingPage.tsx`.
- [ ] **Task: Final Smoke Test**
    - [ ] Verify end-to-end flow: Trial -> Upgrade -> Chat with context -> Archive session.
- [ ] **Task: Conductor - User Manual Verification 'Phase 5: Routing & Final Integration' (Protocol in workflow.md)**
