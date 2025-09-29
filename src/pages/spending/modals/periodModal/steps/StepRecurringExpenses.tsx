import { Currency } from '@/domain/Currencies';
import type { ISpend } from '@/domain/Spend';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonNote, useIonToast } from '@ionic/react';
import { calendarOutline, trashOutline, walletOutline } from 'ionicons/icons';
import type React from 'react';
import { useEffect, useState } from 'react';
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
  const [presentToast] = useIonToast();
  const currency = Currency.USD; // TODO: Get from user preferences

  // Calculate period duration in days
  const periodDurationDays = Math.ceil(
    (new Date(formData.endAt).getTime() - new Date(formData.startAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  // Calculate new dates for recurring expenses
  const getNewDate = (originalDate: Date): Date => {
    const newDate = new Date(originalDate);
    newDate.setDate(newDate.getDate() + periodDurationDays);
    return newDate;
  };

  const handleRemoveExpense = (expenseId: string) => {
    const expense = currentRecurringExpenses.find((e) => e.id === expenseId);
    if (expense) {
      onRemoveRecurringExpense(expenseId);
      presentToast({
        message: `Removed "${expense.description}" from recurring expenses`,
        duration: 3000,
        color: 'success',
        position: 'top',
      });
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
        your new period with dates adjusted by {periodDurationDays} days. You can remove any you
        don't want to copy.
      </InfoBox>

      {currentRecurringExpenses.length === 0 ? (
        <EmptyState>
          <EmptyIcon icon={walletOutline} />
          <h3>No recurring expenses</h3>
          <p>You don't have any recurring expenses from your current period to copy over.</p>
        </EmptyState>
      ) : (
        <RecurringList>
          {currentRecurringExpenses.map((expense) => (
            <RecurringItem key={expense.id}>
              <RecurringInfo>
                <RecurringDescription>{expense.description}</RecurringDescription>
                <RecurringAmount>{currency.format(expense.amount)}</RecurringAmount>
                <RecurringDate>
                  <IonIcon icon={calendarOutline} />
                  {formatDate(expense.date)} → {formatDate(getNewDate(expense.date))}
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

      {currentRecurringExpenses.length > 0 && (
        <IonNote>
          {currentRecurringExpenses.length} recurring expense
          {currentRecurringExpenses.length > 1 ? 's' : ''}
          will be copied to your new period
        </IonNote>
      )}
    </RecurringSection>
  );
};

export default StepRecurringExpenses;
