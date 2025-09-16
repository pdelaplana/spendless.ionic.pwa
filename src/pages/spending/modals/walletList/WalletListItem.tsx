import { getWalletUsagePercentage } from '@/domain/Wallet';
import { IonIcon, IonItem, IonLabel, IonNote, IonProgressBar, IonRadio } from '@ionic/react';
import { checkmarkCircle, star } from 'ionicons/icons';
import type { WalletListItemProps } from './types';

const WalletListItem: React.FC<WalletListItemProps> = ({ wallet, isSelected, onSelect }) => {
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

  const getProgressDescription = (): string => {
    if (wallet.spendingLimit === 0) return 'No limit set';
    if (isOverLimit)
      return `Over by ${formatCurrency(wallet.currentBalance - wallet.spendingLimit)}`;
    return `${formatCurrency(wallet.spendingLimit - wallet.currentBalance)} remaining`;
  };

  return (
    <IonItem button onClick={() => onSelect(wallet)} className={isSelected ? 'ion-color' : ''}>
      <IonRadio slot='start' value={wallet.id} aria-labelledby={`wallet-${wallet.id}`} />

      <IonLabel id={`wallet-${wallet.id}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontWeight: wallet.isDefault ? 'bold' : 'normal', margin: 0 }}>
            {wallet.name}
          </h2>
          {wallet.isDefault && <IonIcon icon={star} color='warning' style={{ fontSize: '16px' }} />}
          {isSelected && (
            <IonIcon icon={checkmarkCircle} color='success' style={{ fontSize: '16px' }} />
          )}
        </div>

        <h3 style={{ margin: '4px 0', color: isOverLimit ? 'var(--ion-color-danger)' : undefined }}>
          {formatCurrency(wallet.currentBalance)} of {formatCurrency(wallet.spendingLimit)}
          <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '8px' }}>
            ({usagePercentage.toFixed(0)}%)
          </span>
        </h3>

        <IonProgressBar
          value={Math.min(usagePercentage / 100, 1)}
          color={getProgressColor()}
          style={{ marginTop: '4px' }}
        />

        <p style={{ margin: '4px 0 0 0' }}>
          <IonNote color={isOverLimit ? 'danger' : 'medium'}>{getProgressDescription()}</IonNote>
        </p>
      </IonLabel>
    </IonItem>
  );
};

export default WalletListItem;
