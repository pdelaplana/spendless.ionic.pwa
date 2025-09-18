import { StyledItem, TagsDisplay } from '@/components/shared';
import type { ISpend } from '@/domain/Spend';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { StyledItemDivider } from '@/styles/IonList.styled';
import { GroupedTransactionsContainer } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonItemGroup, IonLabel, IonSpinner } from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
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
} from './SpendList.styled';

interface SpendListProps {
  spending: ISpend[];
  groupedSpending: [string, ISpend[]][];
  isLoading?: boolean;
  error?: string;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onSpendClick?: (spend: ISpend) => void;
  onRetry?: () => void;
  className?: string;
}

const SpendList: React.FC<SpendListProps> = ({
  spending,
  groupedSpending,
  isLoading,
  error,
  hasNextPage,
  onLoadMore,
  onSpendClick,
  onRetry,
  className,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const { account } = useSpendingAccount();

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

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
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
      <SpendListHeader>Spending</SpendListHeader>
      <SpendListContent>
        <div>
          <GroupedTransactionsContainer lines='none' style={{ backgroundColor: 'transparent' }}>
            {groupedSpending.map(([date, spends]) => (
              <IonItemGroup key={date}>
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
                    <SpendIcon category={spend.category} />
                    <IonLabel>
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
              </IonItemGroup>
            ))}
          </GroupedTransactionsContainer>

          {hasNextPage && (
            <div style={{ padding: `${designSystem.spacing.md}` }}>
              <IonButton onClick={handleLoadMore} color='primary' fill='clear' expand='full'>
                {t('spending.loadMore')}
              </IonButton>
            </div>
          )}
        </div>
      </SpendListContent>
    </SpendListContainer>
  );
};

export default SpendList;
