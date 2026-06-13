import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { DateSeparator, EmptyState, LoadingState, SentryErrorBoundary } from '@/components/shared';
import type { AnalysisType } from '@/domain/AiInsight';
import { useMarkAiInsightsRead } from '@/hooks/api/account';
import { useAiInsightsRealtime, useFetchAiInsights } from '@/hooks/api/aiInsights';
import { useSubscription } from '@/hooks/subscription';
import { useInfiniteScrollList } from '@/hooks/ui';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount/useSpendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import {
  IonAvatar,
  IonBadge,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/react';
import {
  analyticsOutline,
  arrowForwardOutline,
  settingsOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
`;

const ListSection = styled.div`
  padding: ${designSystem.spacing.lg};
`;

const InsightsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.xl};
`;

const InsightCardWrapper = styled.div`
  display: flex;
  gap: ${designSystem.spacing.md};
  margin: ${designSystem.spacing.md} 0;
`;

const InsightCard = styled.div<{ $isWeekly: boolean }>`
  flex: 1;
  background: ${(props) =>
    props.$isWeekly
      ? `linear-gradient(135deg, ${designSystem.colors.secondary[200]} 0%, ${designSystem.colors.secondary[300]} 100%)`
      : `linear-gradient(135deg, ${designSystem.colors.brand.secondary} 0%, ${designSystem.colors.brand.primary} 100%)`};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid
    ${(props) =>
      props.$isWeekly ? designSystem.colors.secondary[300] : designSystem.colors.brand.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const AvatarContainer = styled.div`
  flex-shrink: 0;
  padding-top: 2px;
`;

const StyledAvatar = styled(IonAvatar)<{ $isWeekly: boolean }>`
  width: 40px;
  height: 40px;
  background: ${(props) =>
    props.$isWeekly
      ? `linear-gradient(135deg, ${designSystem.colors.primary[400]} 0%, ${designSystem.colors.primary[600]} 100%)`
      : `linear-gradient(135deg, ${designSystem.colors.brand.primary} 0%, ${designSystem.colors.brand.secondary} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const AvatarIcon = styled(IonIcon)<{ $isWeekly: boolean }>`
  font-size: 20px;
  color: ${(props) =>
    props.$isWeekly ? designSystem.colors.text.inverse : designSystem.colors.text.inverse};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${designSystem.spacing.sm};
`;

const CardBadge = styled(IonBadge)`
  font-size: 0.75rem;
  font-weight: 600;
`;

const CardTitle = styled.div<{ $isWeekly: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) =>
    props.$isWeekly ? designSystem.colors.textPrimary : designSystem.colors.text.inverse};
  margin-bottom: ${designSystem.spacing.xs};
`;

const CardSummary = styled.div<{ $isWeekly: boolean }>`
  font-size: 0.9rem;
  color: ${(props) =>
    props.$isWeekly ? designSystem.colors.textSecondary : 'rgba(255, 255, 255, 0.85)'};
  line-height: 1.5;
  margin-bottom: ${designSystem.spacing.sm};
`;

const CardMeta = styled.div<{ $isWeekly: boolean }>`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.md};
  font-size: 0.875rem;
  color: ${(props) =>
    props.$isWeekly ? designSystem.colors.textSecondary : 'rgba(255, 255, 255, 0.75)'};
`;

const CardMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardCTA = styled.div<{ $isWeekly: boolean }>`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  margin-top: ${designSystem.spacing.md};
  padding-top: ${designSystem.spacing.sm};
  border-top: 1px solid
    ${(props) =>
      props.$isWeekly ? designSystem.colors.secondary[200] : 'rgba(255, 255, 255, 0.2)'};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) =>
    props.$isWeekly ? designSystem.colors.primary[600] : 'rgba(255, 255, 255, 0.9)'};
`;

const AiInsightsListPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account } = useSpendingAccount();
  const subscription = useSubscription(account ?? null);
  const { formatDate } = useFormatters();

  const { mutate: markAsRead } = useMarkAiInsightsRead();

  // Fetch all insights (we'll paginate on the client side)
  const {
    data: insights = [],
    isLoading,
    refetch: refetchInsights,
  } = useFetchAiInsights(account?.id);

  // Use infinite scroll hook for pagination
  const {
    hasMore,
    handleInfiniteScroll,
    visibleItems: visibleInsights,
  } = useInfiniteScrollList(insights, {
    itemsPerPage: 10,
  });

  // Real-time listener for new insights
  useAiInsightsRealtime(account?.id, {
    onNewInsight: () => {
      // Refetch insights to show the new one
      refetchInsights();
    },
  });

  // Redirect free users to settings page to upgrade
  useEffect(() => {
    if (!subscription.isPremium) {
      history.replace(ROUTES.SETTINGS);
    }
  }, [subscription.isPremium, history]);

  // Mark insights as read when premium users view the page
  useEffect(() => {
    if (subscription.isPremium && account?.id) {
      markAsRead(account.id);
    }
  }, [subscription.isPremium, account?.id, markAsRead]);

  // Don't render anything while redirecting
  if (!subscription.isPremium) {
    return null;
  }

  const handleInsightClick = (insightId: string) => {
    history.push(ROUTES.SPENDING_CHECKINS_DETAIL.replace(':insightId', insightId));
  };

  const getAnalysisTypeLabel = (type: AnalysisType) => {
    return type === 'weekly' ? t('insights.aiInsights.weekly') : t('insights.aiInsights.periodEnd');
  };

  // Group visible insights by date using the same format as spending list
  const groupedInsights = useMemo(() => {
    return visibleInsights.reduce(
      (groups, insight) => {
        const dateKey = formatDate(insight.generatedAt, true);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(insight);
        return groups;
      },
      {} as Record<string, typeof visibleInsights>,
    );
  }, [visibleInsights, formatDate]);

  const isFeatureEnabled = account?.aiCheckinEnabled ?? false;

  return (
    <BasePageLayout
      title={t('insights.aiInsights.checkinsTitle')}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref={ROUTES.SPENDING}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <GradientBackground>
        <CenterContainer>
          <SentryErrorBoundary>
            <PageContainer>
              {/* List Section */}
              <ListSection>
                {isLoading ? (
                  <LoadingState message={t('common.loading')} />
                ) : !isFeatureEnabled ? (
                  <EmptyState
                    icon={settingsOutline}
                    title={t('insights.aiInsights.featureDisabled')}
                    description={t('insights.aiInsights.featureDisabledDescription')}
                  />
                ) : insights.length === 0 ? (
                  <EmptyState
                    icon={sparklesOutline}
                    title={t('insights.aiInsights.noInsights')}
                    description={t('insights.aiInsights.noInsightsDescription')}
                  />
                ) : (
                  <>
                    <InsightsContainer>
                      {Object.entries(groupedInsights).map(([dateKey, dateInsights]) => (
                        <div key={dateKey}>
                          <DateSeparator date={dateKey} />
                          {dateInsights.map((insight) => {
                            const isWeekly = insight.analysisType === 'weekly';
                            const summary =
                              insight.keyTakeaway || insight.insights?.patterns?.summary;

                            return (
                              <InsightCardWrapper key={insight.id}>
                                <AvatarContainer>
                                  <StyledAvatar $isWeekly={isWeekly}>
                                    <AvatarIcon $isWeekly={isWeekly} icon={sparklesOutline} />
                                  </StyledAvatar>
                                </AvatarContainer>
                                <InsightCard
                                  $isWeekly={isWeekly}
                                  onClick={() => insight.id && handleInsightClick(insight.id)}
                                >
                                  <CardHeader>
                                    <CardBadge color={isWeekly ? 'primary' : 'success'}>
                                      {getAnalysisTypeLabel(insight.analysisType)}
                                    </CardBadge>
                                  </CardHeader>
                                  <CardTitle $isWeekly={isWeekly}>
                                    {insight.periodName || formatDate(insight.generatedAt, false)}
                                  </CardTitle>
                                  {summary && (
                                    <CardSummary $isWeekly={isWeekly}>{summary}</CardSummary>
                                  )}
                                  <CardMeta $isWeekly={isWeekly}>
                                    <CardMetaItem>
                                      <IonIcon icon={analyticsOutline} />
                                      <span>{insight.transactionCount} transactions</span>
                                    </CardMetaItem>
                                    <CardMetaItem>
                                      <span>•</span>
                                      <span>{formatDate(insight.generatedAt, false)}</span>
                                    </CardMetaItem>
                                  </CardMeta>
                                  <CardCTA $isWeekly={isWeekly}>
                                    <span>Explore more</span>
                                    <IonIcon icon={arrowForwardOutline} />
                                  </CardCTA>
                                </InsightCard>
                              </InsightCardWrapper>
                            );
                          })}
                        </div>
                      ))}
                    </InsightsContainer>

                    {/* Infinite Scroll */}
                    {hasMore && (
                      <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
                        <IonInfiniteScrollContent loadingText={t('common.loading')} />
                      </IonInfiniteScroll>
                    )}
                  </>
                )}
              </ListSection>
            </PageContainer>
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default AiInsightsListPage;
