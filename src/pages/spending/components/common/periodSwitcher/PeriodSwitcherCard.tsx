import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { chevronDown, time } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePeriodActions } from '../../../hooks/usePeriodActions';

const PeriodSwitcherContainer = styled.div`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md} ${designSystem.spacing.lg} ${designSystem.spacing.md};
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: ${designSystem.borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: ${designSystem.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
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

const NoPeriodContainer = styled.div`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md} ${designSystem.spacing.lg} ${designSystem.spacing.md};
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: ${designSystem.borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: ${designSystem.spacing.lg};
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
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

export const PeriodSwitcherCard: React.FC = () => {
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
        role='button'
        tabIndex={0}
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

  const ariaLabel = hasMultiplePeriods
    ? `${t('spending.switchPeriod')}: ${selectedPeriod.name}, ${formatDate(selectedPeriod.startAt)} ${t('spending.to')} ${formatDate(selectedPeriod.endAt)}`
    : `${t('spending.currentPeriod')}: ${selectedPeriod.name}, ${formatDate(selectedPeriod.startAt)} ${t('spending.to')} ${formatDate(selectedPeriod.endAt)}`;

  return (
    <PeriodSwitcherContainer
      onClick={handleSwitchPeriod}
      role='button'
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => handleKeyDown(e, handleSwitchPeriod)}
    >
      <PeriodContent>
        <PeriodInfo>
          <PeriodTitle>
            <IonIcon icon={time} />
            {formatDate(selectedPeriod.startAt)} - {formatDate(selectedPeriod.endAt)}
          </PeriodTitle>
          <PeriodStatus isClosed={isClosed}>{selectedPeriod.name}</PeriodStatus>
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
