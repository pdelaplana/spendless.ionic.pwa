import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { CenterContainer } from './CenterContainer';

interface ModalProps extends PropsWithChildren {
  title?: string;
  footer?: React.ReactNode;
  showHeader?: boolean;
  onDismiss: () => void;
  actionButton?: React.ReactNode;
}

const ModalPageLayout: React.FC<ModalProps> = ({
  title = '',
  showHeader = true,
  footer,
  children,
  onDismiss,
  actionButton,
}) => {
  return (
    <IonPage>
      {showHeader && (
        <IonHeader className='ion-no-border'>
          <IonToolbar>
            <IonButtons slot='start'>
              <IonButton onClick={() => onDismiss()} slot='icon-only' shape='round'>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>{title}</IonTitle>
            {actionButton && <IonButtons slot='end'>{actionButton}</IonButtons>}
          </IonToolbar>
        </IonHeader>
      )}

      <IonContent>{children}</IonContent>
      {footer && <IonFooter className='ion-no-border'>{footer}</IonFooter>}
    </IonPage>
  );
};

export default ModalPageLayout;
