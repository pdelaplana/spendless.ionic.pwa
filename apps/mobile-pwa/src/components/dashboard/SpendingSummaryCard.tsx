import { Card } from '@/components/ui';
import { designSystem } from '@/theme/designSystem';
import { IonProgressBar } from '@ionic/react';
import styled from 'styled-components';

interface SpendingSummaryCardProps {
  totalSpent: number;
  totalBudget: number;
  currency?: string;
  periodLabel?: string;
  remainingBudget?: number;
  isOverBudget?: boolean;
}

const SummaryCardContainer = styled(Card)`
  background: ${designSystem.colors.surface};
  text-align: center;
  padding: ${designSystem.spacing.xl};
  margin: ${designSystem.spacing.md} ${designSystem.spacing.md} ${designSystem.spacing.lg} ${designSystem.spacing.md};
`;

const PeriodLabel = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.secondary};
  margin: 0 0 ${designSystem.spacing.sm} 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TotalSpentAmount = styled.h1<{ isOverBudget: boolean }>`
  font-size: ${designSystem.typography.fontSize['3xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${(props) =>
    props.isOverBudget ? designSystem.colors.danger : designSystem.colors.text.primary};
  margin: 0 0 ${designSystem.spacing.xs} 0;
  line-height: ${designSystem.typography.lineHeight.tight};
`;

const RemainingBudgetLabel = styled.p<{ isOverBudget: boolean }>`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${(props) =>
    props.isOverBudget ? designSystem.colors.danger : designSystem.colors.text.secondary};
  margin: 0 0 ${designSystem.spacing.lg} 0;
`;

const ProgressBarContainer = styled.div`
  margin: ${designSystem.spacing.lg} 0;
`;

const StyledProgressBar = styled(IonProgressBar)<{ isOverBudget: boolean }>`
  height: 8px;
  border-radius: 4px;
  background: ${designSystem.colors.gray[200]};
  
  --progress-background: ${(props) =>
    props.isOverBudget ? designSystem.colors.danger : designSystem.colors.primary[500]};
`;

const BudgetInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${designSystem.spacing.md};
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
`;

const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const SpendingSummaryCard: React.FC<SpendingSummaryCardProps> = ({
  totalSpent = 0,
  totalBudget = 0,
  currency = 'USD',
  periodLabel = 'Total spending',
  remainingBudget,
  isOverBudget = false,
}) => {
  const safeSpent = totalSpent || 0;
  const safeBudget = totalBudget || 0;

  const progressValue = safeBudget > 0 ? Math.min(safeSpent / safeBudget, 1) : 0;
  const calculatedRemaining = remainingBudget ?? safeBudget - safeSpent;
  const actuallyOverBudget = isOverBudget || calculatedRemaining < 0;

  return (
    <SummaryCardContainer variant='elevated'>
      <PeriodLabel>{periodLabel}</PeriodLabel>

      <TotalSpentAmount isOverBudget={actuallyOverBudget}>
        {formatCurrency(safeSpent, currency)}
      </TotalSpentAmount>

      {safeBudget > 0 && (
        <RemainingBudgetLabel isOverBudget={actuallyOverBudget}>
          {actuallyOverBudget ? 'Over budget by' : 'Available'}{' '}
          {formatCurrency(Math.abs(calculatedRemaining), currency)}
        </RemainingBudgetLabel>
      )}

      {safeBudget > 0 && (
        <ProgressBarContainer>
          <StyledProgressBar value={progressValue} isOverBudget={actuallyOverBudget} />
          <BudgetInfo>
            <span>Spent: {formatCurrency(safeSpent, currency)}</span>
            <span>Budget: {formatCurrency(safeBudget, currency)}</span>
          </BudgetInfo>
        </ProgressBarContainer>
      )}
    </SummaryCardContainer>
  );
};

// Quick Stats Cards for additional metrics
interface QuickStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

const QuickStatContainer = styled(Card)<{ clickable: boolean }>`
  text-align: center;
  padding: ${designSystem.spacing.lg};
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${designSystem.shadows.lg};
    }
  `}
`;

const StatTitle = styled.h4`
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.secondary};
  margin: 0 0 ${designSystem.spacing.xs} 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: ${designSystem.typography.fontSize.xl};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin: 0;
`;

const StatSubtitle = styled.p`
  font-size: ${designSystem.typography.fontSize.xs};
  color: ${designSystem.colors.text.secondary};
  margin: ${designSystem.spacing.xs} 0 0 0;
`;

export const QuickStatCard: React.FC<QuickStatCardProps> = ({
  title,
  value,
  subtitle,
  onClick,
}) => {
  return (
    <QuickStatContainer variant='default' clickable={!!onClick} onClick={onClick}>
      <StatTitle>{title}</StatTitle>
      <StatValue>{value}</StatValue>
      {subtitle && <StatSubtitle>{subtitle}</StatSubtitle>}
    </QuickStatContainer>
  );
};

// Stats Grid for multiple quick stats
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

const GridContainer = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, 1fr);
  gap: ${designSystem.spacing.md};
  margin: ${designSystem.spacing.md};
`;

export const StatsGrid: React.FC<StatsGridProps> = ({ children, columns = 2 }) => {
  return <GridContainer columns={columns}>{children}</GridContainer>;
};
