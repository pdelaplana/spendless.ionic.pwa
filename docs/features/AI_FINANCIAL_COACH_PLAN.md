# AI Financial Coach Feature — Implementation Plan

## Key Design Decisions

### Gemini via Firebase AI Logic (Direct Frontend)

**Firebase v11.6.0** (already installed) includes the `firebase/ai` module.
**Firebase AI Logic** enables calling Gemini directly from the browser client — no Firebase Function needed.

**How it works:**
- The `firebase/ai` SDK routes requests through Firebase's proxy, which holds the Gemini API key server-side (the key is never exposed in the browser bundle)
- Firebase App Check provides request attestation to prevent abuse
- You use the same Firebase project config already in `src/infrastructure/firebase.ts`

**Comparison of approaches:**

| Concern | Firebase Function → Gemini | Firebase AI Logic (Direct) |
|---|---|---|
| Setup complexity | High (deploy function) | Low (SDK only) |
| Cold start latency | Yes (2-5s on first call) | No |
| API key exposure | No (server-side) | No (Firebase proxy) |
| Subscription enforcement | Server-side (strict) | Client-side (same as existing AI features) |
| Context fetching | Server-side | Client-side (same session) |
| Cost | Function invocations + AI tokens | AI tokens only |
| Conversation history | Function fetches from Firestore | Client already has messages in state |

**Recommendation: Use Firebase AI Logic (Direct).** The existing premium feature gate (`FeatureGate` / subscription tier check) is client-side throughout the app — this is consistent. No cold starts, simpler code, cheaper.

---

## Architecture Overview

```
Client (PWA)                               Firebase
───────────────────────────                ────────────────────────
FinancialCoachPage                         Firestore
  → list sessions                          accounts/{accountId}/
  → start new session                        coachSessions/{sessionId}
                                               messages/{messageId}
CoachChatPage
  1. fetch spending context ─────────────► Firestore (spends, period)
  2. build Gemini chat history ◄────────── Firestore (past messages)
  3. sendMessage(userMessage) ──────────► Firebase AI Logic (firebase/ai)
      [Firebase proxy → Gemini API]       ◄─── AI response
  4. save user + AI messages ───────────► Firestore (messages subcollection)
  5. realtime listener ◄──────────────── onSnapshot (new messages)
```

---

## Files to Create / Modify

### 1. Firebase Initialization (modify)
**`src/infrastructure/firebase.ts`** — add Firebase AI Logic initialization:
```typescript
import { getAI, GoogleAIBackend } from 'firebase/ai';

// After existing app initialization:
export const ai = getAI(app, { backend: new GoogleAIBackend() });
```
> **Note**: `GoogleAIBackend` uses the Gemini Developer API. No additional env vars needed — it uses your existing Firebase project config. The Gemini API key is managed via the Firebase console (Firebase AI Logic setup).

### 2. Domain Model (create)
**`src/domain/CoachSession.ts`**
```typescript
export type CoachSessionStatus = 'active' | 'archived';
export type CoachMessageRole = 'user' | 'assistant' | 'system';
export type CoachMessageStatus = 'sending' | 'sent' | 'error';

export interface ICoachSession {
  id?: string; accountId: string; userId: string; title: string;
  status: CoachSessionStatus; messageCount: number;
  createdAt: Date; updatedAt: Date; lastMessageAt?: Date;
}

export interface ICoachMessage {
  id?: string; sessionId: string; role: CoachMessageRole;
  content: string; status: CoachMessageStatus; createdAt: Date;
}

// + factory functions: createCoachSession(), createCoachMessage()
```

### 3. API Hooks (create `src/hooks/api/coachSessions/`)

