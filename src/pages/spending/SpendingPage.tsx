import { BasePageLayout } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import NoCurrentPeriodView from './features/spendTracker/NoCurrentPeriodView';
import { useIonRouter } from '@ionic/react';
import GettingStarted from './features/spendTracker/GettingStarted';

const SpendingPage: React.FC = () => {
  const { t } = useTranslation();

  const { push } = useIonRouter();
  const { selectedPeriod, account, periods } = useSpendingAccount();
  const isFirstTime = !periods || periods.length === 0;

  const PeriodDashboard = lazy(() => import('./features/spendTracker/PeriodDashboard'));

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
      <Suspense fallback={<div>Loading...</div>}>
        <SentryErrorBoundary>
          {!account?.onboardingCompleted && <GettingStarted />}
          {account?.onboardingCompleted && selectedPeriod && <PeriodDashboard />}
          {account?.onboardingCompleted && !selectedPeriod && <NoCurrentPeriodView isFirstTime={isFirstTime} />}
        </SentryErrorBoundary>
      </Suspense>
    </BasePageLayout>
  );
};

export default SpendingPage;
