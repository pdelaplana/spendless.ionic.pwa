import { BasePageLayout } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { SentryErrorBoundary } from '@/components/shared';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useTranslation } from 'react-i18next';
import NoCurrentPeriodView from './features/spendTracker/NoCurrentPeriodView';
import PeriodSpendingView from './features/spendTracker/PeriodSpendingView';

const SpendingPage: React.FC = () => {
  const { t } = useTranslation();

  const { selectedPeriod, account } = useSpendingAccount();

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
      <SentryErrorBoundary>
        {selectedPeriod && account && <PeriodSpendingView />}
        {!selectedPeriod && <NoCurrentPeriodView />}
      </SentryErrorBoundary>
    </BasePageLayout>
  );
};

export default SpendingPage;
