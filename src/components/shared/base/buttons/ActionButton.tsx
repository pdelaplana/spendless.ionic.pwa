import type React from 'react';
import { IonButton, IonSpinner } from '@ionic/react';

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
        label
      )}
    </IonButton>
  );
};

export default ActionButton;
