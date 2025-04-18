import { useIonAlert } from '@ionic/react';

export const usePrompt = () => {
  const [presentAlert] = useIonAlert();

  const showConfirmPrompt = ({
    title,
    message,
    onConfirm = () => {},
    onCancel = () => {},
  }: {
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    presentAlert({
      header: title,
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            onCancel();
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: async () => {
            onConfirm();
          },
        },
      ],
    });
  };

  return { showConfirmPrompt };
};
