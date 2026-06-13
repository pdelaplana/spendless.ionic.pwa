import { ClickableInfoCard } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import { analyticsOutline } from 'ionicons/icons';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

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
    <ClickableInfoCard
      className={className}
      icon={analyticsOutline}
      title={t('insights.title')}
      description={t('insights.description')}
      linkText='Start Exploring'
      onClick={handleClick}
      iconBackground={designSystem.colors.primary[50]}
      iconColor={designSystem.colors.primary[500]}
    />
  );
};

export default InsightsCard;
