import { StyledItem } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import { StyledIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import { IonIcon, IonLabel } from '@ionic/react';
import { chevronForward, timeOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ScheduledSpendingCard = styled.div`
  margin: 0 ${designSystem.spacing.md} ${designSystem.spacing.lg} ${designSystem.spacing.md};
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: ${designSystem.borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${designSystem.borderRadius.lg};
  background: rgba(251, 146, 60, 0.1); // Orange background for scheduled/time concept
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${designSystem.spacing.sm};
  margin-top: 8px;
  align-self: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  ion-icon {
    font-size: 20px;
    color: #fb923c; // Orange icon color
  }
`;

interface ScheduledSpendingItemProps {
  futureSpendingCount: number;
  className?: string;
}

export const ScheduledSpendingItem: React.FC<ScheduledSpendingItemProps> = ({
  futureSpendingCount,
  className,
}) => {
  const { t } = useTranslation();

  if (futureSpendingCount === 0) {
    return null;
  }

  return (
    <ScheduledSpendingCard className={className}>
      <StyledIonList lines='none' style={{ backgroundColor: 'transparent' }}>
        <StyledItem
          detail
          detailIcon={chevronForward}
          button
          routerLink={ROUTES.SPENDING_SCHEDULED}
          routerDirection='forward'
        >
          <IconContainer slot='start'>
            <IonIcon icon={timeOutline} />
          </IconContainer>
          <IonLabel>
            <h2>{t('spending.futureSpending')}</h2>
            <p>See your scheduled spending for this period</p>
          </IonLabel>
        </StyledItem>
      </StyledIonList>
    </ScheduledSpendingCard>
  );
};