| File | Pattern to follow | Purpose |
|------|-------------------|---------|
| `coachSessionUtils.ts` | `aiInsightsUtils.ts` | Firestore constants + mappers |
| `useCreateCoachSession.ts` | `useCreateAccount.ts` | useMutation, creates Firestore doc |
| `useFetchCoachSessions.ts` | `useFetchAiInsights.ts` | useQuery, lists active sessions |
| `useCoachSessionMessages.ts` | `useAiInsightsRealtime.ts` | **useState + useEffect + onSnapshot** (NOT useQuery) |
| `useSendCoachMessage.ts` | New pattern (see below) | Gemini chat + Firestore persistence |
| `useArchiveCoachSession.ts` | `useUpdateAccount.ts` | useMutation, sets status: 'archived' |
| `index.ts` | — | Barrel export |

**Firestore paths:**
```
accounts/{accountId}/coachSessions/{sessionId}
accounts/{accountId}/coachSessions/{sessionId}/messages/{messageId}
```

**`useSendCoachMessage.ts` — core logic (new pattern):**
```typescript
import { getGenerativeModel } from 'firebase/ai';
import { ai } from '@/infrastructure/firebase';

// Inside mutationFn:
async function sendMessage({ accountId, sessionId, content, existingMessages, spendingContext }) {
  // 1. Save user message to Firestore immediately (status: 'sending')
  const userMsgRef = doc(messagesRef);
  await setDoc(userMsgRef, messageMapToFirestore({ role: 'user', content, status: 'sending' }));
  await updateDoc(userMsgRef, { status: 'sent' });

  // 2. Build Gemini model + chat
  const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });

  // 3. Convert existing Firestore messages to Gemini history format
  //    (exclude the message we just saved — send it as the new turn)
  const geminiHistory = existingMessages
    .filter(m => m.role !== 'system' && m.id !== userMsgRef.id)
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  // 4. Start chat with system prompt + history
  const chat = model.startChat({
    systemInstruction: buildSystemPrompt(spendingContext),
    history: geminiHistory,
  });

  // 5. Send message, get response
  const result = await chat.sendMessage(content);
  const aiContent = result.response.text();

  // 6. Save AI response to Firestore → triggers onSnapshot on client
  const aiMsgRef = doc(messagesRef);
  await setDoc(aiMsgRef, messageMapToFirestore({ role: 'assistant', content: aiContent, status: 'sent' }));

  // 7. Update session metadata
  await updateDoc(sessionRef, { messageCount: existingMessages.length + 2, updatedAt: now, lastMessageAt: now });

  return aiContent;
}
```

**`buildSystemPrompt(context)` — in `coachSessionUtils.ts`:**
```typescript
export function buildSystemPrompt(context: {
  period?: IPeriod;
  recentSpends: ISpend[];
  account: IAccount;
}): string {
  const { period, recentSpends, account } = context;
  const total = recentSpends.reduce((sum, s) => sum + s.amount, 0);
  const byCategory = groupBy(recentSpends, 'category');

  return `You are a compassionate AI Financial Coach in the Spendless app.
Your role: personalized, non-judgmental financial guidance based on the user's ACTUAL data.

CURRENT PERIOD: "${period?.name ?? 'No active period'}"
- Target spend: ${account.currency} ${period?.targetSpend ?? 0}
- Target savings: ${account.currency} ${period?.targetSavings ?? 0}
- Goals: ${period?.goals ?? 'Not set'}

SPENDING THIS PERIOD (${recentSpends.length} transactions):
- Total: ${account.currency} ${total.toFixed(2)}
- By category: ${JSON.stringify(byCategory)}

RECENT TRANSACTIONS:
${recentSpends.slice(0, 15).map(s =>
  `• ${s.description}: ${account.currency} ${s.amount} [${s.category}]${s.emotionalState ? ` (feeling: ${s.emotionalState})` : ''}`
).join('\n')}

Guidelines:
- Reference the user's ACTUAL transactions when relevant
- Acknowledge the emotional dimension of spending (Spendless tracks mood)
- Keep responses conversational, warm, and focused (2-4 paragraphs max)
- Ask clarifying questions to understand goals better
- All amounts in ${account.currency}`;
}
```

