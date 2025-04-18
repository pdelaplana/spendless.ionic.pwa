import { useIonActionSheet, IonButton, IonIcon } from '@ionic/react';
import { ellipsisVertical } from 'ionicons/icons';
import { useEffect } from 'react';

export interface ActionOption {
  text: string;
  role?: 'destructive' | 'cancel';
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data?: any;
}

interface ActionSheetButtonProps extends React.ComponentProps<typeof IonButton> {
  buttonLabel?: string | React.ReactNode;
  sheetTitle?: string;
  options: ActionOption[];
  onActionComplete: (option: ActionOption) => void;
}

const ActionSheetButton: React.FC<ActionSheetButtonProps> = ({
  buttonLabel = 'Actions',
  sheetTitle = 'Actions',
  options,
  onActionComplete,
  ...rest
}) => {
  const [present, dismiss] = useIonActionSheet();

  useEffect(() => {
    options = [...options, { text: 'Cancel', role: 'cancel' }];
  }, [options]);

  const handleAction = async () => {
    present({
      header: sheetTitle,
      buttons: options.map((option) => ({
        text: option.text,
        role: option.role,
        handler: () => {
          onActionComplete(option);
        },
      })),
    });
  };

  return (
    <IonButton onClick={handleAction} {...rest}>
      {buttonLabel}
    </IonButton>
  );
};

export default ActionSheetButton;
