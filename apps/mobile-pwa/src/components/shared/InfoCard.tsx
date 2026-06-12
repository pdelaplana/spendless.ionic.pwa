import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

interface InfoCardProps {
  title: string;
  icon?: string;
  description: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

const StyledCardHeader = styled(IonCardHeader)`
  display: flex;
  align-items: left;
  gap: 0.5rem;
`;

const StyledCardTitle = styled(IonCardTitle)`
  display: flex;
  align-items: left;
  gap: 0.5rem;
`;

const Description = styled.div`
  margin-bottom: 16px;
`;

const ActionWrapper = styled.div`
  display: flex;
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
  }
`;

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  icon,
  description,
  color = 'primary',
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <IonCard color={color}>
      <StyledCardHeader>
        <StyledCardTitle>
          {icon && <IonIcon icon={icon} style={{ fontSize: '1.25rem' }} />}
          {title}
        </StyledCardTitle>
      </StyledCardHeader>
      <IonCardContent>
        <Description>{description}</Description>
        {children}
        {actionLabel && onAction && (
          <ActionWrapper>
            <IonButton color={'light'} onClick={onAction} expand='block' fill='outline'>
              {actionLabel}
            </IonButton>
          </ActionWrapper>
        )}
      </IonCardContent>
    </IonCard>
  );
};
