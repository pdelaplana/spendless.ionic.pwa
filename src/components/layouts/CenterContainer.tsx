import { IonCol, IonGrid, IonRow } from '@ionic/react';
import type { PropsWithChildren } from 'react';

type CenterContainerProps = PropsWithChildren;

export const CenterContainer: React.FC<CenterContainerProps> = ({ children }) => {
  return (
    <IonGrid style={{ maxWidth: '1420px' }} className='ion-no-padding'>
      <IonRow>
        <IonCol />
        <IonCol size='8' sizeSm='12' sizeXs='12' sizeLg='6' sizeXl='6'>
          {children}
        </IonCol>
        <IonCol />
      </IonRow>
    </IonGrid>
  );
};
