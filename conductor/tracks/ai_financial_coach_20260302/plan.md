# Implementation Plan: AI Financial Coach (Track: ai_financial_coach_20260302)

## Phase 1: Infrastructure & Domain Setup
- [x] **Task: Initialize Firebase AI Logic**
    - [x] Modify `src/infrastructure/firebase.ts` to export `ai` using `getAI` and `GoogleAIBackend`.
    - [x] Verify Firebase v11.6.0+ is in `package.json`. (Upgraded to 11.9.1 — first version with `firebase/ai`)
- [x] **Task: Define Domain Models**
    - [x] Create `src/domain/CoachSession.ts` with `ICoachSession` and `ICoachMessage` interfaces.
    - [x] Implement factory functions (e.g., `createCoachSession`, `createCoachMessage`).
    - [x] Write unit tests in `src/domain/CoachSession.test.ts`.
- [x] **Task: Update i18n Locales**
    - [x] Add `coach` namespace to `src/i18n/locales/en.ts`.
    - [x] Add `coach` namespace to `src/i18n/locales/pt.ts`.
    - [x] Ensure all keys (title, trial, context, errors) are present in both.
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Domain Setup' (Protocol in workflow.md)**

## Phase 2: Data Access Layer (Hooks) [checkpoint: 5074e9f]
- [x] **Task: Create Firestore Utilities**
    - [x] Create `src/hooks/api/coachSessions/coachSessionUtils.ts` for paths and mappers.
    - [x] Implement `buildSystemPrompt` utility.
- [x] **Task: Implement Session Hooks**
    - [x] Create `useCreateCoachSession.ts` (mutation).
    - [x] Create `useFetchCoachSessions.ts` (query, infinite scroll support).
    - [x] Create `useArchiveCoachSession.ts` (mutation).
- [x] **Task: Implement Real-time Message Hook**
    - [x] Create `useCoachSessionMessages.ts` using `onSnapshot` pattern.
- [x] **Task: Implement Trial Tracking Hook**
    - [x] Create `useCoachTrialStatus.ts` to track `freeCoachMessagesRemaining` in `userProfileExtensions`.
- [x] **Task: Conductor - User Manual Verification 'Phase 2: Data Access Layer (Hooks)' (Protocol in workflow.md)**

## Phase 3: Core AI Integration
- [x] **Task: Implement AI Message Sending**
    - [x] Create `useSendCoachMessage.ts`.
    - [x] Logic: Save user message (sending) -> Gemini call -> Save AI response -> Update session metadata.
    - [x] Implement error handling and "sending" status updates.
    - [x] Integrate `freeCoachMessagesRemaining` decrement logic.
- [x] **Task: Implement System Prompt Building**
    - [x] Refine `buildSystemPrompt` to include 30 recent transactions and user profile context.
    - [x] Implement the **Global Context Toggle** logic within the prompt builder.
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
