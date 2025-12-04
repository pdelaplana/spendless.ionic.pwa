import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import { useFetchAiInsightById } from '@/hooks/api/aiInsights';
import { useSubscription } from '@/hooks/subscription';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount/useSpendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GlassCard, GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { generateListItemKey } from '@/utils/generateListItemKey';
import { IonBadge, IonIcon, IonSpinner, IonText } from '@ionic/react';
import {
  bulbOutline,
  calendarOutline,
  cardOutline,
  pricetagsOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled(GlassCard)`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.lg};
`;

const HeaderSection = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
  padding-bottom: ${designSystem.spacing.lg};
  border-bottom: 1px solid ${designSystem.colors.gray[200]};
`;

const Title = styled.h1`
  margin: 0 0 ${designSystem.spacing.sm} 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};
`;

const MetadataRow = styled.div`
  display: flex;
  gap: ${designSystem.spacing.md};
  flex-wrap: wrap;
  margin-top: ${designSystem.spacing.md};
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  font-size: 0.875rem;
  color: ${designSystem.colors.textSecondary};
`;

const Section = styled.div`
  margin-bottom: ${designSystem.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  margin-bottom: ${designSystem.spacing.md};
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};
`;

const SectionIcon = styled(IonIcon)`
  font-size: 1.5rem;
  color: ${designSystem.colors.brandPurple};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.lg};
`;

const StatCard = styled.div`
  background: ${designSystem.colors.gray[50]};
  padding: ${designSystem.spacing.md};
  border-radius: ${designSystem.borderRadius.md};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${designSystem.colors.textSecondary};
  margin-bottom: ${designSystem.spacing.xs};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};
`;

const TrendBadge = styled(IonBadge)<{ $trend: 'increasing' | 'decreasing' | 'stable' }>`
  --background: ${({ $trend }) =>
    $trend === 'increasing'
      ? designSystem.colors.danger
      : $trend === 'decreasing'
        ? designSystem.colors.success
        : designSystem.colors.gray[400]};
  font-weight: 600;
  text-transform: uppercase;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 0;
  border-bottom: 1px solid ${designSystem.colors.gray[200]};
  font-size: 0.95rem;
  color: ${designSystem.colors.textPrimary};

  &:last-child {
    margin-bottom: ${designSystem.spacing.md};
  }
`;

const RecommendationCard = styled.div`
  background: ${designSystem.colors.primary[50]};
  border-left: 4px solid ${designSystem.colors.brandPurple};
  padding: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.sm};
  border-radius: ${designSystem.borderRadius.md};
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl} 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl};
  color: ${designSystem.colors.danger};
