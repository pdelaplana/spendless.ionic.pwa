import { IonLabel, IonList, IonIcon } from '@ionic/react';
import { idCardOutline } from 'ionicons/icons';
import { useAuth } from '@providers/auth/useAuth';
import { BasePageLayout, CenterContainer, Content } from '@components/layouts';
import { ProfilePhoto, StyledItem } from '@/components/shared';

const ProfilePage: React.FC = () => {
  const { user, updatePhotoUrl } = useAuth();
  return (
    <BasePageLayout
      title='Profile'
      defaultBackButtonHref='/'
      showLogo={false}
      showProfileIcon={false}
      showSignoutButton={true}
    >
      <CenterContainer>
        <Content marginTop={'10px'}>
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

        <Content marginTop={'50px'}>
          <IonList lines='none' className='ion-margin-top'>
            <StyledItem
              lines='full'
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
          </IonList>
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default ProfilePage;
