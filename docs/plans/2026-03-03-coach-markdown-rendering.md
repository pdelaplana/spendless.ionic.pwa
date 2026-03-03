# Coach Markdown Rendering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render AI coach responses as formatted markdown (bold, lists, headers, inline code) instead of plain text.

**Architecture:** Drop `ReactMarkdown` directly into the existing AI `Bubble` styled component in `CoachChatPage.tsx`. A `markdownComponents` map defined outside the component provides scoped CSS overrides so default browser margins don't break the bubble layout. User messages and error states remain plain text.

**Tech Stack:** `react-markdown` ^10.1.0 (already installed), `remark-gfm` ^4.0.1 (already installed), Vitest + Testing Library.

---

### Task 1: Add failing tests for markdown rendering

**Files:**
- Modify: `src/pages/spending/CoachChatPage.test.tsx`

**Step 1: Add two failing tests to the existing `CoachChatPage` describe block**

In `CoachChatPage.test.tsx`, add these two tests after the existing `'renders messages when loaded'` test:

```tsx
it('renders AI response content as markdown — bold text becomes <strong>', () => {
  defaultSetup();
  mockUseCoachSessionMessages.mockReturnValue({
    messages: [
      {
        id: 'm1',
        role: 'model',
        content: '**Save more money**',
        status: 'sent',
        createdAt: new Date(),
      },
    ],
    isLoading: false,
  });

  render(<CoachChatPage />);

  expect(screen.getByRole('strong')).toBeInTheDocument();
});

it('renders AI response list items as <li> elements', () => {
  defaultSetup();
  mockUseCoachSessionMessages.mockReturnValue({
    messages: [
      {
        id: 'm1',
        role: 'model',
        content: '- Cut dining out\n- Cancel subscriptions',
        status: 'sent',
        createdAt: new Date(),
      },
    ],
    isLoading: false,
  });

  render(<CoachChatPage />);

  const items = screen.getAllByRole('listitem');
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent('Cut dining out');
  expect(items[1]).toHaveTextContent('Cancel subscriptions');
});
```

**Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/pages/spending/CoachChatPage.test.tsx
```

Expected: 2 failures — the bold text won't be inside a `<strong>` and no `<li>` elements will exist because content is currently rendered as plain text.

---

### Task 2: Implement markdown rendering in CoachChatPage

**Files:**
- Modify: `src/pages/spending/CoachChatPage.tsx`

**Step 1: Add the import at the top of the file (after existing imports)**

```tsx
import ReactMarkdown from 'react-markdown';
```

**Step 2: Add the `markdownComponents` map above the component definition (after the styled components section, before `const CoachChatPage: React.FC = () => {`)**

```tsx
// ─── Markdown Components ──────────────────────────────────────────────────────

const markdownComponents = {
  p: ({ children }: { children: React.ReactNode }) => (
    <p style={{ margin: '0 0 0.5em', lineHeight: 1.5 }} className='md-p'>{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul style={{ margin: '0.25em 0', paddingLeft: '1.25em' }}>{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol style={{ margin: '0.25em 0', paddingLeft: '1.25em' }}>{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li style={{ margin: '0.15em 0' }}>{children}</li>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0.5em 0 0.25em' }}>{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0.5em 0 0.25em' }}>{children}</h3>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code
      style={{
        fontFamily: 'monospace',
        fontSize: '0.875em',
        background: '#f3f4f6',
        borderRadius: '3px',
        padding: '1px 4px',
      }}
    >
      {children}
    </code>
  ),
};
```

**Step 3: Replace `msg.content` with `ReactMarkdown` in the model branch**

Find this block in the `messages.map(...)` render (around line 268–274):

```tsx
{msg.status === 'error' ? (
  <span>
    <IonIcon icon={warningOutline} /> {t('coach.errors.sendFailed')}
  </span>
) : (
  msg.content
)}
```

Replace with:

```tsx
{msg.status === 'error' ? (
  <span>
    <IonIcon icon={warningOutline} /> {t('coach.errors.sendFailed')}
  </span>
) : msg.role === 'model' ? (
  <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
) : (
  msg.content
)}
```

**Step 4: Fix trailing `<p>` margin**

The last `<p>` in a markdown response will have `margin-bottom: 0.5em` causing extra space at the bottom of the bubble. Add a CSS rule to `Bubble` styled component to zero it out:

Find the `Bubble` styled component and add at the end of its template literal:

```tsx
  .md-p:last-child {
    margin-bottom: 0;
  }
```

**Step 5: Run the new tests to confirm they pass**

```bash
npx vitest run src/pages/spending/CoachChatPage.test.tsx
```

Expected: all tests pass including the 2 new markdown tests.

**Step 6: Run full test suite**

```bash
CI=true npm run test.unit
```

Expected: all 28 test files pass.

**Step 7: Commit**

```bash
git add src/pages/spending/CoachChatPage.tsx src/pages/spending/CoachChatPage.test.tsx
git commit -m "feat(coach): Render AI responses as markdown"
```
