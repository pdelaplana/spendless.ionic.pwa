import { StyledItem, TagsDisplay } from '@/components/shared';
import type { ISpend } from '@/domain/Spend';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { StyledItemDivider } from '@/styles/IonList.styled';
import { GroupedTransactionsContainer } from '@/theme/components';
import {
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItemGroup,
  IonLabel,
  IonSpinner,
} from '@ionic/react';
import { add, chevronForward } from 'ionicons/icons';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { StyledDateLabel, StyledTotalLabel } from '../../../styles/SpendingPage.styled';
import { SpendIcon } from '../../base';
import {
  EmptyContainer,
  EmptyMessage,
  ErrorContainer,
  ErrorMessage,
  LoadingContainer,
  RetryButton,
  SpendListContainer,
  SpendListContent,
  SpendListHeader,
  SpendListHeaderButton,
  SpendListHeaderTitle,
} from './SpendList.styled';

interface SpendListProps {
  spending: ISpend[];
  groupedSpending: [string, ISpend[]][];
  isLoading?: boolean;
  error?: string;
  onSpendClick?: (spend: ISpend) => void;
  onRetry?: () => void;
  onAddSpend?: () => void;
  className?: string;
}

const ITEMS_PER_PAGE = 10;

// Animated item group with fade-in effect
const AnimatedItemGroup = styled(IonItemGroup)<{ $isNew?: boolean }>`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${({ $isNew }) =>
    $isNew &&
    `
    animation: fadeInUp 0.3s ease-out;
  `}
`;

const SpendList: React.FC<SpendListProps> = ({
  spending,
  groupedSpending,
  isLoading,
  error,
  onSpendClick,
  onRetry,
  onAddSpend,
  className,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const { account } = useSpendingAccount();

  // Client-side pagination state for infinite scroll
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const previousDisplayCountRef = useRef(ITEMS_PER_PAGE);

  // Reset display count when spending data changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset when spending array reference changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
    previousDisplayCountRef.current = ITEMS_PER_PAGE;
  }, [spending]);

  // Get visible grouped spending based on display count
  const visibleGroupedSpending = useMemo(() => {
    let itemCount = 0;
    const visible: [string, ISpend[]][] = [];

    for (const [date, spends] of groupedSpending) {
      const remainingCount = displayCount - itemCount;
      if (remainingCount <= 0) break;

      if (spends.length <= remainingCount) {
        visible.push([date, spends]);
        itemCount += spends.length;
      } else {
        visible.push([date, spends.slice(0, remainingCount)]);
        itemCount += remainingCount;
      }
    }

    return visible;
  }, [groupedSpending, displayCount]);

  const hasMore = displayCount < spending.length;

  // Auto-load more if content doesn't fill viewport and there's more data
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

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
        const newDisplayCount = Math.min(displayCount + ITEMS_PER_PAGE, spending.length);
        setDisplayCount(newDisplayCount);

        setIsLoadingMore(false);
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(checkAndLoadMore, 300);
    return () => clearTimeout(timer);
  }, [displayCount, hasMore, isLoadingMore, spending.length]);

  const handleRetry = async () => {
    if (onRetry) {
      await onRetry();
    }
  };

  const handleSpendClick = (spend: ISpend) => {
    if (onSpendClick) {
      onSpendClick(spend);
    }
  };

  const handleInfiniteScroll = async (ev: CustomEvent<void>) => {
    setIsLoadingMore(true);

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 300));

    previousDisplayCountRef.current = displayCount;
    const newDisplayCount = Math.min(displayCount + ITEMS_PER_PAGE, spending.length);
    setDisplayCount(newDisplayCount);

    setIsLoadingMore(false);

    (ev.target as HTMLIonInfiniteScrollElement).complete();
  };

  if (isLoading) {
    return (
      <SpendListContainer className={className}>
        <LoadingContainer>
          <IonSpinner name='crescent' />
          <p style={{ marginTop: '12px', textAlign: 'center' }}>Loading</p>
        </LoadingContainer>
      </SpendListContainer>
    );
  }

  if (error) {
    return (
      <SpendListContainer className={className}>
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={handleRetry} aria-label='Retry loading spending' type='button'>
            Retry
          </RetryButton>
        </ErrorContainer>
      </SpendListContainer>
    );
  }

  if (spending.length === 0) {
    return (
      <SpendListContainer className={className}>
        <EmptyContainer>
          <EmptyMessage>No spending found for this period</EmptyMessage>
        </EmptyContainer>
      </SpendListContainer>
    );
  }

  return (
    <SpendListContainer className={className}>
      <SpendListHeader>
        <SpendListHeaderTitle>Spending</SpendListHeaderTitle>
        {onAddSpend && (
          <SpendListHeaderButton
            fill='clear'
            size='small'
            onClick={onAddSpend}
            aria-label='Add new spending'
          >
            <IonIcon slot='icon-only' icon={add} />
          </SpendListHeaderButton>
        )}
      </SpendListHeader>
      <SpendListContent>
        <GroupedTransactionsContainer lines='none' style={{ backgroundColor: 'transparent' }}>
          {visibleGroupedSpending.map(([date, spends], groupIndex) => {
            // Determine if this is a newly loaded group
            let itemCountUpToThisGroup = 0;
            for (let i = 0; i < groupIndex; i++) {
              itemCountUpToThisGroup += visibleGroupedSpending[i][1].length;
            }
            const isNewGroup = itemCountUpToThisGroup >= previousDisplayCountRef.current;

            return (
              <AnimatedItemGroup key={date} $isNew={isNewGroup}>
                <StyledItemDivider sticky>
                  <StyledDateLabel>{date}</StyledDateLabel>
                </StyledItemDivider>
                {spends.map((spend, index) => (
                  <StyledItem
                    key={spend.id}
                    onClick={() => handleSpendClick(spend)}
                    detail
                    detailIcon={chevronForward}
                    button
                    lines={index === spends.length - 1 ? 'none' : 'full'}
                  >
                    <SpendIcon spend={spend} />
                    <IonLabel style={{ marginTop: '6px' }}>
                      <h2>{spend.description}</h2>
                      <p>{t(`spending.categories.${spend.category}`)}</p>
                      <TagsDisplay tags={spend.tags} />
                    </IonLabel>
                    <IonLabel slot='end'>
                      {formatCurrency(spend.amount, account?.currency)}
                    </IonLabel>
                  </StyledItem>
                ))}
                <StyledItem lines='none' color='light'>
                  <StyledTotalLabel slot='end'>
                    {formatCurrency(
                      spends.reduce((sum, spend) => sum + spend.amount, 0),
                      account?.currency,
                    )}
                  </StyledTotalLabel>
                </StyledItem>
              </AnimatedItemGroup>
            );
          })}
        </GroupedTransactionsContainer>

        {hasMore && (
          <IonInfiniteScroll
            onIonInfinite={handleInfiniteScroll}
            threshold='100px'
            disabled={isLoadingMore}
          >
            <IonInfiniteScrollContent
              loadingSpinner='crescent'
              loadingText={t('spending.loadingMore') || 'Loading more...'}
            />
          </IonInfiniteScroll>
        )}
      </SpendListContent>
    </SpendListContainer>
  );
};

export default SpendList;
