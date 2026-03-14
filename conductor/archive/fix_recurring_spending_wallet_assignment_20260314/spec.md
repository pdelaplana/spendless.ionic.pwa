# Specification: Fix Recurring Spending Wallet Assignment

## Problem Statement

When starting a new period, recurring spending records are always created in the first wallet of that period, even if they were assigned to a different wallet in the recurring spending definition.

### Root Cause
The `useGenerateRecurringSpends` hook attempts to find the correct wallet in the new period using the `walletId` stored in the `IRecurringSpend` object. However, wallet IDs are unique to each period. Since the new period has fresh wallet IDs, the lookup fails, and the system falls back to the default (first) wallet.

## Proposed Solution

1.  **Update Domain Model:** Add a `walletName` property to the `IRecurringSpend` interface. This provides a stable identifier that can be used to link recurring spending across different periods.
2.  **Update Data Entry:** Modify the `RecurringSpendModal` to capture and save the name of the selected wallet when a recurring spend is created or updated.
3.  **Update Generation Logic:** In `useGenerateRecurringSpends`, use the `walletName` from the `IRecurringSpend` record to find the corresponding wallet ID in the new period's wallet setup.
4.  **Update Utilities:** Update mapping and creation utilities for recurring spending to handle the new `walletName` property.

## Affected Components

-   `src/domain/RecurringSpend.ts` (Interface and creator/updater functions)
-   `src/pages/spending/modals/recurringSpendModal/RecurringSpendModal.tsx` (Form handling)
-   `src/hooks/api/recurringSpend/useGenerateRecurringSpends.ts` (Generation logic)
-   `src/hooks/api/recurringSpend/recurringSpendUtils.ts` (Firestore mapping)

## Success Criteria

-   Recurring spending records created in a new period are correctly assigned to the wallet that matches the name of the wallet assigned in the recurring spend definition.
-   If no wallet with a matching name exists in the new period, the record should fall back to the default wallet.
