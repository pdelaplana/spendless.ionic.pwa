import { getTotalWalletLimits } from '@/domain/Period';
import { calculateWalletAvailable } from '@/domain/Wallet';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { CleanCard, GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, chevronDown, time, warning } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePeriodActions } from '../../../hooks/usePeriodActions';

const PeriodSwitcherContainer = styled(GlassCard)<{
  periodState: 'active' | 'ending' | 'closed';
  hasMultiplePeriods: boolean;
}>`
  padding: ${designSystem.spacing.lg};
  min-height: 172px;
  transition: all 0.2s ease;
  position: relative;

  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    transition: transform 0.1s ease;
  }

  &:focus-visible {
    outline: 3px solid ${designSystem.colors.primary[500]};
    outline-offset: 2px;
    border-radius: ${designSystem.borderRadius.lg};
  }

  ${({ periodState }) => {
    switch (periodState) {
      case 'ending':
        return `
          background: linear-gradient(135deg,
            rgba(245, 158, 11, 0.1) 0%,
            rgba(255, 255, 255, 0.8) 100%);
          border-color: ${designSystem.colors.warning};
        `;
      case 'closed':
        return `
          opacity: 0.8;
          background: rgba(156, 163, 175, 0.1);
        `;
      default:
        return `
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.7) 100%);
          border: 1px solid rgba(139, 95, 191, 0.2);

          &:hover {
            border-color: rgba(139, 95, 191, 0.4);
            box-shadow: 0 8px 32px rgba(139, 95, 191, 0.15);
          }
        `;
    }
  }}
`;

const PeriodContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
`;

const PeriodInfo = styled.div`
  width: 100%;
  min-width: 0;
  text-align: left;
`;

const PeriodLabel = styled.h4`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${designSystem.typography.fontSize.caption};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.secondary};
  `;

const PeriodTitle = styled.h2`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin: 0 0 ${designSystem.spacing['2xl']} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${designSystem.spacing.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PeriodStatus = styled.div<{ isClosed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.secondary};
  margin-top: ${designSystem.spacing.xs};
  margin-bottom: ${designSystem.spacing.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SwitcherIcon = styled.div<{ hasMultiplePeriods: boolean }>`
  position: absolute;
  top: ${designSystem.spacing.lg};
  right: ${designSystem.spacing.lg};
  display: flex;
  align-items: center;
  color: ${designSystem.colors.primary[500]};
  font-size: 20px;
  transition: transform 0.2s ease;
  z-index: 1;

  ${({ hasMultiplePeriods }) =>
    hasMultiplePeriods &&
    `
    ${PeriodSwitcherContainer}:hover & {
      transform: translateY(2px);
    }
  `}
`;

const StatusIndicator = styled.div<{ status: 'active' | 'ending' | 'closed' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ status }) => {
    switch (status) {
      case 'active':
        return designSystem.colors.success;
      case 'ending':
        return designSystem.colors.warning;
      case 'closed':
        return designSystem.colors.gray[400];
      default:
        return designSystem.colors.gray[400];
    }
  }};
  margin-right: ${designSystem.spacing.xs};
`;

const PeriodProgressContainer = styled.div`
  margin-top: ${designSystem.spacing.sm};
  width: 100%;
  position: relative;
`;

const PeriodProgress = styled.div`
  width: 100%;
  height: 24px;
  background: ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.md};
  border: 1px solid ${designSystem.colors.primary[500]};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg,
    ${designSystem.colors.primary[400]} 0%,
    ${designSystem.colors.primary[300]} 100%);
  width: ${({ progress }) => Math.max(2, progress)}%;
  transition: width 0.3s ease;
  border-radius: ${designSystem.borderRadius.md};
`;

const ProgressOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${designSystem.spacing.xs};
  pointer-events: none;
`;

const ProgressLabel = styled.span`
  font-size: ${designSystem.typography.fontSize.xs};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.gray[800]};
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;
`;

const ProgressAmount = styled.span`
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.gray[900]};
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
`;

const ActionHint = styled.span`
  font-size: ${designSystem.typography.fontSize.xs};
  color: ${designSystem.colors.text.secondary};
  opacity: 0.7;
  margin-top: ${designSystem.spacing.xs};
`;


const NoPeriodContainer = styled(GlassCard).attrs({ as: 'button' })`
  padding: ${designSystem.spacing.lg};
  text-align: center;
`;

const NoPeriodContent = styled.div`
  padding: ${designSystem.spacing.md} 0;
`;

const NoPeriodTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.secondary};
  margin: 0 0 ${designSystem.spacing.xs} 0;
`;

const NoPeriodSubtitle = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  margin: 0;
`;

