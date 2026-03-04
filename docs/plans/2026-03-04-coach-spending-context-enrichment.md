# Coach Spending Context Enrichment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich the AI coach system prompt with the active period's date range, overall spend budget, and per-wallet spending limits vs actuals so the coach can give budget-aware advice.

**Architecture:** Extend `buildSystemPrompt` in `coachSessionUtils.ts` with an optional `period: IPeriod` parameter. Wallet actuals are derived by grouping the existing `spends` array by `walletId` — no new network calls. `CoachChatPage` passes `selectedPeriod` from `useSpendingAccount` into the existing `useMemo` call.

**Tech Stack:** TypeScript, Vitest, React, `@/domain/Period` (`IPeriod`), `@/domain/Wallet` (`IWalletSetup`), `@/domain/Spend` (`ISpend`)

---

### Task 1: Add failing tests for period + wallet context in `buildSystemPrompt`

**Files:**
- Modify: `src/hooks/api/coachSessions/coachSessionUtils.test.ts`

**Context:** The test file already imports `buildSystemPrompt` and `ISpend`. You need to also import `IPeriod` from `@/domain/Period` and add a `makeSpend` helper and a `makePeriod` helper to keep tests DRY.

**Step 1: Add imports and helpers at the top of the existing `buildSystemPrompt` describe block**

Add after the existing imports at line 3:
```ts
import type { IPeriod } from '@/domain/Period';
```

