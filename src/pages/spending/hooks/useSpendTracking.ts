import type { ISpend } from '@/domain/Spend';
import useFormatters from '@/hooks/ui/useFormatters';
import { useMemo } from 'react';

const groupSpendingByDate = (
  spendingItems: ISpend[],
  formatDate: (date: Date, format?: boolean) => string,
) => {
  const groups = spendingItems.reduce(
    (acc, spend) => {
      const dateKey = formatDate(spend.date, true);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(spend);
      return acc;
    },
    {} as Record<string, ISpend[]>,
  );

  // Custom sort function to handle "Today" and "Yesterday"
  return Object.entries(groups).sort((a, b) => {
    if (a[0] === 'Today') return -1;
    if (b[0] === 'Today') return 1;
    if (a[0] === 'Yesterday') return -1;
    if (b[0] === 'Yesterday') return 1;
    return new Date(b[0]).getTime() - new Date(a[0]).getTime();
  });
};

export const useSpendTracking = (spending: ISpend[]) => {
  const { formatDate } = useFormatters();

  const { currentSpending, futureSpending } = useMemo(() => {
    const currentSpending = spending.filter((spend) => spend.date <= new Date());
    const futureSpending = spending.filter((spend) => spend.date > new Date());
    return { currentSpending, futureSpending };
  }, [spending]);

  const groupedSpending = useMemo(() => {
    return groupSpendingByDate(currentSpending, formatDate);
  }, [currentSpending, formatDate]);

  return {
    currentSpending,
    futureSpending,
    groupedSpending,
  };
};
