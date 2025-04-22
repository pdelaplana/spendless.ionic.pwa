import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonContent,
  useIonViewWillEnter,
  IonFooter,
  IonTitle,
  IonText,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
} from '@ionic/react';
import { useAuth } from '@providers/auth/useAuth';
import { exitOutline, personCircleOutline } from 'ionicons/icons';
import type { PropsWithChildren } from 'react';
import HeaderLogo from '@/components/shared/base/display/HeaderLogo';
import { usePrompt } from '@hooks/ui';

import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import '@i18n/config';
import { ROUTES } from '@/routes/routes.constants';
import { LetterIcon } from '../shared';

interface BasePageProps extends PropsWithChildren {
  title: string;
  showTitle?: boolean;
  showSignoutButton?: boolean;
  showHeader?: boolean;
  showProfileIcon?: boolean;
  showBackButton?: boolean;
  showLogo?: boolean;
  children: React.ReactNode;
  defaultBackButtonHref?: string;
  footer?: React.ReactNode;
  menu?: React.ReactNode;
  showMenu?: boolean;
  showSecondaryHeader?: boolean;
}

const StyledHeader = styled(IonHeader)`
  border-bottom-style: inset;
  border-bottom-color: var(--ion-color-light-shade);
  border-bottom-width: thin;
`;

const CenterTitle = styled.div<{
  addLeftMargin: boolean;
  addRightMargin: boolean;
}>`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const BasePageLayout: React.FC<BasePageProps> = ({
  title,
  children,
  showTitle = true,
  showSignoutButton = false,
  showProfileIcon = true,
  showHeader = true,
  showBackButton = true,
  showLogo = false,
  defaultBackButtonHref,
  footer,
  menu,
  showMenu = false,
  showSecondaryHeader = false,
}) => {
  const { t } = useTranslation();
  const { signout } = useAuth();
  const { showConfirmPrompt } = usePrompt();

  const handleSignout = () => {
    showConfirmPrompt({
      title: 'Sign out',
      message: 'Are you sure you want to sign out?',
      onConfirm: signout,
    });
  };

  useIonViewWillEnter(() => {
    if (title) {
      document.title = `${title} - ${t('appName')}`;
    } else {
      document.title = t('meta.defaultTitle');
    }
  });
  return (
    <>
      {showMenu && menu && (
        <IonMenu contentId='main-content' type='overlay'>
          {menu}
        </IonMenu>
      )}

      <IonPage id='main-content'>
        {showHeader && (
          <StyledHeader id='mainHeader' className='primary ion-no-border' mode='ios'>
            <IonToolbar color={'light'}>
              <IonButtons slot='start'>
                {!showBackButton && showMenu && menu && (
                  <IonMenuButton color='primary'>
                    <LetterIcon
                      letter={'S'}
                      backgroundColor='var(--ion-color-primary)'
                      size='default'
                    />
                  </IonMenuButton>
                )}

                {showBackButton && (
                  <IonBackButton
                    defaultHref={defaultBackButtonHref}
                    color='primary'
                    style={{ '--color': 'var(--ion-color-primary)' }}
                    text={''}
                  />
                )}
              </IonButtons>
              <IonTitle>
                <CenterTitle
                  addLeftMargin={!showBackButton}
                  addRightMargin={!showSignoutButton && !showProfileIcon}
                >
                  {showLogo && <HeaderLogo />}
                  {!showLogo && showTitle && <IonText>{title}</IonText>}
                </CenterTitle>
              </IonTitle>

              <IonButtons slot='end'>
                {showProfileIcon && (
                  <IonButton routerLink={ROUTES.PROFILE} routerDirection='forward'>
                    <IonIcon
                      slot='icon-only'
                      icon={personCircleOutline}
                      size='medium'
                      color='primary'
                    />
                  </IonButton>
                )}
                {showSignoutButton && (
                  <IonButton onClick={handleSignout}>
                    <IonIcon slot='icon-only' icon={exitOutline} color='primary' size='medium' />
                  </IonButton>
                )}
              </IonButtons>
            </IonToolbar>
          </StyledHeader>
        )}

        <IonContent color={'light'}>
          {showSecondaryHeader && (
            <IonHeader mode='ios' className='ion-no-border' collapse='condense'>
              <IonToolbar color='light' className='ion-no-border'>
                <div className='ion-margin'>
                  <h1>{title}</h1>
                </div>
              </IonToolbar>
            </IonHeader>
          )}

          {children}
        </IonContent>
        {footer && <IonFooter color='light'>{footer}</IonFooter>}
      </IonPage>
    </>
  );
};
