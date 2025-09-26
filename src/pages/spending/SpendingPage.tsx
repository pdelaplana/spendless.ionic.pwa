import { BasePageLayout } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary, SuspenseLoadingScreen } from '@/components/shared';
import { useAuth } from '@/providers/auth';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useIonRouter } from '@ionic/react';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import GettingStarted from './features/spendTracker/GettingStarted';
import NoCurrentPeriodView from './features/spendTracker/NoCurrentPeriodView';

const SpendingPage: React.FC = () => {
  const { t } = useTranslation();

  const { push } = useIonRouter();
  const { account: authAccount } = useAuth(); // Get account from AuthProvider for onboarding check
  const { selectedPeriod, periods } = useSpendingAccount();
  const isFirstTime = !periods || periods.length === 0;

  const PeriodDashboard = lazy(() => import('./features/spendTracker/PeriodDashboard'));
  const GettingStarted = lazy(() => import('./features/spendTracker/GettingStarted'));

  return (
    <BasePageLayout
      title='Spending'
      showHeader={false}
      showBackButton={false}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
      menuSide='end'
    >
      <Suspense fallback={<SuspenseLoadingScreen message='Loading your spending data...' />}>
        <SentryErrorBoundary>
          {!authAccount?.onboardingCompleted && <GettingStarted />}
          {authAccount?.onboardingCompleted && selectedPeriod && <PeriodDashboard />}
        </SentryErrorBoundary>
      </Suspense>
    </BasePageLayout>
  );
};

export default SpendingPage;
