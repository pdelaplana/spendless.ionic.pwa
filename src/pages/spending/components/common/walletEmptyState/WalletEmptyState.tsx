import type { IWallet } from '@/domain/Wallet';
import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { add, settings, walletOutline } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface WalletEmptyStateProps {
  wallet: IWallet;
  onNewSpend: () => void;
  onEditWallet: () => void;
}

const EmptyStateContainer = styled(GlassCard)`
  margin: ${designSystem.spacing.xl} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.xl};
  text-align: center;
`;

const EmptyIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${designSystem.spacing.lg};

  ion-icon {
    font-size: 4rem;
    color: ${designSystem.colors.gray[400]};
  }
`;

const EmptyTitle = styled.h2`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin: 0 0 ${designSystem.spacing.md} 0;
`;

const EmptyDescription = styled.p`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.secondary};
  line-height: ${designSystem.typography.lineHeight.relaxed};
  margin: 0 0 ${designSystem.spacing.xl} 0;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.md};
  margin-top: ${designSystem.spacing.lg};
`;

const ActionButton = styled(IonButton)`
  --border-radius: ${designSystem.borderRadius.md};
  height: 48px;
`;

const SecondaryActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${designSystem.spacing.lg};
  margin-top: ${designSystem.spacing.lg};
`;

const SecondaryAction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.xs};
`;

const SecondaryButton = styled(IonButton)`
  --border-radius: ${designSystem.borderRadius.full};
  width: 48px;
  height: 48px;
`;

const WalletEmptyState: React.FC<WalletEmptyStateProps> = ({
  wallet,
  onNewSpend,
  onEditWallet,
}) => {
  const { t } = useTranslation();

  return (
    <EmptyStateContainer>
      <EmptyIcon>
        <IonIcon icon={walletOutline} />
      </EmptyIcon>

      <EmptyTitle>{t('wallet.noSpendingInWallet')}</EmptyTitle>

      <EmptyDescription>
        {t('wallet.noSpendingInWalletDescription', { walletName: wallet.name })}
      </EmptyDescription>

      <ActionsContainer>
        <ActionButton expand='block' shape='round' color='primary' onClick={onNewSpend}>
          <IonIcon icon={add} slot='start' />
          {t('spending.addFirstSpend')}
        </ActionButton>
      </ActionsContainer>

      <SecondaryActionsContainer>
        <SecondaryAction>
          <SecondaryButton shape='round' fill='outline' color='medium' onClick={onEditWallet}>
            <IonIcon icon={settings} slot='icon-only' />
          </SecondaryButton>
          <IonText style={{ fontSize: 'small', color: designSystem.colors.text.secondary }}>
            {t('wallet.editWallet')}
          </IonText>
        </SecondaryAction>
      </SecondaryActionsContainer>
    </EmptyStateContainer>
  );
};

export default WalletEmptyState;
