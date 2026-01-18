import { Currency } from '@/domain/Currencies';
import {
  type IRecurringSpend,
  calculateOccurrencesInPeriod,
  getScheduleDescription,
} from '@/domain/RecurringSpend';
import { useFetchRecurringSpends } from '@/hooks/api';
import { SectionLabel } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonNote } from '@ionic/react';
import { calendarOutline, pencilOutline, repeatOutline, walletOutline } from 'ionicons/icons';
import type React from 'react';
import { useMemo } from 'react';
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

const RecurringGroup = styled.div`
  margin-bottom: ${designSystem.spacing.md};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.md};
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
`;

const RecurringHeader = styled.div`
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  background: ${designSystem.colors.gray[50]};
  border-bottom: 1px solid ${designSystem.colors.gray[200]};
`;

const RecurringTitle = styled.div`
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.primary};
  font-size: ${designSystem.typography.fontSize.sm};
`;

const RecurringMeta = styled.div`
  font-size: ${designSystem.typography.fontSize.xs};
  color: ${designSystem.colors.text.secondary};
  margin-top: ${designSystem.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
`;

const OccurrencesList = styled.div`
  background: ${designSystem.colors.surface};
  max-height: 120px;
  overflow-y: auto;
`;

const OccurrenceItem = styled.div`
  padding: ${designSystem.spacing.xs} ${designSystem.spacing.md};
  border-bottom: 1px solid ${designSystem.colors.gray[100]};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.xs};
  color: ${designSystem.colors.text.secondary};

  &:last-child {
    border-bottom: none;
  }
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
  accountId: string;
  onEditStep: (step: 0 | 1 | 2) => void;
}

const StepReview: React.FC<StepReviewProps> = ({
  formData,
  totalBudget,
  accountId,
  onEditStep,
}) => {
  const { t } = useTranslation();
  const currency = Currency.USD; // TODO: Get from user preferences

  // Fetch recurring spends
  const { data: recurringSpends = [] } = useFetchRecurringSpends(accountId);

  // Calculate all occurrences for each recurring spend within the new period
  const recurringExpensesWithOccurrences = useMemo(() => {
    if (!formData.startAt || !formData.endAt) return [];

    const periodStart = new Date(formData.startAt);
    const periodEnd = new Date(formData.endAt);

    return recurringSpends
      .filter((rs) => rs.isActive)
      .map((rs) => {
        const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);
        return {
          recurringSpend: rs,
          occurrences,
        };
      })
      .filter((item) => item.occurrences.length > 0);
  }, [recurringSpends, formData.startAt, formData.endAt]);

  const totalRecurringSpends = useMemo(() => {
    return recurringExpensesWithOccurrences.reduce((sum, item) => sum + item.occurrences.length, 0);
  }, [recurringExpensesWithOccurrences]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateObj = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get wallet name for a recurring spend
  const getWalletName = (recurringSpend: IRecurringSpend): string => {
    // Create wallet name map from formData.wallets (same logic as useGenerateRecurringSpends)
    const walletNameMap = new Map<string, string>();
    let defaultWalletName = '';

    for (const wallet of formData.wallets) {
      walletNameMap.set(wallet.name.toLowerCase().trim(), wallet.name);
      if (wallet.isDefault) {
        defaultWalletName = wallet.name;
      }
    }

    // For now, we can't easily look up the old wallet name from walletId
    // So we'll just use the default wallet or show "Wallet" as placeholder
    // The actual generation will map by name when it runs
    return defaultWalletName || 'Default Wallet';
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

      {/* Auto-Generated Recurring Expenses Summary */}
      <ReviewSection>
        <SummaryCard>
          <SummaryHeader>
            <SummaryTitle>Auto-Generated Spends ({totalRecurringSpends})</SummaryTitle>
            <EditButton fill='clear' size='small' onClick={() => onEditStep(2)}>
              <IonIcon icon={pencilOutline} slot='start' />
              View
            </EditButton>
          </SummaryHeader>

          {recurringExpensesWithOccurrences.length > 0 ? (
            <>
              {recurringExpensesWithOccurrences.map((item) => (
                <RecurringGroup key={item.recurringSpend.id}>
                  <RecurringHeader>
                    <RecurringTitle>
                      {item.recurringSpend.description} •{' '}
                      {currency.format(item.recurringSpend.amount)}
                    </RecurringTitle>
                    <RecurringMeta>
                      <IonIcon icon={walletOutline} style={{ fontSize: '12px' }} />
                      {getWalletName(item.recurringSpend)}
                    </RecurringMeta>
                  </RecurringHeader>
                  <OccurrencesList>
                    {item.occurrences.map((date) => (
                      <OccurrenceItem key={date.getTime()}>
                        <IonIcon icon={calendarOutline} style={{ fontSize: '12px' }} />
                        {formatDateObj(date)}
                      </OccurrenceItem>
                    ))}
                  </OccurrencesList>
                </RecurringGroup>
              ))}
              <IonNote style={{ marginTop: designSystem.spacing.md, display: 'block' }}>
                These {totalRecurringSpends} spend record{totalRecurringSpends !== 1 ? 's' : ''}{' '}
                will be automatically created when you create this period.
              </IonNote>
            </>
          ) : (
            <EmptyExpenses>
              No recurring expenses will be auto-generated for this period.
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
