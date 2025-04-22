import type { FC } from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import {
  createOutline,
  calendar,
  ellipsisHorizontalOutline,
  calendarNumber,
  calendarNumberOutline,
} from 'ionicons/icons';

interface QuickActionButtonsProps {
  onNewSpend: () => void;
  onEditPeriod: () => void;
  onMore: () => void;
}

export const QuickActionButtons: FC<QuickActionButtonsProps> = ({
  onNewSpend,
  onEditPeriod,
  onMore,
}) => {
  return (
    <div className='ion-padding ion-flex ion-justify-content-around'>
      <div className='ion-text-center'>
        <IonButton shape='round' fill='solid' onClick={onNewSpend}>
          <IonIcon icon={createOutline} slot='icon-only' />
        </IonButton>
        <br />
        <IonText style={{ fontSize: 'x-small' }}>New Spend</IonText>
      </div>

      <div className='ion-text-center'>
        <IonButton shape='round' fill='solid' onClick={onEditPeriod}>
          <IonIcon icon={calendarNumberOutline} slot='icon-only' />
        </IonButton>
        <br />
        <IonText style={{ fontSize: 'x-small' }}> Edit Period</IonText>
      </div>

      <div className='ion-text-center'>
        <IonButton shape='round' fill='solid' onClick={onMore}>
          <IonIcon icon={ellipsisHorizontalOutline} slot='icon-only' />
        </IonButton>
        <br />
        <IonText style={{ fontSize: 'x-small' }}>More</IonText>
      </div>
    </div>
  );
};
