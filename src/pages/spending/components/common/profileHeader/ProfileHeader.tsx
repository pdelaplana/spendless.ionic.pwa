import { useAuth } from '@/providers/auth/useAuth';
import { designSystem } from '@/theme/designSystem';
import { Gap } from '@components/shared';
import { IonIcon, IonMenuToggle } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import type React from 'react';
import styled from 'styled-components';

const ProfileHeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background: ${designSystem.colors.background};
  z-index: 100;
  padding: ${designSystem.spacing.xl} ${designSystem.spacing.md} ${designSystem.spacing.xs};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const GreetingContainer = styled.div`
  text-align: left;
  flex: 1;
`;

const GreetingText = styled.h1`
  font-size: ${designSystem.typography.fontSize['3xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin: 0;
  line-height: 1.2;
`;

const GreetingPrefix = styled.span`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.normal};
  color: ${designSystem.colors.text.secondary};
`;

const ProfileIconContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-left: ${designSystem.spacing.md};
  margin-top: 10px;
`;

const ProfileIcon = styled(IonIcon)`
  font-size: 48px;
  color: ${designSystem.colors.text.secondary};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${designSystem.colors.primary[500]};
  }

  &:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
`;

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning';
  }
  if (hour < 17) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
};

export const ProfileHeader: React.FC = () => {
  const { user } = useAuth();

  const greeting = getTimeBasedGreeting();
  const firstName = user?.displayName?.split(' ')[0] || 'Mate';

  return (
    <ProfileHeaderContainer>
      <Gap size={designSystem.spacing.lg} />
      <GreetingContainer>
        <GreetingText>
          <GreetingPrefix>{greeting},</GreetingPrefix>
          <br />
          {firstName}
        </GreetingText>
      </GreetingContainer>

      <ProfileIconContainer>
        <IonMenuToggle>
          <ProfileIcon icon={personCircleOutline} />
        </IonMenuToggle>
      </ProfileIconContainer>
    </ProfileHeaderContainer>
  );
};
