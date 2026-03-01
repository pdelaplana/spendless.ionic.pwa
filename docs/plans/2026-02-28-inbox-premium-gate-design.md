# Design: Hide Inbox for Non-Premium Users

**Date:** 2026-02-28
**Branch:** feature/ai-checkin-refactoring

## Context

The Inbox menu item (added in the `refactor_inbox_20260227` track) links to the AI Checkins page at `/inbox`. This feature is premium-only, but the sidebar menu item is currently visible to all users regardless of subscription tier. The `AiInsightsListPage` already redirects non-premium users to `/settings` as a safety net, but the menu item itself should not appear for non-premium users.

## Requirements

- Inbox menu item and "Notifications" section heading are completely hidden from the sidebar for non-premium users.
- Direct URL access to `/inbox` by non-premium users continues to redirect to `/settings` (existing behaviour, unchanged).
- No visual indication of a locked/premium feature in the menu — the item simply does not exist for essentials users.

## What Changes

### `src/components/menu/MainMenuContent.tsx`

Add two hooks to the component:

```tsx
const { account } = useSpendingAccount();
const subscription = useSubscription(account ?? null);
```

Wrap the Notifications section in a conditional:

```tsx
{subscription.isPremium && (
  <>
    <SectionTitle>Notifications</SectionTitle>
    <IonList lines='none'>
      <ModernMenuItem button routerLink={ROUTES.INBOX}>
        <IonIcon slot='start' icon={mailOutline} />
        <IonLabel>
          <h2>Inbox</h2>
          <p>Your AI spending check-ins</p>
        </IonLabel>
      </ModernMenuItem>
    </IonList>
  </>
)}
```

### `src/components/menu/MainMenuContent.test.tsx`

- Add mock for `useSpendingAccount` returning `account` with `subscriptionTier: 'premium'` by default.
- Update existing Inbox-related tests to cover the premium case.
- Add tests asserting Inbox and "Notifications" heading are absent for essentials users.

## Files Not Changing

- `src/routes/AppRoutes.tsx` — `/inbox` route and its redirect guard stay as-is.
- `src/pages/spending/AiInsightsListPage.tsx` — premium redirect safety net stays as-is.
- `src/routes/routes.constants.ts` — no route changes.

## Subscription Hook Reference

`useSubscription(account)` from `@/hooks/subscription` returns `isPremium: boolean`, which is `true` only when `subscriptionTier === 'premium'` and the subscription has not expired.
