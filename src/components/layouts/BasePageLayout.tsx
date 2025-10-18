import HeaderLogo from '@/components/shared/base/display/HeaderLogo';
import { usePrompt } from '@hooks/ui';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useAuth } from '@providers/auth/useAuth';
import { exitOutline, menuOutline, personCircleOutline } from 'ionicons/icons';
import type { PropsWithChildren } from 'react';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import '@i18n/config';
import { ROUTES } from '@/routes/routes.constants';

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
  menuSide?: 'start' | 'end';
  endButtons?: React.ReactNode;
}

const StyledHeader = styled(IonHeader)`
  border-bottom: 1px solid var(--color-gray-200);
  background: var(--ion-color-light);

  ion-toolbar {
    --background: var(--ion-color-light);
    --color: var(--ion-color-dark);
    --border-width: 0;
    padding: var(--spacing-sm) 0;
    min-height: 60px;
  }
`;

const CenterTitle = styled.div<{
  addLeftMargin: boolean;
  addRightMargin: boolean;
}>`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  ion-text {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--ion-color-dark);
  }
`;

const StyledContent = styled(IonContent)`
  --background: var(--ion-color-light);
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
`;

const StyledMenuButton = styled(IonMenuButton)`
  --color: var(--ion-color-primary);
  margin: 0;

  &::part(native) {
    padding: var(--spacing-sm);
  }
`;

const StyledBackButton = styled(IonBackButton)`
  --color: var(--ion-color-primary);
  margin: 0;

  &::part(native) {
    padding: var(--spacing-sm);
  }
`;

const StyledProfileButton = styled(IonButton)`
  --color: var(--ion-color-primary);
  margin: 0;

  ion-icon {
    font-size: 28px;
  }
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
  menuSide = 'start',
  endButtons,
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
        <IonMenu contentId='main-content' type='overlay' side={menuSide}>
          {menu}
        </IonMenu>
      )}

      <IonPage id='main-content'>
        {showHeader && (
          <StyledHeader id='main-header' className='ion-no-border' mode='ios'>
            <IonToolbar>
              <IonButtons slot='start'>
                {!showBackButton && showMenu && menu && (
                  <StyledMenuButton>
                    <IonIcon icon={menuOutline} />
                  </StyledMenuButton>
                )}

                {showBackButton && (
                  <StyledBackButton defaultHref={defaultBackButtonHref} text={''} />
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
                {endButtons}
                {showProfileIcon && (
                  <StyledProfileButton
                    routerLink={ROUTES.PROFILE}
                    routerDirection='forward'
                    fill='clear'
                    size='large'
                  >
                    <IonIcon slot='icon-only' icon={personCircleOutline} />
                  </StyledProfileButton>
                )}
                {showSignoutButton && (
                  <StyledProfileButton onClick={handleSignout} fill='clear' size='large'>
                    <IonIcon slot='icon-only' icon={exitOutline} />
                  </StyledProfileButton>
                )}
              </IonButtons>
            </IonToolbar>
          </StyledHeader>
        )}

        <StyledContent>
          {showSecondaryHeader && (
            <IonHeader mode='ios' className='ion-no-border' collapse='condense'>
              <IonToolbar color='light' className='ion-no-border'>
                <div
                  style={{
                    margin: 'var(--spacing-lg)',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--ion-color-dark)',
                  }}
                >
                  {title}
                </div>
              </IonToolbar>
            </IonHeader>
          )}

          {children}
        </StyledContent>
        {footer && <IonFooter color='light'>{footer}</IonFooter>}
      </IonPage>
    </>
  );
};
