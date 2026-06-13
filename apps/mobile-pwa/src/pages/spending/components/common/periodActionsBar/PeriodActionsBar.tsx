import { useSpendingAccount } from '@/providers/spendingAccount';
import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { add, create } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePeriodActions } from '../../../hooks/usePeriodActions';

const ActionsContainer = styled(GlassCard)`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.md};
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: ${designSystem.borderRadius.lg};
`;

const ActionsGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: ${designSystem.spacing.xl};
  margin-top: ${designSystem.spacing.sm};
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.sm};

  background: transparent;
  border: none;
  padding: ${designSystem.spacing.sm};

  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
  }
`;

const CircularIconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${designSystem.colors.primary[500]} 0%, ${designSystem.colors.primary[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(139, 95, 191, 0.3);
  transition: all 0.2s ease;

  ${ActionButton}:hover & {
    box-shadow: 0 6px 24px rgba(139, 95, 191, 0.4);
    transform: scale(1.05);
  }

  ${ActionButton}:active & {
    transform: scale(0.98);
  }
`;

const ActionIcon = styled(IonIcon)`
  color: white;
  font-size: 24px;
`;

const ActionLabel = styled.span`
  color: ${designSystem.colors.text.secondary};
  font-weight: ${designSystem.typography.fontWeight.medium};
  font-size: ${designSystem.typography.fontSize.xs};
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${designSystem.spacing.sm} 0;
  color: ${designSystem.colors.text.secondary};
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PeriodActionsBar: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useSpendingAccount();
  const { startNewPeriodHandler, editCurrentPeriodHandler } = usePeriodActions();

  if (!selectedPeriod) {
    return null;
  }

  return (
    <ActionsContainer>
      <ActionsGrid>
        <ActionButton onClick={startNewPeriodHandler}>
          <CircularIconContainer>
            <ActionIcon icon={add} />
          </CircularIconContainer>
          <ActionLabel>{t('spending.actions.startNewPeriod')}</ActionLabel>
        </ActionButton>

        <ActionButton onClick={editCurrentPeriodHandler}>
          <CircularIconContainer>
            <ActionIcon icon={create} />
          </CircularIconContainer>
          <ActionLabel>{t('spending.actions.editPeriod')}</ActionLabel>
        </ActionButton>
      </ActionsGrid>
    </ActionsContainer>
  );
};
