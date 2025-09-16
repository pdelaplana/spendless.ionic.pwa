import { getWalletUsagePercentage } from '@/domain/Wallet';
import { IonButton, IonIcon, IonItem, IonLabel, IonNote, IonProgressBar } from '@ionic/react';
import { ellipsisVertical, star, starOutline } from 'ionicons/icons';
import type React from 'react';
import WalletMenu from './WalletMenu';
import type { WalletListItemProps } from './types';

const WalletListItem: React.FC<WalletListItemProps> = ({ wallet, onEdit, onDelete, canDelete }) => {
  const usagePercentage = getWalletUsagePercentage(wallet);
  const isOverLimit = wallet.currentBalance > wallet.spendingLimit;

  // Color coding based on usage
  const getProgressColor = (): 'primary' | 'warning' | 'danger' => {
    if (usagePercentage <= 70) return 'primary';
    if (usagePercentage <= 90) return 'warning';
    return 'danger';
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <IonItem>
        <IonIcon
          icon={wallet.isDefault ? star : starOutline}
          slot='start'
          color={wallet.isDefault ? 'warning' : 'medium'}
        />

        <IonLabel>
          <h2 style={{ fontWeight: wallet.isDefault ? 'bold' : 'normal' }}>
            {wallet.name}
            {wallet.isDefault && (
              <IonNote color='warning' style={{ marginLeft: '8px', fontSize: '12px' }}>
                DEFAULT
              </IonNote>
            )}
          </h2>
          <h3>
            {formatCurrency(wallet.currentBalance)} of {formatCurrency(wallet.spendingLimit)}
            {isOverLimit && (
              <IonNote color='danger' style={{ marginLeft: '8px', fontSize: '12px' }}>
                OVER LIMIT
              </IonNote>
            )}
          </h3>
          <IonProgressBar value={Math.min(usagePercentage / 100, 1)} color={getProgressColor()} />
          <p>
            <IonNote>
              {usagePercentage.toFixed(0)}% used
              {wallet.spendingLimit > wallet.currentBalance &&
                ` • ${formatCurrency(wallet.spendingLimit - wallet.currentBalance)} remaining`}
            </IonNote>
          </p>
        </IonLabel>

        <IonButton
          id={`wallet-menu-${wallet.id}`}
          fill='clear'
          size='small'
          slot='end'
          onClick={(e) => {
            console.log('Trigger button clicked:', e);
            e.stopPropagation();
          }}
        >
          <IonIcon icon={ellipsisVertical} />
        </IonButton>
      </IonItem>

      <WalletMenu
        wallet={wallet}
        triggerId={`wallet-menu-${wallet.id}`}
        onEdit={onEdit}
        onDelete={onDelete}
        canDelete={canDelete}
      />
    </div>
  );
};

export default WalletListItem;
