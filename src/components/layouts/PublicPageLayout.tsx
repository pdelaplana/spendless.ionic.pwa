import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { CenterContainer } from './CenterContainer';
import type { PropsWithChildren } from 'react';
import HeaderLogo from '../shared/base/display/HeaderLogo';
import { useTranslation } from 'react-i18next';
import '@i18n/config';
import styled from 'styled-components';

const StyledHeader = styled(IonHeader)`
  border-bottom-style: inset;
  border-bottom-color: var(--ion-color-light-shade);
  border-bottom-width: 2px;
`;

interface PublicPageLayoutProps extends PropsWithChildren {
  title: string;
}

const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ title, children }) => {
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
      <StyledHeader className='ion-no-border'>
        <IonToolbar>
          <div className='ion-flex ion-justify-content-center'>
            <HeaderLogo />
          </div>
          <IonButtons slot='end' />
        </IonToolbar>
      </StyledHeader>
      <IonContent color='light'>
        <CenterContainer>{children}</CenterContainer>
      </IonContent>
    </IonPage>
  );
};
export default PublicPageLayout;
