import type { IWallet } from '@/domain/Wallet';
import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { add, settings } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface WalletQuickActionButtonsProps {
  onNewSpend: () => void;
  onEditWallet: () => void;
  currentWallet?: IWallet | null;
  sticky?: boolean;
}

const WalletActionsCard = styled(GlassCard)<{ $sticky?: boolean }>`
  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    top: ${designSystem.spacing.md};
    z-index: 100;
  `}

  padding: ${designSystem.spacing.sm};
  margin: 0 ${designSystem.spacing.md} ${designSystem.spacing.lg} ${designSystem.spacing.md};
  overflow: hidden;
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

const WalletQuickActionButtons: React.FC<WalletQuickActionButtonsProps> = ({
  onNewSpend,
  onEditWallet,
  currentWallet,
  sticky = false,
}) => {
  const { t } = useTranslation();

  return (
    <WalletActionsCard $sticky={sticky}>
      <ActionsContainer>
        <ActionItem>
          <IonButton shape='round' fill='solid' onClick={onNewSpend}>
            <IonIcon icon={add} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>{t('spending.newSpend')}</IonText>
        </ActionItem>

        <ActionItem>
          <IonButton
            shape='round'
            fill='solid'
            onClick={onEditWallet}
            disabled={!currentWallet}
            color='secondary'
          >
            <IonIcon icon={settings} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>{t('wallet.editWallet')}</IonText>
        </ActionItem>
      </ActionsContainer>
    </WalletActionsCard>
  );
};

export default WalletQuickActionButtons;
