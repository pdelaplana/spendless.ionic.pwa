import { usePrompt } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import { IonContent, IonIcon, IonLabel, IonList } from '@ionic/react';
import {
  chatbubbleEllipsesOutline,
  helpOutline,
  idCardOutline,
  informationCircleOutline,
  logOutOutline,
  personOutline,
  settingsOutline,
} from 'ionicons/icons';
import styled from 'styled-components';
import { Content } from '../layouts';
import { ProfilePhoto, PwaInstallPrompt, StyledItem } from '../shared';

// Zip Payment inspired menu styling
const MenuContainer = styled(IonContent)`
  --background: ${designSystem.colors.surface};
`;

const UserSection = styled.div`
  background: linear-gradient(135deg, ${designSystem.colors.primary[500]} 0%, ${designSystem.colors.primary[600]} 100%);
  padding: ${designSystem.spacing.xl} ${designSystem.spacing.lg};
  margin-bottom: ${designSystem.spacing.lg};
  color: ${designSystem.colors.text.inverse};
  text-align: center;
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${designSystem.spacing.md} auto;
  font-size: 32px;
  color: ${designSystem.colors.text.inverse};
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const UserName = styled.h2`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  margin: 0 0 ${designSystem.spacing.xs} 0;
  color: ${designSystem.colors.text.inverse};
`;

const UserEmail = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
`;

const MenuSection = styled.div`
  padding: 0 ${designSystem.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.xs};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: ${designSystem.spacing.lg} 0 ${designSystem.spacing.md} 0;
  padding: 0 ${designSystem.spacing.sm};
`;

const ModernMenuItem = styled(StyledItem)`
  --background: transparent;
  --border-color: transparent;
  --inner-border-width: 0;
  margin: ${designSystem.spacing.xs} 0;
  border-radius: ${designSystem.borderRadius.md};

  &:hover {
    --background: ${designSystem.colors.gray[50]};
  }

  ion-icon {
    color: ${designSystem.colors.primary[500]};
    font-size: 20px;
  }

  ion-label h2 {
    font-size: ${designSystem.typography.fontSize.base};
    font-weight: ${designSystem.typography.fontWeight.medium};
    color: ${designSystem.colors.text.primary};
    margin: 0;
  }

  ion-label p {
    font-size: ${designSystem.typography.fontSize.sm};
    color: ${designSystem.colors.text.secondary};
    margin: 2px 0 0 0;
  }
`;

const LogoutMenuItem = styled(ModernMenuItem)`
  &:hover {
    --background: rgba(239, 68, 68, 0.1);
  }

  ion-icon {
    color: ${designSystem.colors.danger};
  }

  ion-label h2 {
    color: ${designSystem.colors.danger};
  }
`;

const InstallSection = styled.div`
  padding: ${designSystem.spacing.lg};
  text-align: center;
  border-top: 1px solid ${designSystem.colors.gray[200]};
  margin-top: ${designSystem.spacing.lg};
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
    <MenuContainer>
      {/* User Profile Section */}
      <UserSection>
        <UserAvatar>
          <IonIcon icon={personOutline} />
        </UserAvatar>
        <UserName>{user?.displayName || 'User'}</UserName>
        <UserEmail>{user?.email}</UserEmail>
      </UserSection>

      {/* Menu Items */}
      <MenuSection>
        <SectionTitle>Account</SectionTitle>
        <IonList lines='none'>
          <ModernMenuItem button routerLink='/profile/info'>
            <IonIcon slot='start' icon={idCardOutline} />
            <IonLabel>
              <h2>Personal Details</h2>
              <p>Update your phone and email</p>
            </IonLabel>
          </ModernMenuItem>

          <ModernMenuItem button routerLink={ROUTES.SETTINGS}>
            <IonIcon slot='start' icon={settingsOutline} />
            <IonLabel>
              <h2>Settings</h2>
              <p>Manage your app preferences</p>
            </IonLabel>
          </ModernMenuItem>
        </IonList>

        <SectionTitle>Support</SectionTitle>
        <IonList lines='none'>
          <ModernMenuItem button routerLink={ROUTES.FEEDBACK}>
            <IonIcon slot='start' icon={chatbubbleEllipsesOutline} />
            <IonLabel>
              <h2>Send Feedback</h2>
              <p>Report bugs or share suggestions</p>
            </IonLabel>
          </ModernMenuItem>

          <ModernMenuItem button routerLink='/profile/help'>
            <IonIcon slot='start' icon={helpOutline} />
            <IonLabel>
              <h2>Help & Support</h2>
              <p>Get assistance and FAQs</p>
            </IonLabel>
          </ModernMenuItem>

          <ModernMenuItem button routerLink='/profile/about'>
            <IonIcon slot='start' icon={informationCircleOutline} />
            <IonLabel>
              <h2>About Spendless</h2>
              <p>App version and information</p>
            </IonLabel>
          </ModernMenuItem>
        </IonList>

        <SectionTitle>Account Actions</SectionTitle>
        <IonList lines='none'>
          <LogoutMenuItem button onClick={signoutHandler}>
            <IonIcon slot='start' icon={logOutOutline} />
            <IonLabel>
              <h2>Log Out</h2>
              <p>Sign out of your account</p>
            </IonLabel>
          </LogoutMenuItem>
        </IonList>

        {/* PWA Installation section */}
        <InstallSection>
          <PwaInstallPrompt />
        </InstallSection>
      </MenuSection>
    </MenuContainer>
  );
};

export default MainMenuContent;
