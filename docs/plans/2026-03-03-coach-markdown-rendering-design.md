# Design: Markdown Rendering for AI Coach Responses

**Date:** 2026-03-03
**Track:** ai_financial_coach_20260302
**Status:** Approved

## Problem

AI coach responses are rendered as plain text, losing all formatting that Gemini produces — bullet lists, bold emphasis, headers, and inline code are displayed as raw markdown syntax.

## Approach: Option A — ReactMarkdown inside existing Bubble

Use the `react-markdown` library (already a project dependency, used in `AiInsightDetailPage`) directly inside the existing AI `Bubble` styled component. No new dependencies, no layout changes, no new files.

## Scope

Supported markdown elements:
- Bold / italic / inline code
- Bullet and numbered lists
- Headers (`##`, `###`)

Tables are out of scope.

## Implementation

**File changed:** `src/pages/spending/CoachChatPage.tsx` only.

### Changes

1. Import `ReactMarkdown` from `react-markdown`.
2. Define a `markdownComponents` map outside the component to avoid re-renders.
3. Replace `{msg.content}` in the `role === 'model'` branch with `<ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>`.
4. User messages and the error state remain plain text — unchanged.

### Styled element overrides

| Element | Style |
|---------|-------|
| `p` | `margin: 0 0 0.5em`, last-child `margin-bottom: 0` |
| `ul` / `ol` | `margin: 0.25em 0`, `padding-left: 1.25em` |
| `li` | `margin: 0.15em 0` |
| `h2` / `h3` | `font-size: 0.9375rem`, `font-weight: 600`, `margin: 0.5em 0 0.25em` |
| `code` | mono font, `gray[100]` background, `border-radius: 3px`, `padding: 1px 4px` |

## Testing

- Update `CoachChatPage.test.tsx` to verify AI messages with markdown are rendered (e.g. bold text appears as `<strong>`, lists render `<li>` elements).
- User message rendering test remains unchanged.
