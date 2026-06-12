import { useEffect, useMemo, useRef, useState } from 'react';

interface UseInfiniteScrollListOptions {
  itemsPerPage?: number;
  autoLoadMore?: boolean;
}

interface UseInfiniteScrollListReturn<T> {
  displayCount: number;
  isLoadingMore: boolean;
  hasMore: boolean;
  visibleItems: T[];
  handleInfiniteScroll: (ev: CustomEvent<void>) => Promise<void>;
  resetPagination: () => void;
}

/**
 * Custom hook for managing infinite scroll pagination in list views
 * @param items - Array of items to paginate
 * @param options - Configuration options
 * @returns Pagination state and handlers
 */
export function useInfiniteScrollList<T>(
  items: T[],
  options: UseInfiniteScrollListOptions = {},
): UseInfiniteScrollListReturn<T> {
  const { itemsPerPage = 10, autoLoadMore = true } = options;

  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const previousDisplayCountRef = useRef(itemsPerPage);

  // Reset display count when items array changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset when items array reference changes
  useEffect(() => {
    setDisplayCount(itemsPerPage);
    previousDisplayCountRef.current = itemsPerPage;
  }, [items]);

  // Get visible items based on display count
  const visibleItems = useMemo(() => {
    return items.slice(0, displayCount);
  }, [items, displayCount]);

  const hasMore = displayCount < items.length;

  // Auto-load more if content doesn't fill viewport and there's more data
  useEffect(() => {
    if (!hasMore || isLoadingMore || !autoLoadMore) return;

    const checkAndLoadMore = async () => {
      // Find the ion-content element
      const ionContent = document.querySelector('ion-content');
      if (!ionContent) return;

      const scrollElement = await ionContent.getScrollElement();

      // Check if content is scrollable
      const isScrollable = scrollElement.scrollHeight > scrollElement.clientHeight;

      if (!isScrollable && hasMore) {
        setIsLoadingMore(true);
        await new Promise((resolve) => setTimeout(resolve, 100));

        previousDisplayCountRef.current = displayCount;
        const newDisplayCount = Math.min(displayCount + itemsPerPage, items.length);
        setDisplayCount(newDisplayCount);

        setIsLoadingMore(false);
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(checkAndLoadMore, 300);
    return () => clearTimeout(timer);
  }, [displayCount, hasMore, isLoadingMore, items.length, itemsPerPage, autoLoadMore]);

  const handleInfiniteScroll = async (ev: CustomEvent<void>) => {
    setIsLoadingMore(true);

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 300));

    previousDisplayCountRef.current = displayCount;
    const newDisplayCount = Math.min(displayCount + itemsPerPage, items.length);
    setDisplayCount(newDisplayCount);

    setIsLoadingMore(false);

    (ev.target as HTMLIonInfiniteScrollElement).complete();
  };

  const resetPagination = () => {
    setDisplayCount(itemsPerPage);
    previousDisplayCountRef.current = itemsPerPage;
  };

  return {
    displayCount,
    isLoadingMore,
    hasMore,
    visibleItems,
    handleInfiniteScroll,
    resetPagination,
  };
}
