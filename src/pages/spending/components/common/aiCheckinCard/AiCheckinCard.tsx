import { ClickableInfoCard, NotificationBadge } from '@/components/shared';
import { useFetchAiInsights } from '@/hooks/api/aiInsights';
import { useSpendingAccount } from '@/providers/spendingAccount/useSpendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import { sparklesOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const AiCheckinCard: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account } = useSpendingAccount();

  // Only fetch insights when the AI check-in feature is enabled on the account
  const { data: insights = [] } = useFetchAiInsights(
    account?.aiCheckinEnabled ? account?.id : undefined,
    { limit: 1 },
  );

  // Unread detection: compare insight.generatedAt vs account.lastAiCheckinAt
  const hasUnreadInsight =
    insights.length > 0 &&
    (!account?.lastAiCheckinAt || insights[0].generatedAt > account.lastAiCheckinAt);

  const handleNavigateToCoach = () => {
    history.push(ROUTES.SPENDING_COACH);
  };

  return (
    <ClickableInfoCard
      icon={sparklesOutline}
      title={t('insights.aiCheckinCard.title')}
      description={t('insights.aiCheckinCard.description')}
      linkText={t('insights.aiCheckinCard.viewInsights')}
      onClick={handleNavigateToCoach}
      backgroundColor={designSystem.colors.primary[500]}
      iconBackground={designSystem.colors.brand.primary}
      iconColor={designSystem.colors.text.inverse}
      textColor={designSystem.colors.text.inverse}
      linkColor={designSystem.colors.text.inverse}
      badge={hasUnreadInsight ? <NotificationBadge /> : undefined}
    />
  );
};

export default AiCheckinCard;