`;

interface RouteParams {
  insightId: string;
}

const AiInsightDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { insightId } = useParams<RouteParams>();
  const { account } = useSpendingAccount();
  const subscription = useSubscription(account ?? null);
  const { data: insight, isLoading, error } = useFetchAiInsightById(account?.id, insightId);
  const { formatCurrency } = useFormatters();

  if (insight) {
    console.log('[AiInsightDetailPage] Insight Data:', {
      id: insight.id,
      analysisType: insight.analysisType,
      totalSpending: insight.totalSpendingAnalyzed,
      transactionCount: insight.transactionCount,
      hasInsights: !!insight.insights,
      insightsKeys: insight.insights ? Object.keys(insight.insights) : [],
    });

    console.log('Insight Insights:', insight);
  }

  // Helper functions - must be defined before any early returns
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAnalysisTypeLabel = (type: 'weekly' | 'period-end') => {
    return type === 'weekly' ? t('insights.aiInsights.weekly') : t('insights.aiInsights.periodEnd');
  };

  // Redirect free users to settings page to upgrade
  useEffect(() => {
    if (!subscription.isPremium) {
      history.replace(ROUTES.SETTINGS);
    }
  }, [subscription.isPremium, history]);

  // Don't render anything while redirecting
  if (!subscription.isPremium) {
    return null;
  }

  if (isLoading) {
    return (
      <BasePageLayout
        title={t('insights.aiInsights.title')}
        showHeader={true}
        showBackButton={true}
        defaultBackButtonHref={ROUTES.SPENDING_CHECKINS}
        showLogo={false}
        showProfileIcon={false}
        showMenu={true}
        menu={<MainMenuContent />}
      >
        <GradientBackground>
          <CenterContainer>
            <PageContainer>
              <LoadingContainer>
                <IonSpinner />
                <IonText>
                  <p>{t('common.loading')}</p>
                </IonText>
              </LoadingContainer>
            </PageContainer>
          </CenterContainer>
        </GradientBackground>
      </BasePageLayout>
    );
  }

  if (error || !insight) {
    return (
      <BasePageLayout
        title={t('insights.aiInsights.title')}
        showHeader={true}
        showBackButton={true}
        defaultBackButtonHref={ROUTES.SPENDING_CHECKINS}
        showLogo={false}
        showProfileIcon={false}
        showMenu={true}
        menu={<MainMenuContent />}
      >
        <GradientBackground>
          <CenterContainer>
            <PageContainer>
              <ErrorContainer>
                <IonText>
                  <p>{t('insights.aiInsights.fetchFailed')}</p>
                </IonText>
              </ErrorContainer>
            </PageContainer>
          </CenterContainer>
        </GradientBackground>
      </BasePageLayout>
    );
  }

  return (
    <BasePageLayout
      title={t('insights.aiInsights.title')}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref={ROUTES.SPENDING_CHECKINS}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <GradientBackground>
        <CenterContainer>
          <SentryErrorBoundary>
            <PageContainer>
              {/* Header Section */}
              <HeaderSection>
                <IonBadge color='primary'>{getAnalysisTypeLabel(insight.analysisType)}</IonBadge>
                <Title>
                  {insight.periodName ||
                    `${t('insights.aiInsights.title')} - ${formatDate(insight.generatedAt)}`}
                </Title>

                {/* Key Takeaway */}
                {insight.keyTakeaway && (
                  <RecommendationCard style={{ marginTop: designSystem.spacing.md }}>
                    {insight.keyTakeaway}
                  </RecommendationCard>
                )}

                <MetadataRow>
                  <MetadataItem>
                    <IonIcon icon={calendarOutline} />
                    {insight.periodStartDate && insight.periodEndDate ? (
                      <span>
                        {formatDate(insight.periodStartDate)} - {formatDate(insight.periodEndDate)}
                      </span>
                    ) : insight.weekStartDate && insight.weekEndDate ? (
                      <span>
                        {formatDate(insight.weekStartDate)} - {formatDate(insight.weekEndDate)}
                      </span>
                    ) : (
                      <span>{formatDate(insight.generatedAt)}</span>
                    )}
                  </MetadataItem>
                </MetadataRow>
              </HeaderSection>

              {/* Overview Stats */}
              <Section>
                <SectionHeader>
                  <SectionIcon icon={cardOutline} />
                  <SectionTitle>{t('insights.aiInsights.overview')}</SectionTitle>
                </SectionHeader>
                <StatsGrid>
                  <StatCard>
                    <StatLabel>{t('insights.aiInsights.totalSpending')}</StatLabel>
                    <StatValue>{formatCurrency(insight.totalSpendingAnalyzed)}</StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>{t('insights.aiInsights.transactionCount')}</StatLabel>
                    <StatValue>{insight.transactionCount}</StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>{t('insights.aiInsights.categoriesAnalyzed')}</StatLabel>
                    <StatValue>{insight.categoriesAnalyzed.length}</StatValue>
                  </StatCard>
                </StatsGrid>
              </Section>

              {/* Spending Patterns */}
              {insight.insights?.patterns && (
                <Section>
                  <SectionHeader>
                    <SectionIcon icon={trendingUpOutline} />
                    <SectionTitle>{t('insights.aiInsights.patterns')}</SectionTitle>
                  </SectionHeader>

                  {insight.insights.patterns.summary && (
                    <>
                      <StatLabel>{t('insights.aiInsights.summary')}</StatLabel>
                      <List>
                        <ListItem>
                          <ReactMarkdown>{insight.insights.patterns.summary}</ReactMarkdown>
                        </ListItem>
                      </List>
                    </>
                  )}

                  {insight.insights.patterns.trends &&
                    insight.insights.patterns.trends.length > 0 && (
                      <>
                        <StatLabel>Spending Trends</StatLabel>

                        <List>
                          {insight.insights.patterns.trends.map((trend, index) => (
                            <ListItem key={generateListItemKey(trend, index, 'trend')}>
                              <ReactMarkdown>{trend}</ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                  {insight.insights.patterns.recurringVsNonRecurring && (
                    <>
                      <StatLabel>{t('insights.aiInsights.recurringSpending')}</StatLabel>
                      <List>
                        <ListItem>
                          <ReactMarkdown>
                            {insight.insights.patterns.recurringVsNonRecurring}
                          </ReactMarkdown>
                        </ListItem>
                      </List>
                    </>
                  )}

                  {insight.insights.patterns.dayOfWeekPatterns &&
                    insight.insights.patterns.dayOfWeekPatterns.length > 0 && (
                      <>
                        <StatLabel>{t('insights.aiInsights.dayPatterns')}</StatLabel>
                        <List>
                          {insight.insights.patterns.dayOfWeekPatterns.map((pattern, index) => (
                            <ListItem key={generateListItemKey(pattern, index, 'day-pattern')}>
                              <ReactMarkdown>{pattern}</ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                  {((insight.insights.patterns.unusualSpending &&
                    insight.insights.patterns.unusualSpending.length > 0) ||
                    (insight.insights.patterns.unusualPurchases &&
                      insight.insights.patterns.unusualPurchases.length > 0)) && (
                    <>
                      <StatLabel>{t('insights.aiInsights.unusualPurchases')}</StatLabel>
                      <List>
                        {(
                          insight.insights.patterns.unusualSpending ||
                          insight.insights.patterns.unusualPurchases ||
                          []
                        ).map((purchase, index) => (
                          <ListItem key={generateListItemKey(purchase, index, 'purchase')}>
                            <ReactMarkdown>{purchase}</ReactMarkdown>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Section>
              )}

              {/* Category Breakdown */}
              {insight.insights?.categories && (
                <Section>
                  <SectionHeader>
                    <SectionIcon icon={pricetagsOutline} />
                    <SectionTitle>{t('insights.aiInsights.categories')}</SectionTitle>
                  </SectionHeader>
                  <StatLabel>{t('insights.aiInsights.topCategories')}</StatLabel>
                  <List>
                    {insight.insights.categories?.topCategories.map((category, index) => (
                      <ListItem key={generateListItemKey(category, index, 'category')}>
                        <ReactMarkdown>{category.category}</ReactMarkdown>
                      </ListItem>
                    ))}
                  </List>

                  {insight.insights.categories.budgetPerformance && (
                    <>
                      <StatLabel>Budget Performance</StatLabel>
                      <List>
                        <ListItem>
                          <ReactMarkdown>
                            {insight.insights.categories.budgetPerformance}
                          </ReactMarkdown>
                        </ListItem>
                      </List>
                    </>
                  )}
                </Section>
              )}

              {/* Tag Analysis */}
              {insight.insights.tags && insight.insights.tags.topTags.length > 0 && (
                <Section>
                  <SectionHeader>
                    <SectionIcon icon={pricetagsOutline} />
                    <SectionTitle>{t('insights.aiInsights.tags')}</SectionTitle>
                  </SectionHeader>

                  <StatLabel>{t('insights.aiInsights.topTags')}</StatLabel>

                  <List>
                    {insight.insights.tags.topTags.map((tagItem, index) => (
                      <ListItem key={generateListItemKey(tagItem, index, 'tag')}>
                        <ReactMarkdown>{tagItem.tag}</ReactMarkdown>
                      </ListItem>
                    ))}
                  </List>

                  {insight.insights.tags.tagCorrelations &&
                    insight.insights.tags.tagCorrelations.length > 0 && (
                      <>
                        <StatLabel>{t('insights.aiInsights.tagCorrelations')}</StatLabel>
                        <List>
                          {insight.insights.tags.tagCorrelations.map((correlation, index) => (
                            <ListItem key={generateListItemKey(correlation, index, 'correlation')}>
                              <ReactMarkdown>
                                {typeof correlation === 'string'
                                  ? correlation
                                  : correlation.tags
                                    ? correlation.tags.join(', ')
                                    : 'Unknown'}
                              </ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                  {insight.insights.tags.recommendations &&
                    insight.insights.tags.recommendations.length > 0 && (
                      <>
                        <StatLabel>{t('insights.aiInsights.tagRecommendations')}</StatLabel>
                        <List>
                          {insight.insights.tags.recommendations.map((recommendation, index) => (
                            <ListItem key={generateListItemKey(recommendation, index, 'tag-rec')}>
                              <ReactMarkdown>{recommendation}</ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                  {insight.insights.tags.budgetRecommendations &&
                    insight.insights.tags.budgetRecommendations.length > 0 && (
                      <>
                        <StatLabel>Budget Recommendations</StatLabel>
                        <List>
                          {insight.insights.tags.budgetRecommendations.map(
                            (recommendation, index) => (
                              <ListItem
                                key={generateListItemKey(recommendation, index, 'budget-rec')}
                              >
                                <ReactMarkdown>{recommendation}</ReactMarkdown>
                              </ListItem>
                            ),
                          )}
                        </List>
                      </>
                    )}

                  {insight.insights.tags.tagTrends &&
                    insight.insights.tags.tagTrends.length > 0 && (
                      <div>
                        <StatLabel>Tag Trends</StatLabel>
                        <List>
                          {insight.insights.tags.tagTrends.map((trendItem, index) => (
                            <ListItem key={generateListItemKey(trendItem.tag, index, 'tag-trend')}>
                              <ReactMarkdown>{trendItem.tag}</ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>
                      </div>
                    )}
                </Section>
              )}

              {/* Period Comparison */}
              {insight.insights.comparison && (
                <Section>
                  <SectionHeader>
                    <SectionIcon icon={trendingUpOutline} />
                    <SectionTitle>{t('insights.aiInsights.comparison')}</SectionTitle>
                  </SectionHeader>

                  {insight.insights.comparison.summary && (
                    <>
                      <StatLabel>Summary</StatLabel>
                      <List>
                        <ListItem>
                          <ReactMarkdown>{insight.insights.comparison.summary}</ReactMarkdown>
                        </ListItem>
                      </List>
                    </>
                  )}

                  {insight.insights.comparison.previousPeriodSpending !== undefined && (
                    <div>
                      <StatLabel>{t('insights.aiInsights.previousPeriod')}</StatLabel>
                      <StatValue>
                        {formatCurrency(insight.insights.comparison.previousPeriodSpending)}
                      </StatValue>
                      {insight.insights.comparison.changePercentage !== undefined && (
                        <div>
                          <TrendBadge
                            $trend={
                              insight.insights.comparison.changePercentage > 0
                                ? 'increasing'
                                : insight.insights.comparison.changePercentage < 0
                                  ? 'decreasing'
                                  : 'stable'
                            }
                          >
                            {insight.insights.comparison.changePercentage > 0 ? '+' : ''}
                            {insight.insights.comparison.changePercentage}%
                          </TrendBadge>
                        </div>
                      )}
                    </div>
                  )}

                  {insight.insights.comparison.improvements &&
                    insight.insights.comparison.improvements.length > 0 && (
                      <>
                        <StatLabel>{t('insights.aiInsights.improvements')}</StatLabel>
                        <List>
                          {insight.insights.comparison.improvements.map((improvement, index) => (
                            <ListItem key={generateListItemKey(improvement, index, 'improvement')}>
                              <ReactMarkdown>{improvement}</ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                  {insight.insights.comparison.concerns &&
                    insight.insights.comparison.concerns.length > 0 && (
                      <div>
                        <StatLabel>{t('insights.aiInsights.concerns')}</StatLabel>
                        <List>
                          {insight.insights.comparison.concerns.map((concern, index) => (
                            <ListItem key={generateListItemKey(concern, index, 'concern')}>
                              <ReactMarkdown>{concern}</ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>
                      </div>
                    )}
                </Section>
              )}

              {/* Actionable Recommendations */}
              {insight.insights?.recommendations && (
                <Section>
                  <SectionHeader>
                    <SectionIcon icon={bulbOutline} />
                    <SectionTitle>{t('insights.aiInsights.recommendations')}</SectionTitle>
                  </SectionHeader>
                  {insight.insights.recommendations.map((recommendation, index) => (
                    <RecommendationCard
                      key={generateListItemKey(recommendation, index, 'recommendation')}
                    >
                      <ReactMarkdown>{recommendation}</ReactMarkdown>
                    </RecommendationCard>
                  ))}
                </Section>
              )}

              {/* Analysis Metadata */}
              <Section>
                <SectionHeader>
                  <SectionIcon icon={bulbOutline} />
                  <SectionTitle>{t('insights.aiInsights.metadata')}</SectionTitle>
                </SectionHeader>

                {/* Categories and Tags Lists */}
                {(insight.categoriesAnalyzed.length > 0 || insight.tagsAnalyzed.length > 0) && (
                  <div>
                    {insight.categoriesAnalyzed.length > 0 && (
                      <div>
                        <StatLabel>{t('insights.aiInsights.categoriesAnalyzedList')}</StatLabel>
                        <div>
                          {insight.categoriesAnalyzed.map((category, index) => (
                            <IonBadge
                              key={generateListItemKey(category, index, 'category')}
                              color='light'
                            >
                              {category}
                            </IonBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.tagsAnalyzed.length > 0 && (
                      <div>
                        <StatLabel>{t('insights.aiInsights.tagsAnalyzedList')}</StatLabel>
                        <div>
                          {insight.tagsAnalyzed.map((tag, index) => (
                            <IonBadge key={generateListItemKey(tag, index, 'tag')} color='light'>
                              {tag}
                            </IonBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Section>
            </PageContainer>
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default AiInsightDetailPage;
