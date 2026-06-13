import type { IWallet } from '@/domain/Wallet';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
} from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import type React from 'react';
import { useEffect, useRef } from 'react';

interface WalletMenuProps {
  wallet: IWallet;
  triggerId: string;
  onEdit: (wallet: IWallet) => void;
  onDelete: (walletId: string) => void;
  canDelete: boolean;
}

const WalletMenu: React.FC<WalletMenuProps> = ({
  wallet,
  triggerId,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const popoverRef = useRef<HTMLIonPopoverElement>(null);

  useEffect(() => {
    const handleClick = (e: Event) => {
      console.log('Native click event captured:', e.target);
      const target = e.target as HTMLElement;
      const itemElement = target.closest('ion-item');

      if (itemElement) {
        const action = itemElement.getAttribute('data-action');
        console.log('Action detected:', action);

        if (action === 'edit') {
          console.log('Executing edit action');
          onEdit(wallet);
          popoverRef.current?.dismiss();
        } else if (action === 'delete' && wallet.id) {
          console.log('Executing delete action');
          onDelete(wallet.id);
          popoverRef.current?.dismiss();
        }
      }
    };

    const popover = popoverRef.current;
    if (popover) {
      popover.addEventListener('click', handleClick);
      return () => {
        popover.removeEventListener('click', handleClick);
      };
    }
  }, [wallet, onEdit, onDelete]);

  return (
    <IonPopover ref={popoverRef} trigger={triggerId} side='bottom' alignment='end'>
      <IonContent>
        <IonList lines='none'>
          <IonItem
            button
            detail={false}
            data-action='edit'
            style={{
              cursor: 'pointer',
              '--min-height': '48px',
            }}
          >
            <IonIcon icon={createOutline} slot='start' />
            <IonLabel>Edit</IonLabel>
          </IonItem>
          {canDelete && (
            <IonItem
              button
              detail={false}
              data-action='delete'
              style={{
                cursor: 'pointer',
                '--min-height': '48px',
              }}
            >
              <IonIcon icon={trashOutline} slot='start' color='danger' />
              <IonLabel color='danger'>Delete</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPopover>
  );
};

export default WalletMenu;
