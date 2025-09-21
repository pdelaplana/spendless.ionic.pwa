import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import type { IWallet } from '@/domain/Wallet';
import {
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRadioGroup,
  IonTitle,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WalletListItem from './WalletListItem';

interface WalletListModalProps {
  wallets: IWallet[];
  currentWallet?: IWallet;
  onWalletSelected?: (wallet: IWallet) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const WalletListModal: React.FC<WalletListModalProps> = ({
  wallets = [],
  onDismiss,
  onWalletSelected,
  currentWallet,
}) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(currentWallet?.id);

  // Handle wallet selection - now closes modal automatically
  const handleWalletSelect = (walletId: string) => {
    setSelectedWalletId(walletId);

    // Find the selected wallet
    const selectedWallet = wallets.find((w) => w.id === walletId);
    if (!selectedWallet) return;

    // Check if the selection is different from current
    if (currentWallet?.id === walletId) {
      onDismiss();
      return;
    }

    // Execute callback and close modal
    onWalletSelected?.(selectedWallet);
    onDismiss(selectedWallet, 'select');

    presentToast({
      message: `Switched to ${selectedWallet.name}`,
      duration: 2000,
      color: 'success',
    });
  };

  // Calculate totals for summary
  const totalSpent = wallets.reduce((sum, wallet) => sum + wallet.currentBalance, 0);
  const totalBudget = wallets.reduce((sum, wallet) => sum + wallet.spendingLimit, 0);
  const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <ModalPageLayout onDismiss={onDismiss}>
      <CenterContainer>
        <IonTitle size='large' className='ion-text-center ion-margin-bottom'>
          Select Wallet
        </IonTitle>

        {/* Summary Section */}
        {wallets.length > 0 && (
          <div
            style={{
              padding: '16px',
              background: 'var(--ion-color-light)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>Period Overview</h3>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
              </p>
              <IonNote>
                {overallUsage.toFixed(0)}% used across {wallets.length} wallet
                {wallets.length !== 1 ? 's' : ''}
              </IonNote>
            </div>
          </div>
        )}

        {wallets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <IonNote>
              <p style={{ fontSize: '16px', margin: '0 0 16px 0' }}>No wallets found</p>
              <p style={{ margin: 0 }}>
                Create your first wallet to get started with budget tracking
              </p>
            </IonNote>
          </div>
        ) : (
          <>
            <IonNote className='ion-margin-bottom'>
              Select a wallet to filter your spending and analytics
            </IonNote>

            <IonRadioGroup
              value={selectedWalletId}
              onIonChange={(e) => handleWalletSelect(e.detail.value)}
            >
              <IonList>
                {wallets.map((wallet) => (
                  <WalletListItem
                    key={wallet.id}
                    wallet={wallet}
                    isSelected={wallet.id === selectedWalletId}
                    onSelect={(w: IWallet) => handleWalletSelect(w.id || '')}
                  />
                ))}
              </IonList>
            </IonRadioGroup>
          </>
        )}
      </CenterContainer>
    </ModalPageLayout>
  );
};

export const useWalletListModal = (): {
  open: (
    wallets: IWallet[],
    currentWallet?: IWallet,
    onWalletSelected?: (wallet: IWallet) => void,
  ) => Promise<{ wallet: IWallet; role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    wallets: IWallet[];
    currentWallet?: IWallet;
    onWalletSelected?: (wallet: IWallet) => void;
  }>();

  const [present, dismiss] = useIonModal(WalletListModal, {
    wallets: inputs?.wallets || [],
    currentWallet: inputs?.currentWallet,
    onWalletSelected: inputs?.onWalletSelected,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => {
      if (role === 'select') {
        inputs?.onWalletSelected?.(data);
      }
      dismiss(data, role);
    },
  });

  return {
    open: (
      wallets: IWallet[],
      currentWallet?: IWallet,
      onWalletSelected?: (wallet: IWallet) => void,
    ) => {
      setInputs({
        wallets,
        currentWallet,
        onWalletSelected,
      });
      return new Promise((resolve) => {
        present({
          onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            if (ev.detail.role) {
              resolve({ wallet: ev.detail.data, role: ev.detail.role });
            }
          },
        });
      });
    },
  };
};

export default WalletListModal;
