import { ClickableInfoCard, NotificationBadge } from '@/components/shared';
import { useFetchAiInsights } from '@/hooks/api/aiInsights';
import { useSubscription } from '@/hooks/subscription';
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
  const subscription = useSubscription(account ?? null);

  // Premium gating
  if (!subscription.isPremium || !account?.aiCheckinEnabled) {
    return null;
  }

  // Fetch latest insight to check unread status
  const { data: insights = [] } = useFetchAiInsights(account?.id, { limit: 1 });

  // Unread detection: compare insight.generatedAt vs account.lastAiCheckinAt
  const hasUnreadInsight =
    insights.length > 0 &&
    (!account?.lastAiCheckinAt || insights[0].generatedAt > account.lastAiCheckinAt);

  const handleNavigateToCheckins = () => {
    history.push(ROUTES.SPENDING_CHECKINS);
  };

  return (
    <ClickableInfoCard
      icon={sparklesOutline}
      title={t('insights.aiCheckinCard.title')}
      description={t('insights.aiCheckinCard.description')}
      linkText={t('insights.aiCheckinCard.viewInsights')}
      onClick={handleNavigateToCheckins}
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
