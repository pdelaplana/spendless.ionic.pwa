import { IonButton, IonIcon } from '@ionic/react';
import { createOutline, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import { Suspense, lazy, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { BasePageLayout } from '../../components/layouts';
import MainMenuContent from '../../components/menu/MainMenuContent';
import { SentryErrorBoundary, SuspenseLoadingScreen } from '../../components/shared';
import { useDeleteWallet, useUpdateWallet } from '../../hooks/api/wallet';
import { useSpendingAccount } from '../../providers/spendingAccount';
import { useWallet } from '../../providers/wallet';
import { useWalletModal } from './modals/walletModal';

const WalletView = lazy(() => import('./features/spendTracker/WalletView'));

const StyledEditButton = styled(IonButton)`
  --color: var(--ion-color-primary);
  margin: 0;

  &::part(native) {
    padding: var(--spacing-sm);
  }

  ion-icon {
    font-size: 20px;
  }
`;

const WalletSpendingPage: React.FC = () => {
  const { selectedWallet, wallets } = useWallet();
  const { account, selectedPeriod, spending } = useSpendingAccount();
  const updateWalletMutation = useUpdateWallet();
  const deleteWalletMutation = useDeleteWallet();
  const { open: openWalletModal } = useWalletModal();

  const pageTitle = useMemo(
    () => (selectedWallet ? `${selectedWallet.name}` : 'Wallet'),
    [selectedWallet],
  );

  // Filter spending by selected wallet
  const filteredSpending = useMemo(
    () => spending.filter((spend) => spend.walletId === selectedWallet?.id),
    [spending, selectedWallet?.id],
  );

  const handleDeleteWallet = useCallback(
    (walletId: string) => {
      if (account?.id && selectedPeriod?.id) {
        deleteWalletMutation.mutate({
          accountId: account.id,
          periodId: selectedPeriod.id,
          walletId: walletId,
        });
      }
    },
    [account?.id, selectedPeriod?.id, deleteWalletMutation],
  );

  const handleEditWallet = useCallback(async () => {
    if (selectedWallet?.id && account?.id && selectedPeriod?.id && account.currency) {
      const accountId = account.id;
      const periodId = selectedPeriod.id;
      const walletId = selectedWallet.id;
      const currency = account.currency;

      await openWalletModal(
        selectedWallet,
        (walletData) => {
          updateWalletMutation.mutate({
            accountId,
            periodId,
            walletId,
            updates: walletData,
          });
        },
        accountId,
        periodId,
        wallets,
        currency,
        handleDeleteWallet,
        filteredSpending,
      );
    }
  }, [
    selectedWallet,
    account?.id,
    account?.currency,
    selectedPeriod?.id,
    openWalletModal,
    updateWalletMutation,
    wallets,
    handleDeleteWallet,
    filteredSpending,
  ]);

  const endButtons = useMemo(() => {
    return selectedWallet ? (
      <StyledEditButton
        fill='clear'
        size='large'
        onClick={handleEditWallet}
        aria-label='Edit wallet'
      >
        <IonIcon slot='icon-only' icon={ellipsisHorizontal} />
      </StyledEditButton>
    ) : undefined;
  }, [selectedWallet, handleEditWallet]);

  return (
    <BasePageLayout
      title={pageTitle}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref='/spending'
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
      endButtons={endButtons}
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
