import { BasePageLayout } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import NoCurrentPeriodView from './features/spendTracker/NoCurrentPeriodView';
import PeriodDashboard from './features/spendTracker/PeriodDashboard';
import PeriodSpendingView from './features/spendTracker/PeriodSpendingView';

const SpendingPage: React.FC = () => {
  const { t } = useTranslation();

  const { selectedPeriod, account } = useSpendingAccount();

  const PeriodDashboard = lazy(() => import('./features/spendTracker/PeriodDashboard'));

  return (
    <BasePageLayout
      title='Spending'
      showHeader={true}
      showBackButton={false}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SentryErrorBoundary>
          {selectedPeriod && account && <PeriodDashboard />}
          {!selectedPeriod && <NoCurrentPeriodView />}
        </SentryErrorBoundary>
      </Suspense>
    </BasePageLayout>
  );
};

export default SpendingPage;
