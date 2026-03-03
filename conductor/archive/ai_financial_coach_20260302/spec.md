# Specification: AI Financial Coach (Track: ai_financial_coach_20260302)

## 1. Overview
The AI Financial Coach is a premium feature that provides personalized, non-judgmental financial guidance based on the user's actual spending data. It uses **Firebase AI Logic** to call the Gemini 2.0 Flash model directly from the client (PWA), ensuring low latency and cost-effectiveness.

## 2. Functional Requirements
- **Gemini via Firebase AI Logic**: Client-side integration using the `firebase/ai` SDK.
- **Personalized Context**: Automatically fetches the user's 30 most recent transactions for the current period and passes them to Gemini via the system prompt.
- **User-Controlled Sharing**: A **Global Context Toggle** in the chat UI allows users to opt-out of sharing their spending context for a specific message/session.
- **Chat Interface**: 
    - List of past coaching sessions (`FinancialCoachPage`).
    - Real-time chat interface with user/AI bubbles (`CoachChatPage`).
    - Typing indicators and message status (sending/sent/error).
- **Persistence**: Sessions and messages are stored in Firestore under `accounts/{accountId}/coachSessions/{sessionId}/messages`.
- **Premium & Trial Access**:
    - **Premium Tier**: Unlimited access via `FeatureGate`.
    - **Free Tier (Trial)**: 3-5 free messages per user, tracked via a `freeCoachMessagesRemaining` field in the user's Firestore profile.

## 3. Non-Functional Requirements
- **Performance**: No "cold starts" due to direct client-side AI calls.
- **Security**: Gemini API keys are proxied via Firebase and never exposed in the browser bundle.
- **Internationalization**: Full support for English (`en.ts`) and Portuguese (`pt.ts`).

## 4. Technical Implementation
- **Model**: `gemini-2.0-flash`.
- **System Prompt**: Dynamically built from the user's spending data (if context is enabled).
- **Real-time Updates**: `onSnapshot` listener for the messages subcollection.
- **Hooks**: New API hooks in `src/hooks/api/coachSessions/` using the standard mutation/query patterns.

## 5. Acceptance Criteria
- [ ] User can see a list of past AI Financial Coach sessions.
- [ ] User can start a new coaching session.
- [ ] User can toggle "Share spending context" on/off.
- [ ] AI responds with personalized advice based on actual data (when context is on).
- [ ] Non-premium users can send up to 3-5 free messages before being prompted to upgrade.
- [ ] Premium users have unlimited messages.
- [ ] UI is responsive and follows the Spendless brand identity (gradients, bubbles).

## 6. Out of Scope
- Voice interaction.
- Image/receipt uploads to the coach.
- Automated budgeting (only advice/analysis).
