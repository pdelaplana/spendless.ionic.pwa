import { IonButton, IonSpinner, IonText } from '@ionic/react';
import type React from 'react';

interface ButtonProps extends React.ComponentProps<typeof IonButton> {
  isLoading: boolean;
  isDisabled: boolean;
  label: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ButtonProps> = ({
  isLoading = false,
  isDisabled = false,
  label = '',
  onClick = () => {},
  children,
  ...rest
}) => {
  return (
    <IonButton onClick={onClick} disabled={isLoading || isDisabled} {...rest}>
      {isLoading ? (
        <IonSpinner name='dots' /> // Show spinner while loading
      ) : (
        <>
          {children}
          <IonText style={{ height: '24px' }} className='ion-flex ion-align-items-center'>
            {label}
          </IonText>
        </>
      )}
    </IonButton>
  );
};

export default ActionButton;
