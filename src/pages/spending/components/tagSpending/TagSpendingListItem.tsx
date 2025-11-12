import { DifferenceIndicator, IconContainer } from '@/components/shared';
import useFormatters from '@/hooks/ui/useFormatters';
import { StyledItem } from '@/styles/IonList.styled';
import { IonLabel, IonProgressBar } from '@ionic/react';
import { pricetag } from 'ionicons/icons';
import type React from 'react';
import styled from 'styled-components';

const ProgressBarContainer = styled.div`
  margin: 8px 0;
`;

const AmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 14px;
`;

const AmountLabel = styled.span`
  color: var(--ion-color-medium);
  font-size: 13px;
`;

const AmountValue = styled.span`
  font-weight: 600;
  color: var(--ion-color-dark);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NewBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--ion-color-primary);
  background: rgba(139, 95, 191, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
`;

export interface TagSpendingData {
  tagName: string;
  currentAmount: number;
  previousAmount: number;
  percentageOfTotal: number;
}

interface TagSpendingListItemProps {
  tagData: TagSpendingData;
  onClick: (tagName: string) => void;
  formatCurrency: (amount: number) => string;
}

const TagSpendingListItem: React.FC<TagSpendingListItemProps> = ({
  tagData,
  onClick,
  formatCurrency,
}) => {
  const { tagName, currentAmount, previousAmount, percentageOfTotal } = tagData;

  const handleClick = () => {
    onClick(tagName);
  };

  const getProgressColor = (): 'primary' | 'warning' | 'danger' => {
    if (percentageOfTotal <= 20) return 'primary';
    if (percentageOfTotal <= 40) return 'warning';
    return 'danger';
  };

  const difference = currentAmount - previousAmount;
  const isIncrease = difference > 0;
  const isNew = previousAmount === 0;

  return (
    <StyledItem button detail onClick={handleClick}>
      <div slot='start' style={{ marginRight: '0px' }}>
        <IconContainer icon={pricetag} bgColor='rgba(139, 95, 191, 0.1)' iconColor='#8B5FBF' />
      </div>

      <IonLabel>
        <h2 style={{ marginLeft: 0 }}>{tagName?.toLocaleUpperCase()}</h2>

        <ProgressBarContainer>
          <IonProgressBar value={Math.min(percentageOfTotal / 100, 1)} color={getProgressColor()} />
        </ProgressBarContainer>

        <AmountRow>
          <AmountLabel>Current</AmountLabel>
          <AmountValue>
            {!isNew && difference !== 0 && <DifferenceIndicator increase={isIncrease} />}
            {isNew && <NewBadge>New</NewBadge>}
            {formatCurrency(currentAmount)}
          </AmountValue>
        </AmountRow>

        <AmountRow>
          <AmountLabel>Previous</AmountLabel>
          <AmountValue>{isNew ? '-' : formatCurrency(previousAmount)}</AmountValue>
        </AmountRow>
      </IonLabel>
    </StyledItem>
  );
};

export default TagSpendingListItem;
