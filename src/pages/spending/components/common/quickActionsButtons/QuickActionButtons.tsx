import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import {
  calendar,
  calendarNumber,
  calendarNumberOutline,
  createOutline,
  ellipsisHorizontalOutline,
} from 'ionicons/icons';
import type { FC } from 'react';
import styled from 'styled-components';

const StickyContainer = styled.div`
  position: sticky;
  top: ${designSystem.spacing.md};
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.sm};
  border-radius: ${designSystem.borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: ${designSystem.spacing.md};
`;

const ActionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.xs};
`;

interface QuickActionButtonsProps {
  onNewSpend: () => void;
  onEditPeriod: () => void;
  onMore: () => void;
  sticky?: boolean;
}

export const QuickActionButtons: FC<QuickActionButtonsProps> = ({
  onNewSpend,
  onEditPeriod,
  onMore,
  sticky = false,
}) => {
  const Container = sticky ? StickyContainer : 'div';

  return (
    <Container className={!sticky ? 'ion-padding ion-flex ion-justify-content-around' : ''}>
      <ActionsContainer>
        <ActionItem>
          <IonButton shape='round' fill='solid' onClick={onNewSpend}>
            <IonIcon icon={createOutline} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>New Spend</IonText>
        </ActionItem>

        <ActionItem>
          <IonButton shape='round' fill='solid' onClick={onEditPeriod}>
            <IonIcon icon={calendarNumberOutline} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>Edit Period</IonText>
        </ActionItem>

        <ActionItem>
          <IonButton shape='round' fill='solid' onClick={onMore}>
            <IonIcon icon={ellipsisHorizontalOutline} slot='icon-only' />
          </IonButton>
          <IonText style={{ fontSize: 'x-small' }}>More</IonText>
        </ActionItem>
      </ActionsContainer>
    </Container>
  );
};
