import { type IWallet, getWalletUsagePercentage } from '@/domain/Wallet';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonNote, IonProgressBar, IonText } from '@ionic/react';
import {
  calendar,
  calendarNumber,
  calendarNumberOutline,
  createOutline,
  ellipsisHorizontalOutline,
  swapVerticalOutline,
  walletOutline,
} from 'ionicons/icons';
import type { FC } from 'react';
import styled from 'styled-components';

const StickyContainer = styled.div`
  position: sticky;
  top: ${designSystem.spacing.md};
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.sm};
  border-radius: ${designSystem.borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: ${designSystem.spacing.md};
`;

const ActionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  flex: 1;
`;

const WalletActionItem = styled(ActionItem)`
  position: relative;
  min-width: 90px;
  
  .wallet-progress {
    width: 100%;
    height: 3px;
    margin-top: 2px;
    border-radius: 2px;
  }
`;

interface QuickActionButtonsProps {
  onNewSpend: () => void;
  onEditPeriod: () => void;
  onMore: () => void;
  onWalletSwitch: () => void;
  onWalletActionSheet?: () => void; // New action sheet handler
  currentWallet?: IWallet | null;
  sticky?: boolean;
}

export const QuickActionButtons: FC<QuickActionButtonsProps> = ({
  onNewSpend,
  onEditPeriod,
  onMore,
  onWalletSwitch,
  onWalletActionSheet,
  currentWallet,
  sticky = false,
}) => {
  const Container = sticky ? StickyContainer : 'div';

  // Calculate wallet usage for progress indicator
  const walletUsage = currentWallet ? getWalletUsagePercentage(currentWallet) : 0;
  const isOverLimit = currentWallet
    ? currentWallet.currentBalance > currentWallet.spendingLimit
    : false;

  // Color coding based on usage
  const getProgressColor = (): 'primary' | 'warning' | 'danger' => {
    if (walletUsage <= 70) return 'primary';
    if (walletUsage <= 90) return 'warning';
    return 'danger';
  };

  // Get wallet display name (truncated if too long)
  const getWalletDisplayName = (): string => {
    if (!currentWallet) return 'Default';
    if (currentWallet.name.length <= 8) return currentWallet.name;
    return `${currentWallet.name.substring(0, 7)}...`;
  };

  return (
    <Container className={!sticky ? 'ion-padding ion-flex ion-justify-content-around' : ''}>
      <ActionsContainer>
        <ActionItem>
          <IonButton shape='round' fill='solid' onClick={onNewSpend}>
            <IonIcon icon={createOutline} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>New Spend</IonText>
        </ActionItem>

        <ActionItem>
          <IonButton shape='round' fill='solid' onClick={onEditPeriod}>
            <IonIcon icon={calendarNumberOutline} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>Edit Period</IonText>
        </ActionItem>

        <WalletActionItem>
          <IonButton
            shape='round'
            fill='solid'
            onClick={onWalletSwitch}
            color={isOverLimit ? 'danger' : getProgressColor()}
          >
            <IonIcon icon={walletOutline} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small', textAlign: 'center', lineHeight: '1.2' }}>
            {getWalletDisplayName()}
          </IonText>
          {currentWallet && (
            <>
              <IonNote style={{ fontSize: '9px', textAlign: 'center', margin: 0 }}>
                {walletUsage.toFixed(0)}%
              </IonNote>
              <IonProgressBar
                value={Math.min(walletUsage / 100, 1)}
                color={getProgressColor()}
                className='wallet-progress'
              />
            </>
          )}
        </WalletActionItem>

        {onWalletActionSheet && (
          <ActionItem>
            <IonButton shape='round' fill='outline' color='primary' onClick={onWalletActionSheet}>
              <IonIcon icon={swapVerticalOutline} slot='icon-only' />
            </IonButton>
            <IonText style={{ fontSize: 'x-small' }}>Wallet Sheet</IonText>
          </ActionItem>
        )}

        <ActionItem>
          <IonButton shape='round' fill='solid' onClick={onMore}>
            <IonIcon icon={ellipsisHorizontalOutline} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>More</IonText>
        </ActionItem>
      </ActionsContainer>
    </Container>
  );
};
