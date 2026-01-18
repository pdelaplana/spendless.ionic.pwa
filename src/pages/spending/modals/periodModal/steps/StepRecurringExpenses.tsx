import { Currency } from '@/domain/Currencies';
import type { IRecurringSpend } from '@/domain/RecurringSpend';
import { calculateOccurrencesInPeriod, getScheduleDescription } from '@/domain/RecurringSpend';
import { useFetchRecurringSpends } from '@/hooks/api';
import { useAppNotifications } from '@/hooks/ui/useAppNotifications';
import { designSystem } from '@/theme/designSystem';
import { IonIcon, IonNote, IonSpinner } from '@ionic/react';
import { calendarOutline, repeatOutline, walletOutline } from 'ionicons/icons';
import type React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { PeriodFormData } from '../hooks/useMultiStepForm';

const RecurringSection = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  padding-left: 16px;
  padding-right: 16px;
`;

const RecurringList = styled.div`
  margin-bottom: ${designSystem.spacing.lg};
`;

const RecurringGroup = styled.div`
  margin-bottom: ${designSystem.spacing.lg};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.lg};
  overflow: hidden;
`;

const RecurringHeader = styled.div`
  padding: ${designSystem.spacing.md};
  background: ${designSystem.colors.gray[50]};
  border-bottom: 1px solid ${designSystem.colors.gray[200]};
`;

const RecurringTitle = styled.div`
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const RecurringAmount = styled.div`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.primary[600]};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  margin-bottom: ${designSystem.spacing.xs};
`;

const RecurringSchedule = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
`;

const OccurrencesList = styled.div`
  background: ${designSystem.colors.surface};
`;

const OccurrenceItem = styled.div`
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  border-bottom: 1px solid ${designSystem.colors.gray[100]};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};

  &:last-child {
    border-bottom: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl};
  color: ${designSystem.colors.text.secondary};
`;

const EmptyIcon = styled(IonIcon)`
  font-size: 4rem;
  color: ${designSystem.colors.gray[400]};
  margin-bottom: ${designSystem.spacing.md};
`;

const InfoBox = styled.div`
  background: ${designSystem.colors.primary[50]};
  border: 1px solid ${designSystem.colors.primary[200]};
  border-radius: ${designSystem.borderRadius.md};
  padding: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.lg};
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.primary[700]};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${designSystem.spacing.xl};
`;

const SummaryBox = styled.div`
  background: ${designSystem.colors.success[50]};
  border: 1px solid ${designSystem.colors.success[200]};
  border-radius: ${designSystem.borderRadius.md};
  padding: ${designSystem.spacing.md};
  margin-top: ${designSystem.spacing.lg};
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.success[700]};
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

interface StepRecurringExpensesProps {
  formData: PeriodFormData;
  accountId: string;
}

const StepRecurringExpenses: React.FC<StepRecurringExpensesProps> = ({ formData, accountId }) => {
  const { t } = useTranslation();
  const currency = Currency.USD; // TODO: Get from user preferences

  // Fetch recurring spends from the new collection
  const { data: recurringSpends = [], isLoading } = useFetchRecurringSpends(accountId);

  // Calculate all occurrences for each recurring spend within the new period
  const recurringExpensesWithOccurrences = useMemo(() => {
    if (!formData.startAt || !formData.endAt) {
      return [];
    }

    const periodStart = new Date(formData.startAt);
    const periodEnd = new Date(formData.endAt);

    const results = recurringSpends
      .filter((rs) => rs.isActive)
      .map((rs) => {
        const occurrences = calculateOccurrencesInPeriod(rs, periodStart, periodEnd);

        return {
          recurringSpend: rs,
          occurrences,
        };
      })
      .filter((item) => item.occurrences.length > 0);

    return results;
  }, [recurringSpends, formData.startAt, formData.endAt]);

  const totalSpends = useMemo(() => {
    return recurringExpensesWithOccurrences.reduce((sum, item) => sum + item.occurrences.length, 0);
  }, [recurringExpensesWithOccurrences]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  if (isLoading) {
    return (
      <RecurringSection>
        <LoadingContainer>
          <IonSpinner />
        </LoadingContainer>
      </RecurringSection>
    );
  }

  return (
    <RecurringSection>
      <InfoBox>
        📅 These are your active recurring expenses. The system will automatically create spend
        records for each occurrence within your new period. Review the dates below to see exactly
        what will be created.
      </InfoBox>

      {recurringExpensesWithOccurrences.length === 0 ? (
        <EmptyState>
          <EmptyIcon icon={walletOutline} />
          <h3>No recurring expenses</h3>
          <p>
            You don't have any active recurring expenses set up. You can add them from the Recurring
            Spending page.
          </p>
        </EmptyState>
      ) : (
        <>
          <RecurringList>
            {recurringExpensesWithOccurrences.map((item) => (
              <RecurringGroup key={item.recurringSpend.id}>
                <RecurringHeader>
                  <RecurringTitle>{item.recurringSpend.description}</RecurringTitle>
                  <RecurringAmount>{currency.format(item.recurringSpend.amount)}</RecurringAmount>
                  <RecurringSchedule>
                    <IonIcon icon={repeatOutline} />
                    {getScheduleDescription(item.recurringSpend)}
                  </RecurringSchedule>
                  <RecurringSchedule>
                    <IonIcon icon={walletOutline} style={{ fontSize: '14px' }} />
                    {getWalletName(item.recurringSpend)}
                  </RecurringSchedule>
                </RecurringHeader>
                <OccurrencesList>
                  {item.occurrences.map((date) => (
                    <OccurrenceItem key={date.getTime()}>
                      <IonIcon icon={calendarOutline} />
                      {formatDate(date)}
                    </OccurrenceItem>
                  ))}
                </OccurrencesList>
              </RecurringGroup>
            ))}
          </RecurringList>

          <SummaryBox>
            ✨ {totalSpends} spend record{totalSpends !== 1 ? 's' : ''} will be automatically
            created from {recurringExpensesWithOccurrences.length} recurring expense
            {recurringExpensesWithOccurrences.length !== 1 ? 's' : ''}
          </SummaryBox>
        </>
      )}
    </RecurringSection>
  );
};

export default StepRecurringExpenses;