export const PeriodSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { formatDate, formatCurrency } = useFormatters();
  const { selectedPeriod, periods, spending, account } = useSpendingAccount();
  const { wallets } = useWallet();
  const { openSpendingPeriodsPage, startNewPeriodHandler } = usePeriodActions();

  const calculateSpendPerDay = () => {
    if (!selectedPeriod || isClosed) return 0;

    const remainingDays = calculateDaysRemaining();
    if (remainingDays <= 0) return 0;

    // Get total spending limit from all wallets
    const totalSpendingLimit = wallets.reduce((total, wallet) => total + wallet.spendingLimit, 0);

    // Get total spent amount from all wallets
    const totalSpentAmount = wallets.reduce((total, wallet) => total + wallet.currentBalance, 0);

    // Calculate scheduled/recurring spending for remaining days
    const now = new Date();
    const endDate = new Date(selectedPeriod.endAt);
    const scheduledAmount = spending
      .filter(
        (spend) =>
          spend.periodId === selectedPeriod.id &&
          spend.recurring === true &&
          new Date(spend.date) > now &&
          new Date(spend.date) <= endDate,
      )
      .reduce((total, spend) => total + spend.amount, 0);

    // Calculate spend per day = (SpendingLimit - (SpentAmount + ScheduledAmount)) / RemainingDays
    const totalSpentAndScheduled = totalSpentAmount + scheduledAmount;
    const remainingBudget = totalSpendingLimit - totalSpentAndScheduled;

    return Math.max(0, remainingBudget / remainingDays);
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };

  if (!selectedPeriod) {
    return (
      <NoPeriodContainer
        onClick={startNewPeriodHandler}
        aria-label={t('spending.tapToCreatePeriod')}
        onKeyDown={(e) => handleKeyDown(e, startNewPeriodHandler)}
      >
        <NoPeriodContent>
          <NoPeriodTitle>{t('spending.noPeriodSelected')}</NoPeriodTitle>
          <NoPeriodSubtitle>{t('spending.tapToCreatePeriod')}</NoPeriodSubtitle>
        </NoPeriodContent>
      </NoPeriodContainer>
    );
  }

  const handleSwitchPeriod = () => {
    if (periods.length > 1) {
      openSpendingPeriodsPage();
    } else {
      startNewPeriodHandler();
    }
  };

  const isClosed = !!selectedPeriod.closedAt;
  const hasMultiplePeriods = periods.length > 1;

  const calculateDaysRemaining = () => {
    if (isClosed) return 0;
    const now = new Date();
    const endDate = new Date(selectedPeriod.endAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateTotalDays = () => {
    const startDate = new Date(selectedPeriod.startAt);
    const endDate = new Date(selectedPeriod.endAt);
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = () => {
    if (isClosed) return 100;
    const totalDays = calculateTotalDays();
    const remaining = calculateDaysRemaining();
    const elapsed = totalDays - remaining;
    return Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
  };

  const getPeriodState = (): 'active' | 'ending' | 'closed' => {
    if (isClosed) return 'closed';
    const remaining = calculateDaysRemaining();
    if (remaining <= 3) return 'ending';
    return 'active';
  };

  const getPeriodIcon = () => {
    const state = getPeriodState();
    switch (state) {
      case 'closed':
        return checkmarkCircle;
      case 'ending':
        return warning;
      default:
        return time;
    }
  };

  const getIconColor = () => {
    const state = getPeriodState();
    switch (state) {
      case 'closed':
        return designSystem.colors.gray[400];
      case 'ending':
        return designSystem.colors.warning;
      default:
        return designSystem.colors.primary[500];
    }
  };

  const daysRemaining = calculateDaysRemaining();
  const progress = calculateProgress();
  const periodState = getPeriodState();
  const spendPerDay = calculateSpendPerDay();

  const ariaLabel = hasMultiplePeriods
    ? `${t('spending.switchPeriod')}: ${selectedPeriod.name}, ${formatDate(selectedPeriod.startAt)} ${t('spending.to')} ${formatDate(selectedPeriod.endAt)}`
    : `${t('spending.currentPeriod')}: ${selectedPeriod.name}, ${formatDate(selectedPeriod.startAt)} ${t('spending.to')} ${formatDate(selectedPeriod.endAt)}`;

  return (
    <PeriodSwitcherContainer
      onClick={handleSwitchPeriod}
      aria-label={ariaLabel}
      onKeyDown={(e) => handleKeyDown(e, handleSwitchPeriod)}
      periodState={periodState}
      hasMultiplePeriods={hasMultiplePeriods}
      margin={`${designSystem.spacing.lg} ${designSystem.spacing.md}`}
    >
      <PeriodContent>
        <PeriodInfo>
          <PeriodLabel>Current Period</PeriodLabel>
          <PeriodTitle>
            <IonIcon icon={getPeriodIcon()} style={{ color: getIconColor() }} />
            {`${formatDate(selectedPeriod.startAt)} - ${formatDate(selectedPeriod.endAt)}`}
          </PeriodTitle>
          <PeriodStatus isClosed={isClosed}>
            <StatusIndicator status={periodState} />
            {isClosed
              ? t('spending.periodClosed')
              : daysRemaining === 0
                ? t('spending.lastDay')
                : daysRemaining === 1
                  ? t('spending.dayRemaining', { count: 1 })
                  : t('spending.daysRemaining', { count: daysRemaining })}
          </PeriodStatus>
          {!isClosed && (
            <PeriodProgressContainer>
              <PeriodProgress>
                <ProgressFill progress={progress} />
                {daysRemaining > 0 && (
                  <ProgressOverlay>
                    <ProgressLabel>{t('spending.spendPerDay')}</ProgressLabel>
                    <ProgressAmount>
                      {formatCurrency(spendPerDay, account?.currency)}
                    </ProgressAmount>
                  </ProgressOverlay>
                )}
              </PeriodProgress>
            </PeriodProgressContainer>
          )}
        </PeriodInfo>
      </PeriodContent>

      {hasMultiplePeriods && (
        <SwitcherIcon hasMultiplePeriods={hasMultiplePeriods}>
          <IonIcon icon={chevronDown} />
        </SwitcherIcon>
      )}
    </PeriodSwitcherContainer>
  );
};
