# Development Reminders for Claude Code

This document contains important reminders and guidelines for future development sessions. **Always review this file when starting work on the Spendless PWA project.**

## 🎯 Critical Reminders

### List Components - ALWAYS USE SHARED COMPONENTS

**When building or refactoring ANY list view, you MUST use the shared list components and hooks.**

**Location**: `src/components/shared/list/` and `src/hooks/ui/useInfiniteScrollList.ts`

**What exists:**
- ✅ `useInfiniteScrollList` hook - Handles ALL pagination logic
- ✅ `DateSeparator` component - For date-grouped lists
- ✅ `LoadingState` component - For loading states
- ✅ `EmptyState` component - For empty states

**Examples of existing implementations:**
- ✅ `SpendList` - Transaction list with infinite scroll
- ✅ `AiInsightsListPage` - AI insights with date grouping

**⚠️ DO NOT:**
- ❌ Create custom pagination state management
- ❌ Create custom `useState` for display count
- ❌ Write custom `handleInfiniteScroll` functions
- ❌ Create custom styled components for loading/empty states
- ❌ Duplicate date separator styling

**✅ INSTEAD:**
```tsx
import { useInfiniteScrollList } from '@/hooks/ui';
import { DateSeparator, LoadingState, EmptyState } from '@/components/shared';

// Use the hook
const { visibleItems, hasMore, handleInfiniteScroll } = useInfiniteScrollList(items);

// Use shared components
if (isLoading) return <LoadingState message="Loading..." />;
if (items.length === 0) return <EmptyState title="No items" />;
```

**📚 Full Documentation**: See `docs/SHARED_LIST_COMPONENTS.md`

---

## 🔍 Code Review Checklist

### Before Committing List-Related Changes

- [ ] Used `useInfiniteScrollList` hook instead of custom pagination?
- [ ] Used `LoadingState` instead of custom loading component?
- [ ] Used `EmptyState` instead of custom empty component?
- [ ] Used `DateSeparator` for date-grouped lists?
- [ ] Checked if `hasMore` before rendering `IonInfiniteScroll`?
- [ ] Memoized grouping logic with `useMemo`?
- [ ] Used proper keys for list items (not array index)?

---

## 🏗️ Architecture Patterns

### List Views Should Follow This Structure

```tsx
function MyListPage() {
  // 1. Fetch data
  const { data: items = [], isLoading } = useFetchItems();

  // 2. Use pagination hook
  const { visibleItems, hasMore, handleInfiniteScroll } = useInfiniteScrollList(items);

  // 3. Group if needed (AFTER pagination)
  const groupedItems = useMemo(() => groupByDate(visibleItems), [visibleItems]);

  // 4. Handle loading state
  if (isLoading) return <LoadingState />;

  // 5. Handle empty state
  if (items.length === 0) return <EmptyState />;

  // 6. Render list
  return (
    <>
      {Object.entries(groupedItems).map(([date, items]) => (
        <div key={date}>
          <DateSeparator date={date} />
          {items.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      ))}

      {hasMore && (
        <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>
      )}
    </>
  );
}
```

---

## 📦 Component Organization

### When to Create a Shared Component

Create a shared component when:
- ✅ Pattern appears in 2+ places
- ✅ Design is consistent across features
- ✅ Logic is generic and reusable
- ✅ Component has clear, stable API

Place shared components in:
- **`src/components/shared/`** - Generic, reusable components
- **`src/components/ui/`** - UI-specific shared components
- **`src/components/layouts/`** - Layout components

### When NOT to Create a Shared Component

Keep components local when:
- ❌ Only used in one feature
- ❌ Highly customized for specific domain
- ❌ API is unstable or changing frequently
- ❌ Tight coupling to specific business logic

---

## 🎨 Styling Guidelines

### Use Design System Tokens

**Always use design system tokens from `@/theme/designSystem` instead of hardcoded values:**

```tsx
// ✅ Good
import { designSystem } from '@/theme/designSystem';

const Container = styled.div`
  padding: ${designSystem.spacing.lg};
  color: ${designSystem.colors.textPrimary};
