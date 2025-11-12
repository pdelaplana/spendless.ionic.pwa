import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import { useFetchSpendingForCharts } from '@/hooks';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GlassCard, GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { TagSpendingList } from './components/tagSpending';

const ListWrapper = styled(GlassCard)`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
`;

const SpendAnalysisByTagsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account, chartSpending, selectedPeriod, periods } = useSpendingAccount();

  // Find the previous period
  const previousPeriod = useMemo(() => {
    if (!periods || periods.length === 0 || !selectedPeriod) return undefined;
    const currentIndex = periods.findIndex((p) => p.id === selectedPeriod.id);
    if (currentIndex === -1 || currentIndex === periods.length - 1) return undefined;
    return periods[currentIndex + 1];
  }, [periods, selectedPeriod]);

  // Fetch previous period spending data
  const { data: previousPeriodSpending = [] } = useFetchSpendingForCharts(
    account?.id,
    previousPeriod?.id,
    previousPeriod?.startAt,
    previousPeriod?.endAt,
  );

  // Filter current period spending (all wallets)
  const filteredCurrentSpending = useMemo(() => {
    const now = new Date();
    return chartSpending.filter((s) => s.date <= now);
  }, [chartSpending]);

  // Use all previous period spending (all wallets)
  const filteredPreviousSpending = useMemo(() => {
    return previousPeriodSpending;
  }, [previousPeriodSpending]);

  const handleTagClick = (tagName: string) => {
    history.push(ROUTES.SPENDING_INSIGHTS_TAG_TRANSACTIONS.replace(':tagName', tagName));
  };

  return (
    <BasePageLayout
      title='Spend Analysis by Tags'
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref={ROUTES.SPENDING_INSIGHTS}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <GradientBackground>
        <CenterContainer>
          <SentryErrorBoundary>
            <ListWrapper>
              <TagSpendingList
                currentPeriodSpending={filteredCurrentSpending}
                previousPeriodSpending={filteredPreviousSpending}
                currency={account?.currency}
                onTagClick={handleTagClick}
              />
            </ListWrapper>
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default SpendAnalysisByTagsPage;
