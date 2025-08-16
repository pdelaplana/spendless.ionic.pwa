import { IonIcon, IonText } from '@ionic/react';
import type { ReactNode } from 'react';
import { CenterContent } from './CenterContent';

interface InformationContentProps {
  icon: string;
  title: string;
  children: ReactNode;
}

const InformationContent: React.FC<InformationContentProps> = ({ icon, title, children }) => {
  return (
    <CenterContent>
      <div className='ion-text-center'>
        <IonText className='ion-text-center'>
          {icon && <IonIcon icon={icon} style={{ height: '4.5em', width: '4.5em' }} />}
          <h2>{title}</h2>
          {children}
        </IonText>
      </div>
    </CenterContent>
  );
};
export default InformationContent;
