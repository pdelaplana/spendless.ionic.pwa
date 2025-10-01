import { BasePageLayout } from '@/components/layouts';
import AccountSetupLoading from '@/components/loading/AccountSetupLoading';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary, SuspenseLoadingScreen } from '@/components/shared';
import { useEnsureAccount } from '@/hooks';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useIonRouter } from '@ionic/react';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';

const SpendingPage: React.FC = () => {
  const { isAccountLoading, account: authAccount } = useEnsureAccount();
  const { selectedPeriod, periods } = useSpendingAccount();
  const isFirstTime = !periods || periods.length === 0;

  const PeriodDashboard = lazy(() => import('./features/spendTracker/PeriodDashboard'));
  const GettingStarted = lazy(() => import('./features/spendTracker/GettingStarted'));
  const NoCurrentPeriodView = lazy(() => import('./features/spendTracker/NoCurrentPeriodView'));

  // Show account setup loading state if account is not yet available
  if (isAccountLoading) {
    return <AccountSetupLoading />;
  }

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
          {authAccount?.onboardingCompleted && !selectedPeriod && (
            <NoCurrentPeriodView isFirstTime={isFirstTime} />
          )}
        </SentryErrorBoundary>
      </Suspense>
    </BasePageLayout>
  );
};

export default SpendingPage;
