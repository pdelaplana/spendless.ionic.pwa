import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from './CenterContainer';
import '@i18n/config';

interface AuthPageLayoutProps extends PropsWithChildren {
  title: string;
}

/**
 * AuthPageLayout - Clean layout for authentication pages without header
 * Provides a minimal, focused experience for signin/signup flows
 */
const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ title, children }) => {
  const { t } = useTranslation();

  useIonViewWillEnter(() => {
    if (title) {
      document.title = `${t('appName')} - ${title}`;
    } else {
      document.title = t('meta.defaultTitle');
    }
  });

  return (
    <IonPage>
      <IonContent color='light'>
        <CenterContainer>{children}</CenterContainer>
      </IonContent>
    </IonPage>
  );
};

export default AuthPageLayout;
