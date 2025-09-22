import { CenterContainer, CenterContent } from '@/components/layouts';
import { Gap, MutationNotificationHandler, SpendList } from '@/components/shared';
import { useDeleteWallet, useUpdateWallet } from '@/hooks/api/wallet';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { ROUTES } from '@/routes/routes.constants';
import { GradientBackground } from '@/theme/components';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { ScheduledSpendingItem } from '../../components/common/scheduledSpendingItem';
import WalletEmptyState from '../../components/common/walletEmptyState/WalletEmptyState';
import WalletQuickActionButtons from '../../components/common/walletQuickActionButtons/WalletQuickActionButtons';
import { useSpendActions } from '../../hooks/useSpendActions';
import { useSpendTracking } from '../../hooks/useSpendTracking';
import { useWalletActions } from '../../hooks/useWalletActions';
import { WalletSwitcherActionSheet } from '../../modals/walletList';
import { useWalletModal } from '../../modals/walletModal';
import { SpendAnalyticsCharts } from '../spendAnalytics';

const WalletView: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const {
    account,
    selectedPeriod,
    setSelectedPeriod,
    spending,
    hasNextPageSpending,
    fetchNextPageSpending,
    didMutationFail,
    didMutationSucceed,
    resetMutationState,
  } = useSpendingAccount();

  // Wallet context
  const { selectedWallet, wallets } = useWallet();

  // Filter spending by selected wallet
  const filteredSpending = useMemo(() => {
    if (!selectedWallet) return [];
    return spending.filter((spend) => spend.walletId === selectedWallet.id);
  }, [spending, selectedWallet]);

  const { currentSpending, futureSpending, groupedSpending } = useSpendTracking(filteredSpending);

  // Action hooks
  const { newSpendHandler, editSpendHandler } = useSpendActions();
  const { walletListHandler, walletActionSheetHandler, actionSheet } = useWalletActions();
  const { open: openWalletModal } = useWalletModal();
  const updateWalletMutation = useUpdateWallet();
  const deleteWalletMutation = useDeleteWallet();

  const { remainingBudget, targetSpend, futureSpendingTotal } = useMemo(() => {
    const total = currentSpending.reduce((sum, spend) => sum + spend.amount, 0);
    const futureTotal = futureSpending.reduce((sum, spend) => sum + spend.amount, 0);
    const target = selectedWallet?.spendingLimit || selectedPeriod?.targetSpend || 0;
    return {
      totalSpending: total,
      remainingBudget: target - total,
      targetSpend: target,
      futureSpendingTotal: futureTotal,
    };
  }, [currentSpending, futureSpending, selectedPeriod, selectedWallet]);

  const handleDeleteWallet = (walletId: string) => {
    if (account?.id && selectedPeriod?.id) {
      deleteWalletMutation.mutate({
        accountId: account.id,
        periodId: selectedPeriod.id,
        walletId: walletId,
      });
    }
  };

  const handleEditWallet = async () => {
    if (selectedWallet && account?.id && selectedPeriod?.id) {
      await openWalletModal(
        selectedWallet,
        (walletData) => {
          updateWalletMutation.mutate({
            accountId: account.id!,
            periodId: selectedPeriod.id!,
            walletId: selectedWallet.id!,
            updates: walletData,
          });
        },
        account.id,
        selectedPeriod.id,
        wallets,
        account.currency,
        handleDeleteWallet,
        filteredSpending,
      );
    }
  };

  // Show message if no wallet is selected
  if (!selectedWallet) {
    return (
      <GradientBackground>
        <CenterContainer>
          <CenterContent>
            <h1>{t('wallet.noWalletSelected')}</h1>
            <p>{t('wallet.selectWalletToViewSpending')}</p>
            <IonButton onClick={() => history.push(ROUTES.SPENDING)} color='primary' expand='block'>
              {t('wallet.backToSpending')}
            </IonButton>
          </CenterContent>
        </CenterContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <MutationNotificationHandler
        didSucceed={didMutationSucceed}
        didFail={didMutationFail}
        onNotified={resetMutationState}
      />

      <CenterContainer>
        {selectedPeriod?.closedAt && (
          <IonCard>
            <IonCardContent>
              <div className='ion-flex ion-justify-content-between ion-align-items-start'>
                <p>{`${t('spending.viewingClosedPeriodMessage')}`}</p>
                <IonButton
                  onClick={() => {
                    setSelectedPeriod(undefined);
                  }}
                  color='primary'
                  fill='clear'
                  shape='round'
                >
                  <IonIcon icon={close} slot='icon-only' />
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {filteredSpending.length === 0 ? (
          <WalletEmptyState
            wallet={selectedWallet}
            onNewSpend={newSpendHandler}
            onEditWallet={handleEditWallet}
          />
        ) : (
          <>
            <SpendAnalyticsCharts
              spending={filteredSpending}
              remainingBudget={remainingBudget}
              targetSpend={targetSpend}
              periodStartDate={selectedPeriod?.startAt}
              periodEndDate={selectedPeriod?.endAt}
            />

            <WalletQuickActionButtons
              onNewSpend={newSpendHandler}
              onEditWallet={handleEditWallet}
              currentWallet={selectedWallet}
              sticky={true}
            />

            {futureSpending.length > 0 && (
              <ScheduledSpendingItem
                futureSpendingCount={futureSpending.length}
                futureSpendingTotal={futureSpendingTotal}
              />
            )}

            <SpendList
              spending={filteredSpending}
              groupedSpending={groupedSpending}
              hasNextPage={hasNextPageSpending}
              onLoadMore={fetchNextPageSpending}
              onSpendClick={editSpendHandler}
            />
          </>
        )}
      </CenterContainer>

      {/* Wallet Switcher Action Sheet */}
      <WalletSwitcherActionSheet
        isOpen={actionSheet.isOpen}
        wallets={actionSheet.wallets}
        currentWallet={actionSheet.currentWallet}
        onWalletSelected={actionSheet.onWalletSelected}
        onDismiss={actionSheet.close}
      />
    </GradientBackground>
  );
};

export default WalletView;
