import { Suspense, lazy } from 'react';
import { BasePageLayout } from '../../components/layouts';
import MainMenuContent from '../../components/menu/MainMenuContent';
import { SentryErrorBoundary, SuspenseLoadingScreen } from '../../components/shared';
import { useWallet } from '../../providers/wallet';

const WalletSpendingPage: React.FC = () => {
  const { selectedWallet } = useWallet();
  const pageTitle = selectedWallet ? `${selectedWallet.name}` : 'Wallet';

  const WalletView = lazy(() => import('./features/spendTracker/WalletView'));

  return (
    <BasePageLayout
      title={pageTitle}
      showHeader={true}
      showBackButton={true}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <Suspense fallback={<SuspenseLoadingScreen message='Loading your spending data...' />}>
        <SentryErrorBoundary>
          <WalletView />
        </SentryErrorBoundary>
      </Suspense>
    </BasePageLayout>
  );
};
export default WalletSpendingPage;
