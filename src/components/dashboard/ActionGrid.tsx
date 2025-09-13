import { ActionCard } from '@/components/ui';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import {
  addOutline,
  analyticsOutline,
  calendarOutline,
  cardOutline,
  settingsOutline,
  walletOutline,
} from 'ionicons/icons';
import styled from 'styled-components';

interface ActionGridProps {
  onAddSpend: () => void;
  onManagePeriod: () => void;
  onViewAnalytics?: () => void;
  onSchedule?: () => void;
  onWalletSetup?: () => void;
  onManageCategories?: () => void;
  showAdvancedActions?: boolean;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${designSystem.spacing.md};
  margin: ${designSystem.spacing.md};
`;

const PrimaryActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.md};
`;

const SecondaryActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${designSystem.spacing.sm};
`;

const SectionTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin: ${designSystem.spacing.lg} 0 ${designSystem.spacing.md} 0;
  padding: 0 ${designSystem.spacing.md};
`;

const CompactActionCard = styled.button`
  background: ${designSystem.colors.surface};
  border: 1px solid ${designSystem.colors.gray[200]};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${designSystem.shadows.md};
    border-color: ${designSystem.colors.primary[200]};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CompactActionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${designSystem.borderRadius.md};
  background: ${designSystem.colors.primary[50]};
  color: ${designSystem.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const CompactActionLabel = styled.span`
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.primary};
  text-align: center;
  line-height: 1.2;
`;

export const ActionGrid: React.FC<ActionGridProps> = ({
  onAddSpend,
  onManagePeriod,
  onViewAnalytics,
  onSchedule,
  onWalletSetup,
  onManageCategories,
  showAdvancedActions = true,
}) => {
  return (
    <GridContainer>
      {/* Primary Actions */}
      <PrimaryActionsGrid>
        <ActionCard
          icon={<IonIcon icon={addOutline} />}
          title='Add Spend'
          subtitle='Record new spending'
          onClick={onAddSpend}
          variant='primary'
        />

        <ActionCard
          icon={<IonIcon icon={settingsOutline} />}
          title='Manage Period'
          subtitle='Edit budget & settings'
          onClick={onManagePeriod}
          variant='secondary'
        />
      </PrimaryActionsGrid>

      {/* Secondary Actions */}
      {showAdvancedActions && (
        <>
          <SectionTitle>Quick Actions</SectionTitle>
          <SecondaryActionsGrid>
            {onViewAnalytics && (
              <CompactActionCard onClick={onViewAnalytics}>
                <CompactActionIcon>
                  <IonIcon icon={analyticsOutline} />
                </CompactActionIcon>
                <CompactActionLabel>Analytics</CompactActionLabel>
              </CompactActionCard>
            )}

            {onSchedule && (
              <CompactActionCard onClick={onSchedule}>
                <CompactActionIcon>
                  <IonIcon icon={calendarOutline} />
                </CompactActionIcon>
                <CompactActionLabel>Schedule</CompactActionLabel>
              </CompactActionCard>
            )}

            {onWalletSetup && (
              <CompactActionCard onClick={onWalletSetup}>
                <CompactActionIcon>
                  <IonIcon icon={walletOutline} />
                </CompactActionIcon>
                <CompactActionLabel>Wallet</CompactActionLabel>
              </CompactActionCard>
            )}

            {onManageCategories && (
              <CompactActionCard onClick={onManageCategories}>
                <CompactActionIcon>
                  <IonIcon icon={cardOutline} />
                </CompactActionIcon>
                <CompactActionLabel>Categories</CompactActionLabel>
              </CompactActionCard>
            )}
          </SecondaryActionsGrid>
        </>
      )}
    </GridContainer>
  );
};

// Simplified Action Bar for minimal layouts
interface ActionBarProps {
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryIcon?: string;
  secondaryIcon?: string;
}

const ActionBarContainer = styled.div`
  display: flex;
  gap: ${designSystem.spacing.md};
  padding: ${designSystem.spacing.md};
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  background: ${(props) =>
    props.variant === 'primary' ? designSystem.colors.primary[500] : designSystem.colors.surface};
  color: ${(props) =>
    props.variant === 'primary'
      ? designSystem.colors.text.inverse
      : designSystem.colors.text.primary};
  border: ${(props) =>
    props.variant === 'primary' ? 'none' : `1px solid ${designSystem.colors.gray[300]}`};
  border-radius: ${designSystem.borderRadius.md};
  padding: ${designSystem.spacing.md} ${designSystem.spacing.lg};
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${designSystem.spacing.sm};
  min-height: 48px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${designSystem.shadows.md};
    background: ${(props) =>
      props.variant === 'primary'
        ? designSystem.colors.primary[600]
        : designSystem.colors.gray[50]};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const ActionBar: React.FC<ActionBarProps> = ({
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel = 'Add Spend',
  secondaryLabel = 'Manage',
  primaryIcon = addOutline,
  secondaryIcon = settingsOutline,
}) => {
  return (
    <ActionBarContainer>
      <ActionButton variant='primary' onClick={onPrimaryAction}>
        <IonIcon icon={primaryIcon} />
        {primaryLabel}
      </ActionButton>

      {onSecondaryAction && (
        <ActionButton variant='secondary' onClick={onSecondaryAction}>
          <IonIcon icon={secondaryIcon} />
          {secondaryLabel}
        </ActionButton>
      )}
    </ActionBarContainer>
  );
};
