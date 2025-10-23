import { Currency } from '@/domain/Currencies';
import type { ISpend } from '@/domain/Spend';
import { useAppNotifications } from '@/hooks/ui/useAppNotifications';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonNote } from '@ionic/react';
import { calendarOutline, trashOutline, walletOutline } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { PeriodFormData } from '../hooks/useMultiStepForm';

const RecurringSection = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  padding-left: 16px;
  padding-right: 16px;
`;

const RecurringSectionLabel = styled.h2`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

const RecurringList = styled.div`
  margin-bottom: ${designSystem.spacing.lg};
`;

const RecurringItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${designSystem.spacing.md};
  background: ${designSystem.colors.surface};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.lg};
  margin-bottom: ${designSystem.spacing.sm};
`;

const RecurringInfo = styled.div`
  flex: 1;
`;

const RecurringDescription = styled.div`
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.primary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const RecurringAmount = styled.div`
  font-size: ${designSystem.typography.fontSize.lg};
  color: ${designSystem.colors.primary[600]};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  margin-bottom: ${designSystem.spacing.xs};
`;

const RecurringDate = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
`;

const DeleteButton = styled(IonButton)`
  --color: ${designSystem.colors.danger};
  --color-hover: ${designSystem.colors.danger};
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

interface StepRecurringExpensesProps {
  formData: PeriodFormData;
  currentRecurringExpenses?: ISpend[];
  onRemoveRecurringExpense: (expenseId: string) => void;
}

const StepRecurringExpenses: React.FC<StepRecurringExpensesProps> = ({
  formData,
  currentRecurringExpenses = [],
  onRemoveRecurringExpense,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useAppNotifications();
  const currency = Currency.USD; // TODO: Get from user preferences

  // Use the recurring expenses from form data which already have calculated dates
  const recurringExpenses = formData.recurringExpenses || [];

  const handleRemoveExpense = (expenseId: string) => {
    const expense = recurringExpenses.find((e) => e.id === expenseId);
    if (expense) {
      onRemoveRecurringExpense(expenseId);
      showNotification(`Removed "${expense.description}" from recurring expenses`);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <RecurringSection>
      <InfoBox>
        📅 These expenses from your current period are marked as recurring. They will be copied to
        your new period, maintaining their relative position within the period (e.g., if an expense
        was 7 days into the period, it will be 7 days into the new period). You can remove any you
        don't want to copy.
      </InfoBox>

      {recurringExpenses.length === 0 ? (
        <EmptyState>
          <EmptyIcon icon={walletOutline} />
          <h3>No recurring expenses</h3>
          <p>You don't have any recurring expenses from your current period to copy over.</p>
        </EmptyState>
      ) : (
        <RecurringList>
          {recurringExpenses.map((expense) => (
            <RecurringItem key={expense.id}>
              <RecurringInfo>
                <RecurringDescription>{expense.description}</RecurringDescription>
                <RecurringAmount>{currency.format(expense.amount)}</RecurringAmount>
                <RecurringDate>
                  <IonIcon icon={calendarOutline} />
                  {formatDate(expense.originalDate)} → {formatDate(expense.newDate)}
                </RecurringDate>
              </RecurringInfo>
              <DeleteButton
                fill='clear'
                size='small'
                onClick={() => expense.id && handleRemoveExpense(expense.id)}
              >
                <IonIcon icon={trashOutline} />
              </DeleteButton>
            </RecurringItem>
          ))}
        </RecurringList>
      )}

      {recurringExpenses.length > 0 && (
        <IonNote>
          {recurringExpenses.length} recurring expense
          {recurringExpenses.length > 1 ? 's ' : ' '}
          will be copied to your new period
        </IonNote>
      )}
    </RecurringSection>
  );
};

export default StepRecurringExpenses;
