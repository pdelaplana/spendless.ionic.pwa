import { CenterContainer } from '@/components/layouts';
import { BasePageLayout } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { DifferenceIndicator, SentryErrorBoundary } from '@/components/shared';
import { SpendList } from '@/components/shared';
import { useFetchSpendingForCharts } from '@/hooks';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GlassCard, GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonIcon, IonProgressBar, IonText } from '@ionic/react';
import { pricetag } from 'ionicons/icons';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useSpendActions } from './hooks/useSpendActions';
import { useSpendTracking } from './hooks/useSpendTracking';

const SummaryCard = styled(GlassCard)`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.lg};
`;

const TagTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  margin-bottom: ${designSystem.spacing.md};
`;

const TagIcon = styled(IonIcon)`
  font-size: 24px;
  color: #8b5fbf;
`;

const TagTitle = styled.h2`
  margin: 0;
  color: ${designSystem.colors.text.primary};
  font-size: 20px;
  font-weight: 600;
`;

const ProgressBarContainer = styled.div`
  margin: ${designSystem.spacing.md} 0;
`;

const AmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${designSystem.spacing.sm} 0;
  font-size: 14px;
`;

const AmountLabel = styled.span`
  color: ${designSystem.colors.text.secondary};
  font-size: 13px;
`;

const AmountValue = styled.span`
  font-weight: 600;
  color: ${designSystem.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NewBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--ion-color-primary);
  background: rgba(139, 95, 191, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
`;

interface TagTransactionsPageParams {
  tagName: string;
}

const TagTransactionsPage: React.FC = () => {
  const { tagName } = useParams<TagTransactionsPageParams>();
  const { account, chartSpending, selectedPeriod, periods } = useSpendingAccount();
  const { editSpendHandler } = useSpendActions();
  const { formatCurrency } = useFormatters();

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

  // Filter spending by tag (all wallets)
  const filteredSpending = useMemo(() => {
    const now = new Date();
    const currentSpending = chartSpending.filter((s) => s.date <= now);

    // Filter by tag
    return currentSpending.filter((spend) => spend.tags?.includes(tagName));
  }, [chartSpending, tagName]);

  // Calculate tag spending for current and previous periods
  const tagSpendingData = useMemo(() => {
    // Current period total
    const currentAmount = filteredSpending.reduce((sum, spend) => sum + spend.amount, 0);

    // Previous period total
    const previousTagSpending = previousPeriodSpending.filter((spend) =>
      spend.tags?.includes(tagName),
    );
    const previousAmount = previousTagSpending.reduce((sum, spend) => sum + spend.amount, 0);

    // Calculate percentage of total period spend
    const totalCurrentSpend = chartSpending
      .filter((s) => s.date <= new Date())
      .reduce((sum, spend) => sum + spend.amount, 0);
    const percentageOfTotal = totalCurrentSpend > 0 ? (currentAmount / totalCurrentSpend) * 100 : 0;

    return {
      currentAmount,
      previousAmount,
      percentageOfTotal,
      isNew: previousAmount === 0,
      difference: currentAmount - previousAmount,
    };
  }, [filteredSpending, previousPeriodSpending, chartSpending, tagName]);

  const { groupedSpending } = useSpendTracking(filteredSpending);

  const getProgressColor = (): 'primary' | 'warning' | 'danger' => {
    if (tagSpendingData.percentageOfTotal <= 20) return 'primary';
    if (tagSpendingData.percentageOfTotal <= 40) return 'warning';
    return 'danger';
  };

  const isIncrease = tagSpendingData.difference > 0;

  return (
    <BasePageLayout
      title='Transactions'
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref={ROUTES.SPENDING_INSIGHTS_TAGS}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <GradientBackground>
        <CenterContainer>
          <SentryErrorBoundary>
            <SummaryCard>
              <TagTitleContainer>
                <TagIcon icon={pricetag} />
                <TagTitle>{tagName?.toLocaleUpperCase()}</TagTitle>
              </TagTitleContainer>

              <ProgressBarContainer>
                <IonProgressBar
                  value={Math.min(tagSpendingData.percentageOfTotal / 100, 1)}
                  color={getProgressColor()}
                />
              </ProgressBarContainer>

              <AmountRow>
                <AmountLabel>Current</AmountLabel>
                <AmountValue>
                  {tagSpendingData.isNew && <NewBadge>New</NewBadge>}
                  {formatCurrency(tagSpendingData.currentAmount, account?.currency)}
                </AmountValue>
              </AmountRow>

              <AmountRow>
                <AmountLabel>Previous</AmountLabel>
                <AmountValue>
                  {tagSpendingData.isNew
                    ? '-'
                    : formatCurrency(tagSpendingData.previousAmount, account?.currency)}
                </AmountValue>
              </AmountRow>

              {!tagSpendingData.isNew && (
                <AmountRow>
                  <AmountLabel>Difference</AmountLabel>
                  <AmountValue>
                    {!tagSpendingData.isNew && tagSpendingData.difference !== 0 && (
                      <DifferenceIndicator increase={isIncrease} />
                    )}
                    <IonText color={isIncrease ? 'danger' : 'success'}>
                      {formatCurrency(Math.abs(tagSpendingData.difference), account?.currency)}
                    </IonText>
                  </AmountValue>
                </AmountRow>
              )}
            </SummaryCard>

            <SpendList
              spending={filteredSpending}
              groupedSpending={groupedSpending}
              onSpendClick={editSpendHandler}
            />
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default TagTransactionsPage;
