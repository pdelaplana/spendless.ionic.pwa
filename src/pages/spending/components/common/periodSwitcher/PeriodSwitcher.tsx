import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { CleanCard, GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { chevronDown, time } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePeriodActions } from '../../../hooks/usePeriodActions';

const PeriodSwitcherContainer = styled(GlassCard).attrs({ as: 'button' })`
  padding: ${designSystem.spacing.lg};
  width: 93.25%;
`;

const PeriodContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${designSystem.spacing.md};
`;

const PeriodInfo = styled.div`
  flex: 1;
  min-width: 0;
  text-align: center;
`;

const PeriodTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin: 0 0 ${designSystem.spacing.xs} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${designSystem.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PeriodStatus = styled.div<{ isClosed: boolean }>`
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.secondary};
  margin-top: ${designSystem.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SwitcherIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${designSystem.colors.text.secondary};
  font-size: 20px;
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
  const { formatDate } = useFormatters();
  const { selectedPeriod, periods } = useSpendingAccount();
  const { openSpendingPeriodsPage, startNewPeriodHandler } = usePeriodActions();

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

  const daysRemaining = calculateDaysRemaining();

  const ariaLabel = hasMultiplePeriods
    ? `${t('spending.switchPeriod')}: ${selectedPeriod.name}, ${formatDate(selectedPeriod.startAt)} ${t('spending.to')} ${formatDate(selectedPeriod.endAt)}`
    : `${t('spending.currentPeriod')}: ${selectedPeriod.name}, ${formatDate(selectedPeriod.startAt)} ${t('spending.to')} ${formatDate(selectedPeriod.endAt)}`;

  return (
    <PeriodSwitcherContainer
      onClick={handleSwitchPeriod}
      aria-label={ariaLabel}
      onKeyDown={(e) => handleKeyDown(e, handleSwitchPeriod)}
    >
      <PeriodContent>
        <PeriodInfo>
          <PeriodTitle>
            <IonIcon icon={time} />
            {selectedPeriod.name}
          </PeriodTitle>
          <PeriodStatus isClosed={isClosed}>
            {isClosed
              ? t('spending.periodClosed')
              : daysRemaining === 0
                ? t('spending.lastDay')
                : daysRemaining === 1
                  ? t('spending.dayRemaining', { count: 1 })
                  : t('spending.daysRemaining', { count: daysRemaining })}
          </PeriodStatus>
        </PeriodInfo>

        {hasMultiplePeriods && (
          <SwitcherIcon>
            <IonIcon icon={chevronDown} />
          </SwitcherIcon>
        )}
      </PeriodContent>
    </PeriodSwitcherContainer>
  );
};
