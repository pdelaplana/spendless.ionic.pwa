import { SpendlessLogo } from '@/components/brand';
import { BasePageLayout, CenterContainer, Content } from '@/components/layouts';
import { Gap } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/react';
import styled from 'styled-components';
import packageJson from '../../../package.json';

const LogoContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.md};
`;

const Tagline = styled.p`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.secondary};
  margin: 0;
`;

const VersionBadge = styled.div`
  display: inline-block;
  background: ${designSystem.colors.primary[100]};
  color: ${designSystem.colors.primary[700]};
  padding: ${designSystem.spacing.xs} ${designSystem.spacing.md};
  border-radius: ${designSystem.borderRadius.full};
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  margin-top: ${designSystem.spacing.md};
`;

const SectionCard = styled(IonCard)`
  margin: ${designSystem.spacing.md} 0;
`;

const InfoLabel = styled(IonLabel)`
  h2 {
    font-size: ${designSystem.typography.fontSize.base};
    font-weight: ${designSystem.typography.fontWeight.medium};
    color: ${designSystem.colors.text.primary};
    margin: 0 0 ${designSystem.spacing.xs} 0;
  }

  p {
    font-size: ${designSystem.typography.fontSize.sm};
    color: ${designSystem.colors.text.secondary};
    margin: 0;
  }
`;

const LinkLabel = styled.a`
  color: ${designSystem.colors.primary[500]};
  text-decoration: none;
  font-size: ${designSystem.typography.fontSize.sm};

  &:hover {
    text-decoration: underline;
  }
`;

const AboutPage: React.FC = () => {
  const appVersion = packageJson.version;
  const buildDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <BasePageLayout
      title='About Spendless'
      showBackButton={true}
      showProfileIcon={false}
      defaultBackButtonHref={ROUTES.SPENDING}
    >
      <CenterContainer>
        <Content>
          <LogoContainer>
            <SpendlessLogo variant='primary' size='xl' />
            <Tagline>Mindful Spending Tracker</Tagline>
            <VersionBadge>Version {appVersion}</VersionBadge>
          </LogoContainer>

          <Gap size={designSystem.spacing.lg} />

          <SectionCard>
            <IonCardHeader>
              <IonCardTitle>About This App</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ lineHeight: '1.6', color: designSystem.colors.text.secondary }}>
                Spendless is a mindful spending tracker designed to help you understand your
                financial habits through emotional awareness. We focus on the "why" behind your
                spending, not just the "what."
              </p>
            </IonCardContent>
          </SectionCard>

          <SectionCard>
            <IonCardHeader>
              <IonCardTitle>App Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines='none'>
                <IonItem>
                  <InfoLabel>
                    <h2>Version</h2>
                    <p>{appVersion}</p>
                  </InfoLabel>
                </IonItem>
                <IonItem>
                  <InfoLabel>
                    <h2>Build Date</h2>
                    <p>{buildDate}</p>
                  </InfoLabel>
                </IonItem>
                <IonItem>
                  <InfoLabel>
                    <h2>Platform</h2>
                    <p>Progressive Web App (PWA)</p>
                  </InfoLabel>
                </IonItem>
                <IonItem>
                  <InfoLabel>
                    <h2>Technology</h2>
                    <p>React + Ionic + Firebase</p>
                  </InfoLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </SectionCard>

          <SectionCard>
            <IonCardHeader>
              <IonCardTitle>Support</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines='none'>
                <IonItem>
                  <InfoLabel>
                    <h2>Email Support</h2>
                    <p>
                      <LinkLabel href='mailto:support@spendless.app'>
                        support@spendless.app
                      </LinkLabel>
                    </p>
                  </InfoLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </SectionCard>

          <div
            style={{
              textAlign: 'center',
              padding: designSystem.spacing.xl,
              color: designSystem.colors.text.secondary,
              fontSize: designSystem.typography.fontSize.sm,
            }}
          >
            <p>Made with 💜 for mindful spenders</p>
            <p style={{ marginTop: designSystem.spacing.xs }}>
              © 2025 Spendless. All rights reserved.
            </p>
          </div>

          <Gap size={designSystem.spacing.xl} />
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default AboutPage;