### 4. i18n (modify both `en.ts` and `pt.ts`)
Add `coach` namespace section — must be done in both files simultaneously to avoid TypeScript build errors:
```typescript
coach: {
  title: 'Financial Coach',
  newSession: 'New Session',
  pastSessions: 'Past Sessions',
  noSessions: 'No coaching sessions yet',
  noSessionsDescription: 'Ask your AI Financial Coach for personalized spending advice.',
  startSession: 'Start a Session',
  inputPlaceholder: 'Ask your coach anything...',
  send: 'Send',
  typingIndicator: 'Coach is thinking...',
  contextBanner: 'Coaching based on your {{count}} transactions this period',
  premiumRequired: 'Premium Feature',
  premiumDescription: 'Upgrade to Premium to chat with your AI Financial Coach.',
  archiveSession: 'Archive Session',
  messageError: 'Failed to send message. Please try again.',
  messagesTitle: 'Financial Coach',
  sessionDefault: 'Chat · {{date}}',
}
```

### 5. Routes (modify `src/routes/routes.constants.ts`)
```typescript
SPENDING_COACH: '/spending/coach',
SPENDING_COACH_CHAT: '/spending/coach/:sessionId',
```

### 6. Pages (create)

**`src/pages/spending/FinancialCoachPage.tsx`** — Session list
```
BasePageLayout [title, backTo=/spending, showMenu]
  GradientBackground → CenterContainer → SentryErrorBoundary
    FeatureGate [account, upgradeTitle, upgradeDescription]  ← premium gate
      SpendingContextBanner                                  ← shows period + count
      IonButton "New Session"                                ← createSession → navigate
      LoadingState | EmptyState | SessionList
        SessionCard[] → navigate to /spending/coach/:id
        IonInfiniteScroll (useInfiniteScrollList)
```
Hooks: `useFetchCoachSessions`, `useCreateCoachSession`, `useInfiniteScrollList`, `useSpendingAccount`

**`src/pages/spending/CoachChatPage.tsx`** — Active chat
```
BasePageLayout [title="Financial Coach", backTo=/spending/coach, footer=<ChatInputBar>]
  GradientBackground → CenterContainer → SentryErrorBoundary
    FeatureGate [account]
      IonContent ref={contentRef}                           ← auto-scroll to bottom
        SpendingContextBanner [compact]
        MessageList [flex-col]
          ChatBubble[] per message (user: right, AI: left)
          TypingIndicator [if isProcessing]
  IonFooter [fixed]
    IonTextarea [autoGrow] + IonButton [send, disabled if isSending]
```
Local state: `inputValue`, `isProcessing`
Hooks: `useParams`, `useCoachSessionMessages`, `useSendCoachMessage`, `useSpendingAccount`

**Styled components (inline in CoachChatPage):**
```typescript
// User bubble: right-aligned, brand gradient
// AI bubble: left-aligned, surface color, subtle border
// TypingIndicator: three bouncing dots (CSS keyframe animation)
// ChatInputBar: flex row, IonTextarea grows, send button fixed width
```

### 7. AppRoutes (modify `src/routes/AppRoutes.tsx`)
Inside `SpendingRoutes` switch — **more specific route FIRST**:
```tsx
import FinancialCoachPage from '@/pages/spending/FinancialCoachPage';
import CoachChatPage from '@/pages/spending/CoachChatPage';

<Route path={ROUTES.SPENDING_COACH_CHAT} exact><CoachChatPage /></Route>
<Route path={ROUTES.SPENDING_COACH}      exact><FinancialCoachPage /></Route>
```

### 8. Entry Point (modify)
**`src/pages/spending/InsightsPage.tsx`** (or SpendingPage) — add a tappable card/row with `chatbubbleOutline` icon, "Financial Coach" label, and premium badge linking to `ROUTES.SPENDING_COACH`.

