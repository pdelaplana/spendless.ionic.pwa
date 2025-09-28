import { Currency } from '@/domain/Currencies';
import { SectionLabel } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonNote } from '@ionic/react';
import { calendarOutline, pencilOutline } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { PeriodFormData } from '../hooks/useMultiStepForm';

const ReviewSection = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  padding-left: 16px;
  padding-right: 16px;
`;

const SummaryCard = styled.div`
  background: ${designSystem.colors.surface};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  margin-bottom: ${designSystem.spacing.md};
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${designSystem.spacing.md};
`;

const SummaryTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin: 0;
`;

const EditButton = styled(IonButton)`
  --color: ${designSystem.colors.primary[600]};
  --padding-start: ${designSystem.spacing.sm};
  --padding-end: ${designSystem.spacing.sm};
`;

const DateRange = styled.div`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.secondary};
  margin-bottom: ${designSystem.spacing.sm};
`;

const Goals = styled.div`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.primary};
  line-height: ${designSystem.typography.lineHeight.relaxed};
  background: ${designSystem.colors.gray[50]};
  padding: ${designSystem.spacing.md};
  border-radius: ${designSystem.borderRadius.md};
`;

const WalletsList = styled.div`
  margin-bottom: ${designSystem.spacing.md};
`;

const WalletItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${designSystem.spacing.sm} 0;
  border-bottom: 1px solid ${designSystem.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`;

const WalletName = styled.div`
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.primary};
`;

const WalletAmount = styled.div`
  color: ${designSystem.colors.primary[600]};
  font-weight: ${designSystem.typography.fontWeight.semibold};
`;

const WalletBadge = styled.span`
  background: ${designSystem.colors.primary[100]};
  color: ${designSystem.colors.primary[700]};
  padding: ${designSystem.spacing.xs} ${designSystem.spacing.sm};
  border-radius: ${designSystem.borderRadius.full};
  font-size: ${designSystem.typography.fontSize.xs};
  font-weight: ${designSystem.typography.fontWeight.medium};
  margin-left: ${designSystem.spacing.sm};
`;

const TotalBudgetCard = styled.div`
  background: ${designSystem.colors.primary[50]};
  border: 2px solid ${designSystem.colors.primary[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  text-align: center;
`;

const TotalLabel = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  margin-bottom: ${designSystem.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

const TotalAmount = styled.div`
  font-size: ${designSystem.typography.fontSize['3xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.primary[600]};
  margin-bottom: ${designSystem.spacing.xs};
`;

const PeriodDuration = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
`;

const ExpenseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${designSystem.spacing.sm} 0;
  border-bottom: 1px solid ${designSystem.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`;

const ExpenseInfo = styled.div`
  flex: 1;
`;

const ExpenseDescription = styled.div`
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const ExpenseDate = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
`;

const ExpenseAmount = styled.div`
  color: ${designSystem.colors.primary[600]};
  font-weight: ${designSystem.typography.fontWeight.semibold};
`;

const EmptyExpenses = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.lg};
  color: ${designSystem.colors.text.secondary};
  font-style: italic;
`;

interface StepReviewProps {
  formData: PeriodFormData;
  totalBudget: number;
  onEditStep: (step: 0 | 1 | 2) => void;
}

const StepReview: React.FC<StepReviewProps> = ({ formData, totalBudget, onEditStep }) => {
  const { t } = useTranslation();
  const currency = Currency.USD; // TODO: Get from user preferences

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculatePeriodDays = () => {
    const start = new Date(formData.startAt);
    const end = new Date(formData.endAt);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const periodDays = calculatePeriodDays();

  return (
    <>
      {/* Period Summary */}
      <ReviewSection>
        <SummaryCard>
          <SummaryHeader>
            <SummaryTitle>Period Overview</SummaryTitle>
            <EditButton fill='clear' size='small' onClick={() => onEditStep(0)}>
              <IonIcon icon={pencilOutline} slot='start' />
              Edit
            </EditButton>
          </SummaryHeader>

          <DateRange>
            {formatDate(formData.startAt)} - {formatDate(formData.endAt)}
          </DateRange>

          <Goals>{formData.goals}</Goals>
        </SummaryCard>
      </ReviewSection>

      {/* Wallets Summary */}
      <ReviewSection>
        <SummaryCard>
          <SummaryHeader>
            <SummaryTitle>Wallets ({formData.wallets.length})</SummaryTitle>
            <EditButton fill='clear' size='small' onClick={() => onEditStep(1)}>
              <IonIcon icon={pencilOutline} slot='start' />
              Edit
            </EditButton>
          </SummaryHeader>

          <WalletsList>
            {formData.wallets.map((wallet) => (
              <WalletItem key={wallet.id}>
                <div>
                  <WalletName>
                    {wallet.name}
                    {wallet.isDefault && <WalletBadge>Default</WalletBadge>}
                  </WalletName>
                </div>
                <WalletAmount>
                  {currency.format(Number.parseFloat(wallet.spendingLimit))}
                </WalletAmount>
              </WalletItem>
            ))}
          </WalletsList>
        </SummaryCard>
      </ReviewSection>

      {/* Recurring Expenses Summary */}
      <ReviewSection>
        <SummaryCard>
          <SummaryHeader>
            <SummaryTitle>Recurring Expenses ({formData.recurringExpenses.length})</SummaryTitle>
            <EditButton fill='clear' size='small' onClick={() => onEditStep(2)}>
              <IonIcon icon={pencilOutline} slot='start' />
              Edit
            </EditButton>
          </SummaryHeader>

          {formData.recurringExpenses.length > 0 ? (
            <>
              {formData.recurringExpenses.map((expense) => (
                <ExpenseItem key={expense.id}>
                  <ExpenseInfo>
                    <ExpenseDescription>{expense.description}</ExpenseDescription>
                    <ExpenseDate>
                      <IonIcon icon={calendarOutline} />
                      {formatDate(expense.originalDate.toISOString().split('T')[0])} → {formatDate(expense.newDate.toISOString().split('T')[0])}
                    </ExpenseDate>
                  </ExpenseInfo>
                  <ExpenseAmount>
                    {currency.format(expense.amount)}
                  </ExpenseAmount>
                </ExpenseItem>
              ))}
              <IonNote style={{ marginTop: designSystem.spacing.md, display: 'block' }}>
                These expenses will be automatically added to your new period with updated dates.
              </IonNote>
            </>
          ) : (
            <EmptyExpenses>
              No recurring expenses will be copied to this period.
            </EmptyExpenses>
          )}
        </SummaryCard>
      </ReviewSection>

      {/* Total Budget */}
      <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        <TotalBudgetCard>
          <TotalLabel>Total Period Budget</TotalLabel>
          <TotalAmount>{currency.format(totalBudget)}</TotalAmount>
          <PeriodDuration>
            {periodDays} day{periodDays !== 1 ? 's' : ''} •
            {currency.format(totalBudget / periodDays)} per day average
          </PeriodDuration>
          <IonNote style={{ marginTop: designSystem.spacing.sm, display: 'block' }}>
            This budget will be distributed across your wallets and tracked throughout the period.
          </IonNote>
        </TotalBudgetCard>
      </div>
    </>
  );
};

export default StepReview;
