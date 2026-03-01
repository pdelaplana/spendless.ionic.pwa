# Inbox Premium Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hide the Inbox sidebar menu item and its "Notifications" section heading from non-premium users.

**Architecture:** Add `useSpendingAccount()` and `useSubscription(account)` to `MainMenuContent`, then conditionally render the Notifications section. The existing redirect guard in `AiInsightsListPage` for direct URL access is unchanged.

**Tech Stack:** React, Ionic, Vitest + React Testing Library, `useSpendingAccount` from `@/providers/spendingAccount`, `useSubscription` from `@/hooks/subscription`

---

### Task 1: Write failing tests for premium/non-premium Inbox visibility

**Files:**
- Modify: `src/components/menu/MainMenuContent.test.tsx`

**Step 1: Add mocks for `useSpendingAccount` and `useSubscription`**

Open `src/components/menu/MainMenuContent.test.tsx`. The file currently has three mocks (`@/providers/auth`, `@/hooks`, `@/components/shared`). Add two more mocks immediately after the existing ones:

```tsx
vi.mock('@/providers/spendingAccount', () => ({
  useSpendingAccount: vi.fn(() => ({
    account: { subscriptionTier: 'premium' },
  })),
}));

vi.mock('@/hooks/subscription', () => ({
  useSubscription: vi.fn((account) => ({
    isPremium: account?.subscriptionTier === 'premium',
  })),
}));
```

**Step 2: Add two new test cases at the end of the `describe` block**

```tsx
it('hides the Inbox item and Notifications heading for non-premium users', () => {
  const { useSpendingAccount } = await import('@/providers/spendingAccount');
  vi.mocked(useSpendingAccount).mockReturnValueOnce({
    account: { subscriptionTier: 'essentials' },
  } as any);

  render(<MainMenuContent />);

  expect(screen.queryByText('Inbox')).not.toBeInTheDocument();
  expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
});

it('shows the Inbox item and Notifications heading for premium users', () => {
  render(<MainMenuContent />);

  expect(screen.getByText('Inbox')).toBeInTheDocument();
  expect(screen.getByText('Notifications')).toBeInTheDocument();
});
```

Note: The default mock already returns `subscriptionTier: 'premium'`, so all existing tests continue to cover the premium case. The new non-premium test overrides the mock for a single render.

**Step 3: Run tests to confirm they fail**

```bash
npx vitest run src/components/menu/MainMenuContent.test.tsx
```

Expected: The two new tests FAIL (Inbox is currently always rendered). Existing tests PASS.

---

### Task 2: Implement the premium gate in `MainMenuContent`

**Files:**
- Modify: `src/components/menu/MainMenuContent.tsx`

**Step 1: Add the two new imports**

In `MainMenuContent.tsx`, add these two import lines alongside the existing imports:

```tsx
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useSubscription } from '@/hooks/subscription';
```

**Step 2: Call the hooks inside `MainMenuContent`**

Inside the `MainMenuContent` component function body, after the existing hook calls (`useAuth`, `usePrompt`), add:

```tsx
const { account } = useSpendingAccount();
const subscription = useSubscription(account ?? null);
```

**Step 3: Wrap the Notifications section in a conditional**

Find the Notifications section in the JSX (currently lines 152–161). Replace:

```tsx
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
```

With:

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

**Step 4: Run tests to confirm all pass**

```bash
npx vitest run src/components/menu/MainMenuContent.test.tsx
```

Expected: ALL tests PASS, including the two new ones.

**Step 5: Run the full unit test suite to check for regressions**

```bash
npm run test.unit -- --run
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/components/menu/MainMenuContent.tsx src/components/menu/MainMenuContent.test.tsx
git commit -m "feat(menu): hide Inbox for non-premium users"
```

---

### Task 3: Manual verification

Start the dev server and verify visually:

```bash
npm run dev
```

1. Sign in with a **non-premium** account → open the sidebar → confirm Inbox and Notifications heading are absent
2. Sign in with a **premium** account → open the sidebar → confirm Inbox appears above Recurring Spending
3. While logged in as non-premium, navigate directly to `/inbox` → confirm redirect to `/settings` still works
