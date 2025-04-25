import { BasePageLayout } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useTranslation } from 'react-i18next';
import PeriodSpendingView from './features/spendTracker/PeriodSpendingView';
import NoCurrentPeriodView from './features/spendTracker/NoCurrentPeriodView';
import { ErrorBoundary } from '@/components/shared';
import useFormatters from '@/hooks/ui/useFormatters';

const SpendingPage: React.FC = () => {
  const { t } = useTranslation();

  const { selectedPeriod } = useSpendingAccount();
  const { formatDate } = useFormatters();

  return (
    <BasePageLayout
      title={
        selectedPeriod?.closedAt
          ? `${formatDate(selectedPeriod.startAt)} to ${formatDate(selectedPeriod.endAt)}`
          : 'Spending'
      }
      showHeader={true}
      showBackButton={false}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <ErrorBoundary>
        {selectedPeriod && <PeriodSpendingView />}
        {!selectedPeriod && <NoCurrentPeriodView />}
      </ErrorBoundary>
    </BasePageLayout>
  );
};

export default SpendingPage;
