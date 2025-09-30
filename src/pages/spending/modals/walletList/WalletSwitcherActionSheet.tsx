import type { IWallet } from '@/domain/Wallet';
import { getWalletUsagePercentage, isWalletOverLimit } from '@/domain/Wallet';
import { useAppNotifications } from '@/hooks/ui/useAppNotifications';
import {
  IonButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { checkmarkCircle, close, star } from 'ionicons/icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WalletSwitcherActionSheetProps {
  isOpen: boolean;
  wallets: IWallet[];
  currentWallet?: IWallet;
  onWalletSelected?: (wallet: IWallet) => void;
  onDismiss: () => void;
}

const WalletSwitcherActionSheet: React.FC<WalletSwitcherActionSheetProps> = ({
  isOpen,
  wallets = [],
  currentWallet,
  onWalletSelected,
  onDismiss,
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const { t } = useTranslation();
  const { showNotification } = useAppNotifications();

  const handleWalletSelect = (wallet: IWallet) => {
    // Check if the selection is different from current
    if (currentWallet?.id === wallet.id) {
      onDismiss();
      return;
    }

    // Execute callback and close modal
    onWalletSelected?.(wallet);
    onDismiss();

    showNotification(`Switched to ${wallet.name}`);
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getProgressDescription = (wallet: IWallet): string => {
    if (wallet.spendingLimit === 0) return 'No limit set';
    const isOverLimit = isWalletOverLimit(wallet);
    if (isOverLimit)
      return `Over by ${formatCurrency(wallet.currentBalance - wallet.spendingLimit)}`;
    return `${formatCurrency(wallet.spendingLimit - wallet.currentBalance)} remaining`;
  };

  const getProgressColor = (wallet: IWallet): 'primary' | 'warning' | 'danger' => {
    const usagePercentage = getWalletUsagePercentage(wallet);
    if (usagePercentage <= 70) return 'primary';
    if (usagePercentage <= 90) return 'warning';
    return 'danger';
  };

  // Calculate totals for summary
  const totalSpent = wallets.reduce((sum, wallet) => sum + wallet.currentBalance, 0);
  const totalBudget = wallets.reduce((sum, wallet) => sum + wallet.spendingLimit, 0);
  const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <IonModal
      ref={modal}
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      breakpoints={[0, 0.25, 0.5, 0.75]}
      initialBreakpoint={0.5}
      backdropDismiss={true}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Switch Wallet</IonTitle>
          <IonButton slot='end' fill='clear' onClick={onDismiss} style={{ marginRight: '8px' }}>
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <div style={{ padding: '16px' }}>
        {/* Summary Section */}
        {wallets.length > 0 && (
          <div
            style={{
              padding: '16px',
              background: 'var(--ion-color-light)',
              borderRadius: '12px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              Period Overview
            </h3>
            <div>
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
          <IonList lines='none' style={{ background: 'transparent' }}>
            {wallets.map((wallet) => {
              const usagePercentage = getWalletUsagePercentage(wallet);
              const isSelected = wallet.id === currentWallet?.id;
              const isOverLimit = isWalletOverLimit(wallet);

              return (
                <IonItem
                  key={wallet.id}
                  button
                  onClick={() => handleWalletSelect(wallet)}
                  style={{
                    '--background': isSelected
                      ? 'var(--ion-color-primary-tint)'
                      : 'var(--ion-color-light)',
                    '--border-radius': '12px',
                    margin: '8px 0',
                    '--padding-start': '16px',
                    '--padding-end': '16px',
                    '--min-height': '80px',
                  }}
                >
                  <IonLabel>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <h2
                        style={{
                          fontWeight: wallet.isDefault ? 'bold' : '600',
                          margin: 0,
                          fontSize: '18px',
                        }}
                      >
                        {wallet.name}
                      </h2>
                      {wallet.isDefault && (
                        <IonIcon icon={star} color='warning' style={{ fontSize: '16px' }} />
                      )}
                      {isSelected && (
                        <IonIcon
                          icon={checkmarkCircle}
                          color='success'
                          style={{ fontSize: '18px' }}
                        />
                      )}
                    </div>

                    <h3
                      style={{
                        margin: '4px 0',
                        color: isOverLimit ? 'var(--ion-color-danger)' : 'var(--ion-color-medium)',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      {formatCurrency(wallet.currentBalance)} of{' '}
                      {formatCurrency(wallet.spendingLimit)}
                      <span style={{ fontSize: '12px', marginLeft: '8px' }}>
                        ({usagePercentage.toFixed(0)}%)
                      </span>
                    </h3>

                    <IonProgressBar
                      value={Math.min(usagePercentage / 100, 1)}
                      color={getProgressColor(wallet)}
                      style={{
                        marginTop: '8px',
                        marginBottom: '4px',
                        height: '6px',
                        borderRadius: '3px',
                      }}
                    />

                    <p style={{ margin: '4px 0 0 0' }}>
                      <IonNote
                        color={isOverLimit ? 'danger' : 'medium'}
                        style={{ fontSize: '12px' }}
                      >
                        {getProgressDescription(wallet)}
                      </IonNote>
                    </p>
                  </IonLabel>
                </IonItem>
              );
            })}
          </IonList>
        )}

        {/* Add some bottom padding for the sheet */}
        <div style={{ height: '20px' }} />
      </div>
    </IonModal>
  );
};

export default WalletSwitcherActionSheet;
