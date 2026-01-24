import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GlassCard, GradientBackground } from '@/theme/components';
import type React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { designSystem } from '../../theme';
import { MoodInsightsCard, MoodSpendingChart } from './components/moodSpending';

const ContentWrapper = styled(GlassCard)`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  padding: ${designSystem.spacing.lg};
`;

const MoodAnalysisPage: React.FC = () => {
  const { chartSpending, account } = useSpendingAccount();
  const { t } = useTranslation();

  // Filter current period spending (all wallets)
  const filteredSpending = useMemo(() => {
    const now = new Date();
    return chartSpending.filter((s) => s.date <= now);
  }, [chartSpending]);

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
            <ContentWrapper>
              <MoodSpendingChart
                spending={filteredSpending}
                currency={account?.currency || 'USD'}
              />
            </ContentWrapper>
            <ContentWrapper>
              <MoodInsightsCard spending={filteredSpending} currency={account?.currency || 'USD'} />
            </ContentWrapper>
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default MoodAnalysisPage;
