import { usePwaInstall } from '@/hooks';
import { IonButton, IonIcon, IonToast } from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';
import React from 'react';

interface PwaInstallPromptProps {
  showButton?: boolean;
}

const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ showButton = true }) => {
  const { canInstall, isInstalled, installPwa } = usePwaInstall();
  const [showToast, setShowToast] = React.useState(false);

  // Don't show anything if already installed or can't install
  if (isInstalled || (!canInstall && !showToast)) {
    return null;
  }

  return (
    <>
      {showButton && canInstall && (
        <IonButton
          onClick={() => {
            installPwa();
            setShowToast(true);
          }}
          fill='outline'
          size='small'
          className='pwa-install-button'
        >
          <IonIcon icon={downloadOutline} slot='start' />
          Install App
        </IonButton>
      )}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message='Install this app on your device for quick access and offline use!'
        position='bottom'
        buttons={[
          {
            text: 'Install',
            handler: () => {
              installPwa();
            },
          },
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ]}
        duration={5000}
      />
    </>
  );
};

export default PwaInstallPrompt;
