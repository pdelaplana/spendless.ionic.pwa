# Coach Spending Context Enrichment — Design

**Date:** 2026-03-04
**Status:** Approved

## Problem

The AI coach system prompt currently only includes up to 30 recent transactions (date, description, category, amount) and the account currency. It has no awareness of the active budget period, spending limits, or wallet breakdown — making it impossible to give accurate budget-aware advice.

## Goal

Enrich the coach system prompt with the active period's date range, overall spend budget, and per-wallet spending limits vs actuals, so the coach can give contextually correct advice.

## Approach

Extend `buildSystemPrompt` in `coachSessionUtils.ts` to accept an optional `period: IPeriod` parameter. When present and `includeContext` is true, a budget section is prepended to the transaction list. Wallet actuals are derived by summing the existing `spends` array grouped by `walletId` — no new network calls required.

`CoachChatPage` passes `selectedPeriod` (already available from `useSpendingAccount`) into the existing `buildSystemPrompt` call via `useMemo`.

## System Prompt Format

When context is enabled and a period is present:

```
[base persona instructions]

Period: "January 2025" (01 Jan – 31 Jan)

Budget: USD 450.00 spent of USD 3,000.00 limit (15%)

Wallets:
- Groceries: USD 450.00 spent / USD 600.00 limit (75%)
- Entertainment: USD 280.00 spent / USD 200.00 limit ⚠️ over limit
- Transport: USD 0.00 spent / USD 300.00 limit (0%)

The user's 30 most recent transactions (total: USD 450.00):
- 2025-01-15: Coffee (rituals) — USD 4.50
...

Use this data to provide personalized, data-driven advice when relevant.
```

## Data Sources

| Data | Source | Already loaded? |
|------|--------|----------------|
| Period dates, name | `selectedPeriod` from `useSpendingAccount` | ✅ Yes |
| Wallet limits (`walletSetup`) | `selectedPeriod.walletSetup` | ✅ Yes |
| Wallet actuals | Computed from `spending` grouped by `walletId` | ✅ Yes |
| Currency | `account.currency` | ✅ Yes |

No new hooks or Firestore calls required.

## Changes

### `coachSessionUtils.ts`
- Add `period?: IPeriod` to `buildSystemPrompt` options
- When period is present, compute wallet actuals from `spends` grouped by `walletId`
- Build and insert budget section before the transaction list
- Show ⚠️ emoji for any wallet where actual > limit

### `CoachChatPage.tsx`
- Add `selectedPeriod` to the `buildSystemPrompt` `useMemo` deps
- Pass `period: selectedPeriod` into `buildSystemPrompt` options

## Testing

All tests in `coachSessionUtils.test.ts`:
- Period section appears when `period` provided and `includeContext` true
- Wallet actuals correctly summed from `spends` by `walletId`
- Over-limit wallet shows ⚠️ emoji
- Period section absent when `includeContext` false
- Period section absent when no period passed (backward compatibility)
