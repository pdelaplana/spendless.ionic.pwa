# Implementation Plan: Fix Recurring Spending Wallet Assignment

This plan outlines the steps required to ensure recurring spending records are assigned to the correct wallet in a new period.

## Phase 1: Domain Model and Utilities

1.  **[x] Update `src/domain/RecurringSpend.ts`:**
    -   Add `walletName` to `IRecurringSpend` interface.
    -   Update `createRecurringSpend` to include `walletName`.
    -   Update `updateRecurringSpend` to include `walletName`.

2.  **[x] Update `src/hooks/api/recurringSpend/recurringSpendUtils.ts`:**
    -   Update `mapToFirestore` to include `walletName`.
    -   Update `mapFromFirestore` to include `walletName`.

## Phase 2: User Interface Updates

1.  **[x] Update `src/pages/spending/modals/recurringSpendModal/RecurringSpendModal.tsx`:**
    -   Ensure `onSubmit` captures the name of the selected wallet from the `wallets` list and includes it in the `onSave` data.

## Phase 3: Generation Logic Updates

1.  **[x] Update `src/hooks/api/recurringSpend/useGenerateRecurringSpends.ts`:**
    -   Update the loop that iterates over active recurring spends.
    -   Use `recurringSpend.walletName` to look up the new `walletId` from the `walletNameToId` map.
    -   Fall back to `defaultWalletId` only if a matching name is not found.

## Phase 4: Verification

1.  **Manual Testing:**
    -   Create a recurring spend and assign it to a non-default wallet.
    -   Start a new period and verify the spend record is created in the correct wallet.
2.  **Regression Testing:**
    -   Verify that recurring spending still works as expected for the default wallet.
