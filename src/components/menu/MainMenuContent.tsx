import { usePrompt } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { ROUTES } from '@/routes/routes.constants';
import { IonContent, IonHeader, IonIcon, IonLabel, IonList } from '@ionic/react';
import {
  helpOutline,
  idCardOutline,
  informationCircleOutline,
  logOutOutline,
  settingsOutline,
} from 'ionicons/icons';
import styled from 'styled-components';
import { Content } from '../layouts';
import { ProfilePhoto, PwaInstallPrompt, StyledItem } from '../shared';

const StyledHeader = styled(IonHeader)`
  border-bottom-style: inset;
  border-bottom-color: var(--ion-color-light-shade);
  border-bottom-width: thin;
`;

const MainMenuContent: React.FC = () => {
  const { user, updatePhotoUrl, signout } = useAuth();
  const { showConfirmPrompt } = usePrompt();

  const signoutHandler = () => {
    showConfirmPrompt({
      title: 'Sign out',
      message: 'Are you sure you want to sign out?',
      onConfirm: signout,
    });
  };

  return (
    <>
      <IonContent className='ion-padding'>
        <Content>
          <div className='ion-padding ion-flex ion-justify-content-center'>
            <ProfilePhoto
              name={`${user?.displayName}`}
              photoUrl={user?.photoURL ?? ''}
              updatePhotoUrl={updatePhotoUrl}
              storagePath={`users/${user?.uid}/profile`}
            />
          </div>
          <IonLabel className='ion-text-center'>
            <h1 className='dark'>{user?.displayName}</h1>
          </IonLabel>
          <IonLabel className='ion-text-center'>
            <h2>{user?.email}</h2>
          </IonLabel>
        </Content>
        <Content>
          <IonList className='ion-no-padding ion-no-margin'>
            <StyledItem
              lines='none'
              detail
              button
              routerLink='/profile/info'
              className='ion-border-top'
            >
              <IonIcon slot='start' icon={idCardOutline} />
              <IonLabel>
                <h2>Personal Info</h2>
                <p>Update your phone and email</p>
              </IonLabel>
            </StyledItem>
            <StyledItem
              lines='none'
              detail
              button
              routerLink={ROUTES.SETTINGS}
              className='ion-border-top'
            >
              <IonIcon slot='start' icon={settingsOutline} />
              <IonLabel>
                <h2>Settings</h2>
                <p>Manage your app settings</p>
              </IonLabel>
            </StyledItem>
            <StyledItem
              lines='none'
              detail
              button
              routerLink='/profile/help'
              className='ion-border-top'
            >
              <IonIcon slot='start' icon={helpOutline} />
              <IonLabel>
                <h2>Help</h2>
                <p>Get help and support</p>
              </IonLabel>
            </StyledItem>
            <StyledItem
              lines='none'
              detail
              button
              routerLink='/profile/about'
              className='ion-border-top'
            >
              <IonIcon slot='start' icon={informationCircleOutline} />
              <IonLabel>
                <h2>About</h2>
                <p>Learn more about the app</p>
              </IonLabel>
            </StyledItem>
            <StyledItem
              lines='none'
              detail
              button
              onClick={signoutHandler}
              className='ion-border-top'
            >
              <IonIcon slot='start' icon={logOutOutline} />
              <IonLabel>
                <h2>Logout</h2>
                <p>Sign out of your account</p>
              </IonLabel>
            </StyledItem>

            {/* PWA Installation section */}
            <div className='ion-padding ion-text-center'>
              <PwaInstallPrompt />
            </div>
          </IonList>
        </Content>
      </IonContent>
    </>
  );
};

export default MainMenuContent;
