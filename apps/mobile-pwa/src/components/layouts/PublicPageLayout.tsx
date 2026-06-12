import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderLogo from '../shared/base/display/HeaderLogo';
import { CenterContainer } from './CenterContainer';
import '@i18n/config';
import styled from 'styled-components';

const StyledHeader = styled(IonHeader)`
  border-bottom-style: inset;
  border-bottom-color: var(--ion-color-light-shade);
  border-bottom-width: 2px;
`;

interface PublicPageLayoutProps extends PropsWithChildren {
  title: string;
  showHeader?: boolean;
}

const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({
  title,
  children,
  showHeader = true,
}) => {
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
      {showHeader && (
        <StyledHeader className='ion-no-border'>
          <IonToolbar>
            <div className='ion-flex ion-justify-content-center'>
              <HeaderLogo />
            </div>
            <IonButtons slot='end' />
          </IonToolbar>
        </StyledHeader>
      )}
      <IonContent color='light'>
        <CenterContainer>{children}</CenterContainer>
      </IonContent>
    </IonPage>
  );
};
export default PublicPageLayout;