Add these helpers after `makeFirestoreMessage` (before the `describe('coachSessionUtils'` block):
```ts
const makeSpend = (overrides: Partial<ISpend> = {}): ISpend => ({
  id: '1',
  accountId: 'acc-1',
  date: new Date('2026-01-15'),
  category: 'need',
  amount: 50,
  description: 'Grocery',
  notes: '',
  periodId: 'p1',
  walletId: 'w1',
  recurring: false,
  emotionalState: undefined,
  emotionalContext: [],
  satisfactionRating: undefined,
  necessityRating: undefined,
  personalReflections: [],
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePeriod = (overrides: Partial<IPeriod> = {}): IPeriod => ({
  id: 'p1',
  name: 'January 2026',
  goals: '',
  targetSpend: 3000,
  targetSavings: 500,
  startAt: new Date('2026-01-01'),
  endAt: new Date('2026-01-31'),
  reflection: '',
  walletSetup: [
    { name: 'Groceries', spendingLimit: 600, isDefault: true },
    { name: 'Entertainment', spendingLimit: 200, isDefault: false },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

**Step 2: Add the failing tests inside the existing `describe('buildSystemPrompt'` block**

Add these tests after the existing `'should default currency to USD'` test:

```ts
describe('with period context', () => {
  it('should include period name and date range when period is provided', () => {
    const spends = [makeSpend()];
    const period = makePeriod();

    const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

    expect(prompt).toContain('January 2026');
    expect(prompt).toContain('01 Jan 2026');
    expect(prompt).toContain('31 Jan 2026');
  });

  it('should include overall budget line with spent and limit', () => {
    const spends = [makeSpend({ amount: 450, walletId: 'w1' })];
    const period = makePeriod({ targetSpend: 3000 });

    const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

    expect(prompt).toContain('450.00');
    expect(prompt).toContain('3,000.00');
  });

  it('should include wallet breakdown with actuals computed from spends', () => {
    const spends = [
      makeSpend({ amount: 450, walletId: 'w1' }),
      makeSpend({ amount: 280, walletId: 'w2' }),
    ];
    const period = makePeriod({
      walletSetup: [
        { name: 'Groceries', spendingLimit: 600, isDefault: true },
        { name: 'Entertainment', spendingLimit: 200, isDefault: false },
      ],
    });

    const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

    expect(prompt).toContain('Groceries');
    expect(prompt).toContain('450.00');
    expect(prompt).toContain('600.00');
    expect(prompt).toContain('Entertainment');
    expect(prompt).toContain('280.00');
    expect(prompt).toContain('200.00');
  });

  it('should show ⚠️ emoji for wallets over their spending limit', () => {
    const spends = [makeSpend({ amount: 280, walletId: 'w2' })];
    const period = makePeriod({
      walletSetup: [
        { name: 'Entertainment', spendingLimit: 200, isDefault: true },
      ],
    });

    const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

    expect(prompt).toContain('⚠️');
  });

  it('should NOT show ⚠️ for wallets within their limit', () => {
    const spends = [makeSpend({ amount: 100, walletId: 'w1' })];
    const period = makePeriod({
      walletSetup: [
        { name: 'Groceries', spendingLimit: 600, isDefault: true },
      ],
    });

    const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

    expect(prompt).not.toContain('⚠️');
  });

  it('should not include period section when includeContext is false', () => {
    const period = makePeriod();

    const prompt = buildSystemPrompt({ includeContext: false, period });

    expect(prompt).not.toContain('January 2026');
    expect(prompt).toContain('No spending context has been shared');
  });

  it('should not include period section when no period is passed', () => {
    const spends = [makeSpend()];

    const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD' });

    expect(prompt).not.toContain('Period:');
    expect(prompt).not.toContain('Wallets:');
  });

  it('should handle a wallet with zero spend correctly', () => {
    const spends = [makeSpend({ amount: 100, walletId: 'w1' })];
    const period = makePeriod({
      walletSetup: [
        { name: 'Groceries', spendingLimit: 600, isDefault: true },
        { name: 'Transport', spendingLimit: 300, isDefault: false },
      ],
    });

    const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

    expect(prompt).toContain('Transport');
    expect(prompt).toContain('0.00');
    expect(prompt).toContain('300.00');
  });
});
```

**Step 3: Run tests to verify they fail**

```bash
npm run test.unit -- --reporter=verbose coachSessionUtils
```

Expected: All new tests FAIL — `period` param not yet supported.

**Step 4: Commit**

```bash
git add src/hooks/api/coachSessions/coachSessionUtils.test.ts
git commit -m "test(coach): add failing tests for period and wallet context in buildSystemPrompt"
```

---

### Task 2: Implement period + wallet context in `buildSystemPrompt`

**Files:**
- Modify: `src/hooks/api/coachSessions/coachSessionUtils.ts`

**Context:** `buildSystemPrompt` is a pure function at line 70. `IPeriod` lives in `@/domain/Period`. `IWalletSetup` lives in `@/domain/Wallet`. The wallet setup array on a period (`period.walletSetup`) uses `IWalletSetup` objects which have `name`, `spendingLimit`, and `isDefault`. Wallets don't have IDs — spending transactions reference wallets by `walletId`, but `IWalletSetup` has no `id` field.

**Important:** The wallet setup array index corresponds to the wallet order, but we can't directly map `walletId` from `ISpend` to `IWalletSetup` without an ID. Look at how wallets are created: `createWalletFromSetup` in `@/domain/Wallet` creates `IWallet` objects from setup with a separate `walletId`. The wallet's Firestore ID is generated at creation time and not stored on the period's `walletSetup`.

**Therefore:** We must match wallets by **name** between `IWallet` (which has an `id`) and `IWalletSetup`. But we don't have `IWallet` objects here — only `ISpend` records which have `walletId`.

**Pragmatic solution:** Since the `spending` array already has the wallet name via the description, and the `walletSetup` doesn't carry IDs, we must look at this differently. The `ISpend.walletId` is a Firestore document ID. We need the wallet names to match them.

**Re-examine:** Looking at `CoachChatPage`, it has access to `useFetchWalletsByPeriod` to get `IWallet[]` with both `id` and `name`. However, we agreed to avoid new network calls.

**Alternative approach:** Pass wallet name alongside each spend, OR pass `wallets: IWallet[]` to `buildSystemPrompt` in addition to `period`. The page already has access to wallets via `useFetchWalletsByPeriod(account.id, selectedPeriod.id)`.

**Revised plan:** Add `wallets?: IWallet[]` to `buildSystemPrompt` options. `CoachChatPage` fetches wallets (already cached from the period view) and passes them. This is still no extra network call in practice since wallets are cached by `useFetchWalletsByPeriod`.

**Step 1: Add `IPeriod` and `IWallet` imports**

At the top of `coachSessionUtils.ts`, the file already imports `ISpend`. Add:

```ts
import type { IPeriod } from '@/domain/Period';
import type { IWallet } from '@/domain/Wallet';
```

**Step 2: Update the `buildSystemPrompt` options type and signature**

Replace the existing options type (lines 70-74):
```ts
export const buildSystemPrompt = (options: {
  includeContext: boolean;
  spends?: ISpend[];
  currency?: string;
  period?: IPeriod;
  wallets?: IWallet[];
}): string => {
```

**Step 3: Add a helper to format dates for the prompt**

Add this pure helper just before `buildSystemPrompt`:
```ts
const formatPromptDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
```

**Step 4: Add the period + wallet section inside `buildSystemPrompt`**

Replace the entire function body (after the `base` definition) with:

```ts
  if (!options.includeContext || !options.spends?.length) {
    return `${base}\n\nNo spending context has been shared for this session.`;
  }

  const currency = options.currency ?? 'USD';
  const recentSpends = options.spends.slice(0, 30);

  const spendLines = recentSpends.map((s) => {
    const date = s.date.toISOString().split('T')[0];
    return `- ${date}: ${s.description} (${s.category}) — ${currency} ${s.amount.toFixed(2)}`;
  });

  const total = recentSpends.reduce((sum, s) => sum + s.amount, 0);

  const sections: string[] = [base, ''];

  if (options.period) {
    const { period, wallets } = options;
    const start = formatPromptDate(period.startAt);
    const end = formatPromptDate(period.endAt);
    sections.push(`Period: "${period.name}" (${start} – ${end})`);
    sections.push('');

    const totalSpent = recentSpends.reduce((sum, s) => sum + s.amount, 0);
    const limitFormatted = (period.targetSpend).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const spentFormatted = totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const pct = period.targetSpend > 0 ? Math.round((totalSpent / period.targetSpend) * 100) : 0;
    sections.push(`Budget: ${currency} ${spentFormatted} spent of ${currency} ${limitFormatted} limit (${pct}%)`);
    sections.push('');

    if (wallets && wallets.length > 0) {
      sections.push('Wallets:');
      for (const wallet of wallets) {
        const walletSpent = recentSpends
          .filter((s) => s.walletId === wallet.id)
          .reduce((sum, s) => sum + s.amount, 0);
        const walletSpentFmt = walletSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const walletLimitFmt = wallet.spendingLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const walletPct = wallet.spendingLimit > 0 ? Math.round((walletSpent / wallet.spendingLimit) * 100) : 0;
        const overLimit = walletSpent > wallet.spendingLimit ? ' ⚠️ over limit' : '';
        sections.push(`- ${wallet.name}: ${currency} ${walletSpentFmt} spent / ${currency} ${walletLimitFmt} limit (${walletPct}%)${overLimit}`);
      }
      sections.push('');
    }
  }

  sections.push(
    `The user's ${recentSpends.length} most recent transactions (total: ${currency} ${total.toFixed(2)}):`,
    ...spendLines,
    '',
    'Use this data to provide personalized, data-driven advice when relevant.',
  );

  return sections.join('\n');
```

**Step 5: Run the tests**

```bash
npm run test.unit -- --reporter=verbose coachSessionUtils
```

Expected: All tests PASS.

**Note on test helpers:** The tests in Task 1 use `walletId: 'w1'` and `'w2'` on spends and `IWalletSetup` (which has no `id`). But the implementation now uses `IWallet` (which has `id`). Update the test helpers in `coachSessionUtils.test.ts`:

- Change `makePeriod` to NOT pass `wallets` (period context is used only for dates and budget total)
- Add a `makeWallet` helper:
```ts
import type { IWallet } from '@/domain/Wallet';

const makeWallet = (overrides: Partial<IWallet> = {}): IWallet => ({
  id: 'w1',
  accountId: 'acc-1',
  periodId: 'p1',
  name: 'Groceries',
  spendingLimit: 600,
  currentBalance: 0,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

- Update the test cases in Task 1 to pass `wallets: [makeWallet(...), ...]` instead of relying on `period.walletSetup`
- Re-run: `npm run test.unit -- --reporter=verbose coachSessionUtils`

Expected: All tests PASS.

**Step 6: Commit**

```bash
git add src/hooks/api/coachSessions/coachSessionUtils.ts src/hooks/api/coachSessions/coachSessionUtils.test.ts
git commit -m "feat(coach): enrich system prompt with period dates, budget, and wallet breakdown"
```

---

### Task 3: Pass period and wallets from `CoachChatPage`

**Files:**
- Modify: `src/pages/spending/CoachChatPage.tsx`

**Context:** `CoachChatPage` already calls `useSpendingAccount()` which returns `{ account, spending, selectedPeriod }`. Wallets for the current period are fetched with `useFetchWalletsByPeriod(accountId, periodId)` from `@/hooks/api/wallet`. This data is already cached from the main spending view, so no extra network round-trips are expected in practice.

**Step 1: Add wallet hook import**

At the top of `CoachChatPage.tsx`, add to the existing hook imports:
```ts
import { useFetchWalletsByPeriod } from '@/hooks/api/wallet';
```

**Step 2: Fetch wallets in the component**

After the existing `const { account, spending, selectedPeriod } = useSpendingAccount();` line, add:

```ts
const { data: wallets = [] } = useFetchWalletsByPeriod(
  account?.id ?? '',
  selectedPeriod?.id ?? '',
);
```

**Step 3: Update the `systemPrompt` useMemo**

Replace the existing `useMemo` for `systemPrompt`:
```ts
const systemPrompt = useMemo(
  () =>
    buildSystemPrompt({
      includeContext,
      spends: recentSpends,
      currency: account?.currency,
      period: selectedPeriod,
      wallets,
    }),
  [includeContext, recentSpends, account?.currency, selectedPeriod, wallets],
);
```

**Step 4: Build and verify no TypeScript errors**

```bash
npm run build 2>&1 | head -50
```

Expected: Build succeeds with no type errors.

**Step 5: Run full unit test suite**

```bash
npm run test.unit
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/pages/spending/CoachChatPage.tsx
git commit -m "feat(coach): pass period and wallet data to system prompt builder"
```

---

### Task 4: Lint, format, and final verification

**Files:** None new.

**Step 1: Run linter and auto-fix**

```bash
npm run check
```

Expected: No lint or format errors (or auto-fixed).

**Step 2: Run full test suite**

```bash
npm run test.unit
```

Expected: All tests pass.

**Step 3: Commit any lint fixes if needed**

```bash
git add -p
git commit -m "chore: fix lint and formatting in coach context enrichment"
```

Only commit if there were actual changes from `npm run check`.