`;

// ❌ Bad
const Container = styled.div`
  padding: 24px;
  color: #333;
`;
```

---

## 🧪 Testing Reminders

### Test Shared Components

When testing components that use shared utilities:

```tsx
// Mock the hook
vi.mock('@/hooks/ui', () => ({
  useInfiniteScrollList: vi.fn(() => ({
    visibleItems: mockItems,
    hasMore: false,
    handleInfiniteScroll: vi.fn(),
  })),
}));
```

---

## 🚨 Common Pitfalls to Avoid

### 1. Grouping Before Pagination
```tsx
// ❌ Bad - groups ALL items, then paginates
const grouped = groupByDate(allItems);
const { visibleItems } = useInfiniteScrollList(Object.values(grouped).flat());

// ✅ Good - paginates first, then groups visible items
const { visibleItems } = useInfiniteScrollList(allItems);
const grouped = useMemo(() => groupByDate(visibleItems), [visibleItems]);
```

### 2. Forgetting to Check hasMore
```tsx
// ❌ Bad - always renders infinite scroll
<IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
  <IonInfiniteScrollContent />
</IonInfiniteScroll>

// ✅ Good - conditionally renders based on hasMore
{hasMore && (
  <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
    <IonInfiniteScrollContent />
  </IonInfiniteScroll>
)}
```

### 3. Not Memoizing Grouped Data
```tsx
// ❌ Bad - recalculates on every render
const grouped = groupByDate(visibleItems);

// ✅ Good - memoizes the grouping
const grouped = useMemo(() => groupByDate(visibleItems), [visibleItems]);
```

---

## 📝 Documentation Updates

When adding new shared components:
1. Update `SHARED_LIST_COMPONENTS.md` with usage examples
2. Update this file with reminders
3. Export from appropriate index files
4. Add TypeScript types/interfaces
5. Write basic tests

---

## 🔄 Migration Path

If you encounter old list implementations:

1. **Identify the pattern**: Loading? Empty? Pagination?
2. **Check for shared component**: Review `docs/SHARED_LIST_COMPONENTS.md`
3. **Refactor to use shared**: Replace custom implementation
4. **Test thoroughly**: Ensure behavior is preserved
5. **Remove old code**: Delete custom styled components and logic

---

## 💡 Pro Tips

1. **Read the full documentation**: `docs/SHARED_LIST_COMPONENTS.md` has comprehensive examples
2. **Check existing implementations**: Look at `SpendList` and `AiInsightsListPage` for reference
3. **Start with shared components**: Don't reinvent the wheel
4. **Ask questions**: If unsure, check the documentation or ask the team

---

## 📚 Key Documentation Files

- `docs/SHARED_LIST_COMPONENTS.md` - Full guide for list components
- `CLAUDE.md` - Project-specific guidance
- `src/hooks/ui/useInfiniteScrollList.ts` - Hook implementation
- `src/components/shared/list/` - Shared list components

---

## ✨ Future Improvements

Ideas for enhancing shared components (add to backlog):
- [ ] Add virtualization support for very large lists (1000+ items)
- [ ] Create shared filter/search bar component
- [ ] Add skeleton loading states
- [ ] Create shared pull-to-refresh component
- [ ] Add accessibility improvements (ARIA labels, keyboard navigation)

---

## 🎯 Quick Reference

**Building a new list page? Use this checklist:**

1. [ ] Import `useInfiniteScrollList` from `@/hooks/ui`
2. [ ] Import `LoadingState`, `EmptyState`, `DateSeparator` from `@/components/shared`
3. [ ] Fetch your data with a query hook
4. [ ] Pass data to `useInfiniteScrollList`
5. [ ] Use `visibleItems` for rendering
6. [ ] Group with `useMemo` if needed
7. [ ] Render `LoadingState` for loading
8. [ ] Render `EmptyState` for empty
9. [ ] Render `DateSeparator` for date groups
10. [ ] Add `IonInfiniteScroll` with `hasMore` check

---

**Last Updated**: December 3, 2025
**Created By**: Claude Code (Hybrid Approach Implementation)
**Review Frequency**: Every major list feature addition
