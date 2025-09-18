import { Suspense } from 'react';
import { BasePageLayout } from '../../components/layouts';
import MainMenuContent from '../../components/menu/MainMenuContent';
import { SentryErrorBoundary } from '../../components/shared';
import { useWallet } from '../../providers/wallet';
import WalletView from './features/spendTracker/WalletView';

const WalletSpendingPage: React.FC = () => {
  const { selectedWallet } = useWallet();
  const pageTitle = selectedWallet ? `${selectedWallet.name} Spending` : 'Wallet Spending';

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
      <Suspense fallback={<div>Loading...</div>}>
        <SentryErrorBoundary>
          <WalletView />
        </SentryErrorBoundary>
      </Suspense>
    </BasePageLayout>
  );
};
export default WalletSpendingPage;
