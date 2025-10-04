import { CenterContainer, CenterContent } from '@/components/layouts';
import { Gap, MutationNotificationHandler, SpendList } from '@/components/shared';
import { useDeleteWallet, useUpdateWallet } from '@/hooks/api/wallet';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { ROUTES } from '@/routes/routes.constants';
import { GradientBackground } from '@/theme/components';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useCallback, useMemo } from 'react';
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
    chartSpending,
    hasNextPageSpending,
    fetchNextPageSpending,
    didMutationFail,
    didMutationSucceed,
    resetMutationState,
  } = useSpendingAccount();

  // Wallet context
  const { selectedWallet, wallets } = useWallet();

  // Filter spending by selected wallet for UI list (paginated)
  const filteredSpending = useMemo(() => {
    if (!selectedWallet?.id) return [];
    return spending.filter((spend) => spend.walletId === selectedWallet.id);
  }, [spending, selectedWallet?.id]);

  // Filter complete chart spending by selected wallet for accurate budget calculations
  const filteredChartSpending = useMemo(() => {
    if (!selectedWallet?.id) return [];
    return chartSpending.filter((spend) => spend.walletId === selectedWallet.id);
  }, [chartSpending, selectedWallet?.id]);

  const { currentSpending, futureSpending, groupedSpending } = useSpendTracking(filteredSpending);

  // Action hooks
  const { newSpendHandler, editSpendHandler } = useSpendActions();
  const { walletListHandler, walletActionSheetHandler, actionSheet } = useWalletActions();
  const { open: openWalletModal } = useWalletModal();
  const updateWalletMutation = useUpdateWallet();
  const deleteWalletMutation = useDeleteWallet();

  // Memoize budget calculations using COMPLETE chart data (not paginated)
  const budgetCalculations = useMemo(() => {
    const now = new Date();
    const currentTotal = filteredChartSpending
      .filter((spend) => spend.date <= now)
      .reduce((sum, spend) => sum + spend.amount, 0);
    const futureTotal = filteredChartSpending
      .filter((spend) => spend.date > now)
      .reduce((sum, spend) => sum + spend.amount, 0);
    const target = selectedWallet?.spendingLimit || selectedPeriod?.targetSpend || 0;
    return {
      totalSpending: currentTotal,
      remainingBudget: target - currentTotal - futureTotal, // Fixed: subtract both current AND future spending
      targetSpend: target,
      futureSpendingTotal: futureTotal,
    };
  }, [filteredChartSpending, selectedWallet?.spendingLimit, selectedPeriod?.targetSpend]);

  const { remainingBudget, targetSpend, futureSpendingTotal } = budgetCalculations;

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
              remainingBudget={remainingBudget}
              targetSpend={targetSpend}
              periodStartDate={selectedPeriod?.startAt}
              periodEndDate={selectedPeriod?.endAt}
              selectedWallet={selectedWallet}
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
              onAddSpend={newSpendHandler}
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
