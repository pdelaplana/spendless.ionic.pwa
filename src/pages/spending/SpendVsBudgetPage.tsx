import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import type { IPeriod } from '@/domain/Period';
import { useFetchWalletsByPeriod } from '@/hooks';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GlassCard, GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonText } from '@ionic/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SpendVsBudgetChart from './components/spendVsBudget/SpendVsBudgetChart';

const ChartWrapper = styled(GlassCard)`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.lg};
`;

const HeaderContainer = styled.div`
  margin-bottom: ${designSystem.spacing.lg};
  text-align: center;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

type PeriodWithActualSpend = IPeriod & { actualSpend: number };

const SpendVsBudgetPage: React.FC = () => {
  const { t } = useTranslation();
  const { account, periods } = useSpendingAccount();

  // Get last 6 periods for the chart (including current)
  const chartPeriods = useMemo(() => {
    if (!periods || periods.length === 0) return [];

    // Sort periods by startAt date (newest first) and take the last 6
    // Only include periods with defined IDs
    const sortedPeriods = [...periods]
      .filter((period): period is PeriodWithActualSpend & { id: string } => !!period.id) // Type guard
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
      .slice(0, 6)
      .reverse(); // Reverse to show oldest first (left to right)

    return sortedPeriods;
  }, [periods]);

  // Always call hooks - use empty arrays when no data
  const accountId = account?.id || '';

  // Fetch wallets for each period (always call hooks with the same number of calls)
  const wallet1Query = useFetchWalletsByPeriod(accountId, chartPeriods[0]?.id || '');
  const wallet2Query = useFetchWalletsByPeriod(accountId, chartPeriods[1]?.id || '');
  const wallet3Query = useFetchWalletsByPeriod(accountId, chartPeriods[2]?.id || '');
  const wallet4Query = useFetchWalletsByPeriod(accountId, chartPeriods[3]?.id || '');
  const wallet5Query = useFetchWalletsByPeriod(accountId, chartPeriods[4]?.id || '');
  const wallet6Query = useFetchWalletsByPeriod(accountId, chartPeriods[5]?.id || '');

  const walletQueries = useMemo(
    () => [wallet1Query, wallet2Query, wallet3Query, wallet4Query, wallet5Query, wallet6Query],
    [wallet1Query, wallet2Query, wallet3Query, wallet4Query, wallet5Query, wallet6Query],
  );

  // Get aggregated data for the chart (total budget vs total spending per period)
  const periodSpendingData = useMemo(() => {
    const data: Array<{
      periodName: string;
      totalBudget: number;
      totalSpent: number;
    }> = [];

    if (!accountId || chartPeriods.length === 0) {
      return data;
    }

    for (let i = 0; i < chartPeriods.length && i < 6; i++) {
      const period = chartPeriods[i];
      const wallets = walletQueries[i]?.data || [];

      // Calculate total budget across all wallets for this period
      const totalBudget = wallets.reduce((sum, wallet) => sum + wallet.spendingLimit, 0);

      // Use the period's actualSpend as the total spending
      const totalSpent = period.actualSpend;

      // Format period name consistently for chart display
      const formatPeriodName = (period: PeriodWithActualSpend & { id: string }) => {
        // Try to parse the existing name to extract dates and reformat consistently
        const existingName = period.name;

        // If the name appears to be a date range, try to reformat it consistently
        if (existingName.includes(' - ')) {
          try {
            // Try to extract and reformat the dates for consistency
            const startDate = new Date(period.startAt);
            const endDate = new Date(period.endAt);

            const startFormatted = startDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const endFormatted = endDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return `${startFormatted} - ${endFormatted}`;
          } catch {
            // If parsing fails, use the original name
            return existingName;
          }
        }

        // If it's not a date range format, use the original name
        return existingName;
      };

      data.push({
        periodName: formatPeriodName(period),
        totalBudget,
        totalSpent,
      });
    }

    return data;
  }, [chartPeriods, walletQueries, accountId]);

  const isLoading = walletQueries.some((query) => query.isFetching);

  // Early return if no account
  if (!account?.id) {
    return (
      <BasePageLayout
        title={t('insights.spendVsBudget.title', 'Spend vs Budget')}
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
            <ChartWrapper>
              <LoadingContainer>
                <IonText>No account data available</IonText>
              </LoadingContainer>
            </ChartWrapper>
          </CenterContainer>
        </GradientBackground>
      </BasePageLayout>
    );
  }

  return (
    <BasePageLayout
      title={t('insights.spendVsBudget.title', 'Spend vs Budget')}
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
            <ChartWrapper>
              {isLoading ? (
                <LoadingContainer>
                  <IonText>Loading chart data...</IonText>
                </LoadingContainer>
              ) : (
                <SpendVsBudgetChart data={periodSpendingData} />
              )}
            </ChartWrapper>
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default SpendVsBudgetPage;
