import type { ISpend } from '@/domain/Spend';
import useFormatters from '@/hooks/ui/useFormatters';
import { TransparentIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import type React from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';
import TagSpendingListItem, { type TagSpendingData } from './TagSpendingListItem';

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${designSystem.spacing.xl};
  color: ${designSystem.colors.text.secondary};
  text-align: center;
`;

interface TagSpendingListProps {
  currentPeriodSpending: ISpend[];
  previousPeriodSpending: ISpend[];
  currency?: string;
  onTagClick: (tagName: string) => void;
}

const TagSpendingList: React.FC<TagSpendingListProps> = ({
  currentPeriodSpending,
  previousPeriodSpending,
  currency,
  onTagClick,
}) => {
  const { formatCurrency } = useFormatters();

  const tagSpendingData = useMemo(() => {
    // Calculate current period tag totals
    const currentTagTotals = new Map<string, number>();
    for (const spend of currentPeriodSpending) {
      if (spend.tags && spend.tags.length > 0) {
        for (const tag of spend.tags) {
          const currentTotal = currentTagTotals.get(tag) || 0;
          currentTagTotals.set(tag, currentTotal + spend.amount);
        }
      }
    }

    // Calculate previous period tag totals
    const previousTagTotals = new Map<string, number>();
    for (const spend of previousPeriodSpending) {
      if (spend.tags && spend.tags.length > 0) {
        for (const tag of spend.tags) {
          const currentTotal = previousTagTotals.get(tag) || 0;
          previousTagTotals.set(tag, currentTotal + spend.amount);
        }
      }
    }

    // Calculate total current period spend
    const totalCurrentSpend = currentPeriodSpending.reduce((sum, spend) => sum + spend.amount, 0);

    // Build tag spending data array
    const tagData: TagSpendingData[] = Array.from(currentTagTotals.entries()).map(
      ([tagName, currentAmount]) => ({
        tagName,
        currentAmount,
        previousAmount: previousTagTotals.get(tagName) || 0,
        percentageOfTotal: totalCurrentSpend > 0 ? (currentAmount / totalCurrentSpend) * 100 : 0,
      }),
    );

    // Sort by current amount (descending)
    return tagData.sort((a, b) => b.currentAmount - a.currentAmount);
  }, [currentPeriodSpending, previousPeriodSpending]);

  const formatCurrencyWithSymbol = (amount: number) => formatCurrency(amount, currency);

  if (tagSpendingData.length === 0) {
    return (
      <EmptyState>
        <h3>No tags found</h3>
        <p>Start tagging your spending transactions to see analysis here</p>
      </EmptyState>
    );
  }

  return (
    <TransparentIonList lines='full'>
      {tagSpendingData.map((tagData) => (
        <TagSpendingListItem
          key={tagData.tagName}
          tagData={tagData}
          onClick={onTagClick}
          formatCurrency={formatCurrencyWithSymbol}
        />
      ))}
    </TransparentIonList>
  );
};

export default TagSpendingList;
