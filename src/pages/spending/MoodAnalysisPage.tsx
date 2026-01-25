import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GlassCard, GradientBackground } from '@/theme/components';
import { IonText } from '@ionic/react';
import type React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { designSystem } from '../../theme';
import { MoodInsightsCard, MoodSpendingChart } from './components/moodSpending';

const ContentWrapper = styled(GlassCard)<{ delay?: string }>`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.lg};
  opacity: 0;
  animation: fadeInBrand 0.6s ease-out forwards;
  animation-delay: ${(props) => props.delay || '0s'};
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${designSystem.spacing.md};
  color: var(--ion-color-medium);
  width: 100%;
`;

const MoodAnalysisPage: React.FC = () => {
  const { chartSpending, account, isFetching, isFetchingChartData } = useSpendingAccount();
  const { t } = useTranslation();

  const isLoading = isFetching || isFetchingChartData;

  // Filter current period spending (all wallets)
  const filteredSpending = useMemo(() => {
    const now = new Date();
    return chartSpending.filter((s) => s.date <= now);
  }, [chartSpending]);

  // Early return if no account data
  if (!account?.id && !isLoading) {
    return (
      <BasePageLayout
        title={t('moodAnalysis.title', 'Mood Analysis')}
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
            <ContentWrapper>
              <LoadingContainer>
                <IonText>{t('moodAnalysis.noAccount', 'No account data available')}</IonText>
              </LoadingContainer>
            </ContentWrapper>
          </CenterContainer>
        </GradientBackground>
      </BasePageLayout>
    );
  }

  return (
    <BasePageLayout
      title={t('moodAnalysis.title', 'Mood Analysis')}
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
            <ContentWrapper delay='0.1s'>
              {isLoading ? (
                <LoadingContainer>
                  <IonText>{t('moodAnalysis.loading', 'Loading chart data...')}</IonText>
                </LoadingContainer>
              ) : (
                <>
                  <MoodSpendingChart
                    spending={filteredSpending}
                    currency={account?.currency || 'USD'}
                  />
                  <MoodInsightsCard
                    spending={filteredSpending}
                    currency={account?.currency || 'USD'}
                  />
                </>
              )}
            </ContentWrapper>
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default MoodAnalysisPage;
