import { BasePageLayout } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useTranslation } from 'react-i18next';
import CurrentPeriodSpendingView from './features/spendTracker/CurrentPeriodSpendingView';
import NoCurrentPeriodView from './components/sections/NoCurrentPeriodView';
import { ErrorBoundary } from '@/components/shared';

const SpendingPage: React.FC = () => {
  const { t } = useTranslation();

  const { currentPeriod } = useSpendingAccount();

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
      <ErrorBoundary>
        {currentPeriod && <CurrentPeriodSpendingView />}
        {!currentPeriod && <NoCurrentPeriodView />}
      </ErrorBoundary>
    </BasePageLayout>
  );
};

export default SpendingPage;
