import { ROUTES } from '@/routes/routes.constants';
import { IonIcon } from '@ionic/react';
import { analyticsOutline, chevronForward } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  InsightsCardContainer,
  InsightsCardContent,
  InsightsDescription,
  InsightsIconContainer,
  InsightsLink,
  InsightsTextContainer,
  InsightsTitle,
} from './InsightsCard.styled';

interface InsightsCardProps {
  className?: string;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ className }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleClick = () => {
    history.push(ROUTES.SPENDING_INSIGHTS);
  };

  return (
    <InsightsCardContainer className={className}>
      <InsightsCardContent>
        <InsightsIconContainer>
          <IonIcon icon={analyticsOutline} />
        </InsightsIconContainer>
        <InsightsTextContainer>
          <InsightsTitle>{t('insights.title')}</InsightsTitle>
          <InsightsDescription>{t('insights.description')}</InsightsDescription>
          <InsightsLink onClick={handleClick}>
            Start Exploring
            <IonIcon icon={chevronForward} />
          </InsightsLink>
        </InsightsTextContainer>
      </InsightsCardContent>
    </InsightsCardContainer>
  );
};

export default InsightsCard;
