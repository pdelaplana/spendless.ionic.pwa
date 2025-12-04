# Shared List Components Guide

This guide covers the shared list components and hooks available for building consistent, paginated list views in the Spendless application.

## Table of Contents

- [Overview](#overview)
- [When to Use](#when-to-use)
- [Available Components](#available-components)
- [Available Hooks](#available-hooks)
- [Usage Examples](#usage-examples)
- [Migration Guide](#migration-guide)

## Overview

To ensure consistency across list views and reduce code duplication, we've created shared components and hooks that handle common list patterns:

- **Infinite scroll pagination**
- **Loading states**
- **Empty states**
- **Date separators**

All list pages should use these shared components instead of creating custom implementations.

## When to Use

**Use these shared components when:**
- ✅ Building any list view (transactions, insights, notifications, etc.)
- ✅ Implementing infinite scroll pagination
- ✅ Showing loading or empty states
- ✅ Grouping items by date

**Examples of pages that should use these:**
- Transaction lists
- AI insights lists
- Notification lists
- Activity feeds
- Search results
- Any paginated data view

## Available Components

### DateSeparator

Displays a date header for grouped list items.

**Location**: `src/components/shared/list/DateSeparator.tsx`

**Props**:
```typescript
interface DateSeparatorProps {
  date: string;         // The date string to display
  className?: string;   // Optional CSS class
}
```

**Example**:
```tsx
import { DateSeparator } from '@/components/shared';

<DateSeparator date="Today" />
<DateSeparator date="December 3, 2025" />
```

**Styling**:
- Uppercase text with letter spacing
- Secondary text color
- Consistent spacing (XL top, MD bottom)
- First child has no top margin

---

### LoadingState

Displays a loading spinner with optional message.

**Location**: `src/components/shared/list/LoadingState.tsx`

**Props**:
```typescript
interface LoadingStateProps {
  message?: string;     // Optional loading message
  className?: string;   // Optional CSS class
}
```

**Example**:
```tsx
import { LoadingState } from '@/components/shared';

// With message
<LoadingState message="Loading your data..." />

// Without message
<LoadingState />
```

**Styling**:
- Centered layout
- Crescent spinner
- XL padding
- Flex column with MD gap

---

### EmptyState

Displays an empty state with icon, title, description, and optional action.

**Location**: `src/components/shared/list/EmptyState.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  icon?: string;              // Ionicon name
  title: string;              // Main heading (required)
  description?: string;       // Subtext
  action?: React.ReactNode;   // Optional action button/element
  className?: string;         // Optional CSS class
}
```

**Example**:
```tsx
import { EmptyState } from '@/components/shared';
import { sparklesOutline } from 'ionicons/icons';
import { IonButton } from '@ionic/react';

// Full example with all props
<EmptyState
  icon={sparklesOutline}
  title="No insights yet"
  description="AI insights will appear here after your first check-in"
  action={
    <IonButton onClick={handleAction}>
      Generate First Insight
    </IonButton>
  }
/>

// Minimal example
<EmptyState title="No items found" />
```

**Styling**:
- Centered text alignment
- Large icon (4rem)
- Gray icon color
- Primary text for title
- Secondary text for description
- XL/LG padding

## Available Hooks

### useInfiniteScrollList

Manages infinite scroll pagination for list views.

**Location**: `src/hooks/ui/useInfiniteScrollList.ts`

**Type Signature**:
```typescript
function useInfiniteScrollList<T>(
  items: T[],
  options?: UseInfiniteScrollListOptions
): UseInfiniteScrollListReturn<T>

interface UseInfiniteScrollListOptions {
  itemsPerPage?: number;    // Default: 10
  autoLoadMore?: boolean;   // Default: true
}

interface UseInfiniteScrollListReturn<T> {
  displayCount: number;                              // Current number of items to display
  isLoadingMore: boolean;                            // Loading state
  hasMore: boolean;                                  // Whether more items exist
  visibleItems: T[];                                 // Currently visible items
  handleInfiniteScroll: (ev: CustomEvent<void>) => Promise<void>;  // Scroll handler
  resetPagination: () => void;                       // Reset to first page
}
```

**Features**:
- ✅ Automatic pagination state management
- ✅ Auto-loads content if viewport isn't filled
- ✅ Resets when items array changes
- ✅ Provides scroll event handler
- ✅ Fully typed with TypeScript

**Example**:
```tsx
import { useInfiniteScrollList } from '@/hooks/ui';
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';

function MyListPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);

  // Use the hook
  const {
    visibleItems,
    hasMore,
    handleInfiniteScroll,
    resetPagination,
  } = useInfiniteScrollList(allItems, {
    itemsPerPage: 20,  // Optional: default is 10
  });

  return (
    <>
      {/* Render visible items */}
      {visibleItems.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}

      {/* Infinite scroll */}
      {hasMore && (
        <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
          <IonInfiniteScrollContent loadingText="Loading more..." />
        </IonInfiniteScroll>
      )}
    </>
  );
}
```

## Usage Examples

### Example 1: Basic List with Infinite Scroll

```tsx
import { useInfiniteScrollList } from '@/hooks/ui';
import { LoadingState, EmptyState } from '@/components/shared';
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';

function TransactionListPage() {
  const { data: transactions = [], isLoading } = useTransactions();

  const { visibleItems, hasMore, handleInfiniteScroll } = useInfiniteScrollList(
    transactions
  );

  if (isLoading) {
    return <LoadingState message="Loading transactions..." />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={walletOutline}
        title="No transactions yet"
        description="Your transactions will appear here"
      />
    );
  }

  return (
    <>
      {visibleItems.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} />
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

### Example 2: Grouped List with Date Separators

```tsx
import { useInfiniteScrollList } from '@/hooks/ui';
import { DateSeparator, LoadingState, EmptyState } from '@/components/shared';
import { useMemo } from 'react';

function GroupedTransactionList() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { formatDate } = useFormatters();

  // Paginate first, then group
  const { visibleItems, hasMore, handleInfiniteScroll } = useInfiniteScrollList(
    transactions
  );

  // Group visible items by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    for (const transaction of visibleItems) {
      const dateKey = formatDate(transaction.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    }

    return groups;
  }, [visibleItems, formatDate]);

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (transactions.length === 0) {
    return <EmptyState title="No transactions" />;
  }

  return (
    <>
      {Object.entries(groupedTransactions).map(([date, items]) => (
        <div key={date}>
          <DateSeparator date={date} />
          {items.map(item => (
            <TransactionCard key={item.id} transaction={item} />
          ))}
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

### Example 3: Custom Items Per Page

```tsx
import { useInfiniteScrollList } from '@/hooks/ui';

function LargeDataList() {
  const { data: items = [] } = useLargeDataset();

  // Load 50 items at a time for better performance
  const { visibleItems, hasMore, handleInfiniteScroll } = useInfiniteScrollList(
    items,
    {
      itemsPerPage: 50,
      autoLoadMore: false,  // Disable auto-loading
    }
  );

  return (
    <>
      {visibleItems.map(item => (
        <ItemCard key={item.id} item={item} />
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

## Migration Guide

### Before: Custom Pagination

```tsx
// ❌ Old way - manual state management
const [displayCount, setDisplayCount] = useState(10);
const [isLoadingMore, setIsLoadingMore] = useState(false);

const handleLoadMore = async () => {
  setIsLoadingMore(true);
  await new Promise(resolve => setTimeout(resolve, 300));
  setDisplayCount(prev => prev + 10);
  setIsLoadingMore(false);
};

const visibleItems = items.slice(0, displayCount);
const hasMore = displayCount < items.length;
```

### After: Shared Hook

```tsx
// ✅ New way - use the hook
const { visibleItems, hasMore, handleInfiniteScroll } = useInfiniteScrollList(items);
```

### Before: Custom Empty State

```tsx
// ❌ Old way - custom styled components
const EmptyContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--ion-color-primary);
`;

<EmptyContainer>
  <EmptyTitle>No items found</EmptyTitle>
  <p>Try adjusting your filters</p>
</EmptyContainer>
```

### After: Shared Component

```tsx
// ✅ New way - use shared component
<EmptyState
  title="No items found"
  description="Try adjusting your filters"
/>
```

## Best Practices

### ✅ DO

- **Use shared components** for all list views
- **Keep domain-specific rendering** (card layouts, item designs)
- **Group after pagination** for better performance
- **Memoize grouping logic** with useMemo
- **Reset pagination** when filters change

### ❌ DON'T

- **Don't create custom pagination logic** - use the hook
- **Don't create custom loading states** - use LoadingState
- **Don't create custom empty states** - use EmptyState
- **Don't group before pagination** - it's inefficient
- **Don't forget to check hasMore** before showing IonInfiniteScroll

## Performance Tips

1. **Use proper keys**: Always use unique IDs for list items
   ```tsx
   {items.map(item => <Card key={item.id} />)}
   ```

2. **Memoize expensive computations**: Use useMemo for grouping
   ```tsx
   const grouped = useMemo(() => groupByDate(items), [items]);
   ```

3. **Adjust itemsPerPage**: Balance between performance and UX
   - Small items (text): 20-50 per page
   - Medium items (cards): 10-20 per page
   - Large items (images): 5-10 per page

4. **Consider virtualization**: For very large lists (1000+ items), consider using react-window or similar

## Testing

When testing components that use these shared utilities:

```tsx
import { render, screen } from '@testing-library/react';
import { useInfiniteScrollList } from '@/hooks/ui';

// Mock the hook if needed
vi.mock('@/hooks/ui', () => ({
  useInfiniteScrollList: vi.fn(() => ({
    visibleItems: mockItems,
    hasMore: false,
    handleInfiniteScroll: vi.fn(),
  })),
}));
```

## Troubleshooting

### Issue: Items not loading

**Cause**: IonInfiniteScroll not triggering

**Solution**: Ensure you conditionally render based on `hasMore`:
```tsx
{hasMore && (
  <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
    <IonInfiniteScrollContent />
  </IonInfiniteScroll>
)}
```

### Issue: Pagination resets unexpectedly

**Cause**: Items array reference changes

**Solution**: This is by design. The hook resets when the items array changes. If you need to maintain pagination across data updates, keep the same array reference.

### Issue: Auto-loading too aggressive

**Cause**: Default auto-load behavior

**Solution**: Disable auto-loading:
```tsx
useInfiniteScrollList(items, { autoLoadMore: false })
```

## Related Documentation

- [Ionic Infinite Scroll](https://ionicframework.com/docs/api/infinite-scroll)
- [React Hooks](https://react.dev/reference/react)
- [Design System](./DESIGN_SYSTEM.md)

## Questions?

If you have questions or suggestions for improving these components, please:
1. Check existing implementations in `SpendList` and `AiInsightsListPage`
2. Review this documentation
3. Ask the team in #frontend channel