---

## File Creation Order (respects dependencies)

| # | File | Action |
|---|------|--------|
| 1 | `src/infrastructure/firebase.ts` | Modify — add `ai` export |
| 2 | `src/domain/CoachSession.ts` | Create |
| 3 | `src/hooks/api/coachSessions/coachSessionUtils.ts` | Create |
| 4 | `src/hooks/api/coachSessions/useCreateCoachSession.ts` | Create |
| 5 | `src/hooks/api/coachSessions/useFetchCoachSessions.ts` | Create |
| 6 | `src/hooks/api/coachSessions/useCoachSessionMessages.ts` | Create |
| 7 | `src/hooks/api/coachSessions/useSendCoachMessage.ts` | Create |
| 8 | `src/hooks/api/coachSessions/useArchiveCoachSession.ts` | Create |
| 9 | `src/hooks/api/coachSessions/index.ts` | Create |
| 10 | `src/i18n/locales/en.ts` + `pt.ts` | Modify — add `coach` section |
| 11 | `src/routes/routes.constants.ts` | Modify — add 2 constants |
| 12 | `src/pages/spending/FinancialCoachPage.tsx` | Create |
| 13 | `src/pages/spending/CoachChatPage.tsx` | Create |
| 14 | `src/routes/AppRoutes.tsx` | Modify — add imports + 2 routes |
| 15 | `src/pages/spending/InsightsPage.tsx` | Modify — add entry point |

---

## Critical Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| Realtime listener in useQuery | Use `useState + useEffect + onSnapshot` (not useQuery) — see `useAiInsightsRealtime.ts` |
| Gemini history format | Convert Firestore messages: `role: 'user'/'model'` (not 'assistant') and `parts: [{ text }]` |
| Message deduplication | Pass `existingMessages` into useSendCoachMessage from the realtime listener state — they are the same messages, no separate optimistic array |
| Typing indicator timing | Set `isProcessing = false` after `chat.sendMessage()` resolves (not when onSnapshot fires) |
| Route ordering | `SPENDING_COACH_CHAT` (/spending/coach/:sessionId) MUST come before `SPENDING_COACH` in Switch |
| i18n TypeScript | Update BOTH `en.ts` and `pt.ts` simultaneously — TypeScript strict mode will reject missing keys |
| Context window | Slice `recentSpends` to last 30 in `buildSystemPrompt` — avoid sending entire spending history |
| firebase/ai setup | Requires Firebase AI Logic enabled in Firebase console before first run |

---

## Setup Required (One-Time, Before First Run)

1. **Firebase console**: Enable "Firebase AI Logic" for the project → configure Gemini Developer API
2. **App Check** (optional but recommended): Enable App Check with reCAPTCHA Enterprise to prevent API abuse
3. No additional environment variables needed — uses existing Firebase config

---

## Key Reference Files

| File | Why |
|------|-----|
| `src/hooks/api/aiInsights/aiInsightsUtils.ts` | Exact pattern for `coachSessionUtils.ts` |
| `src/hooks/api/aiInsights/useAiInsightsRealtime.ts` | `onSnapshot` realtime listener pattern |
| `src/pages/spending/AiInsightsListPage.tsx` | Page layout + premium gate + infinite scroll |
| `src/hooks/functions/useTriggerAiCheckin.ts` | Reference for how Firebase is called from hooks |
| `src/routes/AppRoutes.tsx` | SpendingRoutes switch — route insertion point |
| `src/domain/AiInsight.ts` | Domain entity + factory function pattern |

---

## References

- [Firebase AI Logic](https://firebase.google.com/docs/ai-logic)
- [Get started with Gemini via Firebase AI Logic](https://firebase.google.com/docs/ai-logic/get-started)
- [Firebase AI Logic products page](https://firebase.google.com/products/firebase-ai-logic)
