import { BasePageLayout } from '@/components/layouts';
import AccountSetupLoading from '@/components/loading/AccountSetupLoading';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary, SuspenseLoadingScreen } from '@/components/shared';
import { useEnsureAccount } from '@/hooks';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useIonRouter } from '@ionic/react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Move lazy imports outside component to prevent re-initialization on every render
const PeriodDashboard = lazy(() => import('./features/spendTracker/PeriodDashboard'));
const GettingStarted = lazy(() => import('./features/spendTracker/GettingStarted'));
const NoCurrentPeriodView = lazy(() => import('./features/spendTracker/NoCurrentPeriodView'));

const SpendingPage: React.FC = () => {
  const { isAccountLoading, account: authAccount } = useEnsureAccount();
  const { selectedPeriod, periods, isFetching } = useSpendingAccount();
  const [isStateReady, setIsStateReady] = useState(false);
  const isFirstTime = !periods || periods.length === 0;

  // Wait for all critical states to stabilize before rendering content
  useEffect(() => {
    // State is ready when:
    // 1. Account is loaded and not in loading state
    // 2. Initial data fetching is complete
    // 3. For onboarded users, we have period data (or confirmed there are none)
    const stateIsStable =
      !isAccountLoading &&
      authAccount !== undefined &&
      !isFetching &&
      (authAccount?.onboardingCompleted === false || periods !== undefined);

    if (stateIsStable && !isStateReady) {
      setIsStateReady(true);
    }
  }, [isAccountLoading, authAccount, isFetching, periods, isStateReady]);

  // Memoize the content component to prevent flickering during state changes
  // IMPORTANT: Must be called before any conditional returns (Rules of Hooks)
  const content = useMemo(() => {
    if (!authAccount?.onboardingCompleted) {
      return <GettingStarted />;
    }
    if (selectedPeriod) {
      return <PeriodDashboard />;
    }
    return <NoCurrentPeriodView isFirstTime={isFirstTime} />;
  }, [authAccount?.onboardingCompleted, selectedPeriod, isFirstTime]);

  // Show single unified loading screen until all states are ready
  // This combines account loading and data fetching into one smooth experience
  if (isAccountLoading || !isStateReady) {
    return null;
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
        <SentryErrorBoundary>{content}</SentryErrorBoundary>
      </Suspense>
    </BasePageLayout>
  );
};

export default SpendingPage;
