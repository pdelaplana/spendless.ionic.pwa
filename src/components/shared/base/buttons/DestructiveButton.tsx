import { usePrompt } from '@/hooks';
import { IonButton, IonSpinner, IonText } from '@ionic/react';

const DestructiveButton = ({
  label,
  prompt,
  expand,
  onClick,
  isLoading = false,
  isDisabled = false,
  ...rest
}: {
  label: string;
  prompt: string;
  expand: 'full' | 'block' | undefined;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
} & React.ComponentProps<typeof IonButton>) => {
  const { showConfirmPrompt } = usePrompt();

  const handleClick = async () => {
    showConfirmPrompt({
      title: 'Confirm',
      message: prompt,
      onConfirm: () => onClick(),
      onCancel: () => console.log('Alert canceled'),
    });
  };

  return (
    <IonButton
      color='danger'
      fill='clear'
      size='small'
      expand={expand}
      onClick={handleClick}
      disabled={isLoading || isDisabled}
      {...rest}
    >
      {isLoading ? (
        <IonSpinner name='dots' /> // Show spinner while loading
      ) : (
        <IonText style={{ height: '24px' }} className='ion-flex ion-align-items-center'>
          {label}
        </IonText>
      )}
    </IonButton>
  );
};

export default DestructiveButton;
