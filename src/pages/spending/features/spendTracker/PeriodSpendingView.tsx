import { CenterContainer, CenterContent } from '@/components/layouts';
import { Gap, MutationNotificationHandler, StyledItem, TagsDisplay } from '@/components/shared';
import type { IWallet } from '@/domain/Wallet';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { ROUTES } from '@/routes/routes.constants';
import { StyledItemDivider } from '@/styles/IonList.styled';
import {
  GradientBackground,
  GroupedTransactionsContainer,
  TransactionsContainer,
} from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonCard, IonCardContent, IonIcon, IonItemGroup, IonLabel } from '@ionic/react';
import { chevronForward, close } from 'ionicons/icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SpendIcon } from '../../components/base';
import { PeriodSwitcher } from '../../components/common/periodSwitcher';
import { QuickActionButtons } from '../../components/common/quickActionsButtons';
import { ScheduledSpendingItem } from '../../components/common/scheduledSpendingItem';
import { usePeriodActions } from '../../hooks/usePeriodActions';
import { useSpendActionSheet } from '../../hooks/useSpendActionSheet';
import { useSpendActions } from '../../hooks/useSpendActions';
import { useSpendTracking } from '../../hooks/useSpendTracking';
import { useWalletActions } from '../../hooks/useWalletActions';
import { WalletSwitcherActionSheet } from '../../modals/walletList';
import { StyledDateLabel, StyledTotalLabel } from '../../styles/SpendingPage.styled';
import { SpendAnalyticsCharts } from '../spendAnalytics';

interface PeriodSpendingViewProps {
  periodId: string;
  periodStartDate: Date;
  periodEndDate: Date;
  targetSpend: number;
  actualSpend: number;
}

const PeriodSpendingView: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
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
  const { selectedWallet } = useWallet();

  // Filter spending by selected wallet
  const filteredSpending = useMemo(() => {
    if (!selectedWallet) return spending;
    return spending.filter((spend) => spend.walletId === selectedWallet.id);
  }, [spending, selectedWallet]);

  const { currentSpending, futureSpending, groupedSpending } = useSpendTracking(filteredSpending);

  // Action hooks
  const { editCurrentPeriodHandler } = usePeriodActions();
  const { newSpendHandler, editSpendHandler } = useSpendActions();
  const { walletListHandler, walletActionSheetHandler, actionSheet } = useWalletActions();
  const { openActionSheet } = useSpendActionSheet();

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

  return (
    <GradientBackground>
      <MutationNotificationHandler
        didSucceed={didMutationSucceed}
        didFail={didMutationFail}
        onNotified={resetMutationState}
      />

      <CenterContainer>
        <PeriodSwitcher />
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
        {spending.length === 0 ? (
          <CenterContent>
            <h1>{t('spending.noSpending')}</h1>
            <p>{t('spending.noSpendingDescription')}</p>
          </CenterContent>
        ) : (
          <>
            <SpendAnalyticsCharts
              spending={filteredSpending}
              remainingBudget={remainingBudget}
              targetSpend={targetSpend}
              periodStartDate={selectedPeriod?.startAt}
              periodEndDate={selectedPeriod?.endAt}
            />

            <QuickActionButtons
              onNewSpend={newSpendHandler}
              onEditPeriod={editCurrentPeriodHandler}
              onMore={openActionSheet}
              onWalletSwitch={walletListHandler}
              onWalletActionSheet={walletActionSheetHandler}
              currentWallet={selectedWallet}
              sticky={true}
            />

            {futureSpending.length > 0 && (
              <ScheduledSpendingItem
                futureSpendingCount={futureSpending.length}
                futureSpendingTotal={futureSpendingTotal}
              />
            )}

            <TransactionsContainer>
              <div>
                <GroupedTransactionsContainer
                  lines='none'
                  style={{ backgroundColor: 'transparent' }}
                >
                  {groupedSpending.map(([date, spends]) => (
                    <IonItemGroup key={date}>
                      <StyledItemDivider sticky>
                        <StyledDateLabel>{date}</StyledDateLabel>
                      </StyledItemDivider>
                      {spends.map((spend, index) => (
                        <StyledItem
                          key={spend.id}
                          onClick={() => editSpendHandler(spend)}
                          detail
                          detailIcon={chevronForward}
                          button
                          lines={index === spends.length ? 'none' : 'full'}
                        >
                          <SpendIcon category={spend.category} />
                          <IonLabel>
                            <h2>{spend.description}</h2>
                            <p>{t(`spending.categories.${spend.category}`)}</p>
                            <TagsDisplay tags={spend.tags} />
                          </IonLabel>
                          <IonLabel slot='end'>
                            {formatCurrency(spend.amount, account?.currency)}
                          </IonLabel>
                        </StyledItem>
                      ))}
                      <StyledItem lines='none' color='light'>
                        <StyledTotalLabel slot='end'>
                          {formatCurrency(
                            spends.reduce((sum, spend) => sum + spend.amount, 0),
                            account?.currency,
                          )}
                        </StyledTotalLabel>
                      </StyledItem>
                    </IonItemGroup>
                  ))}
                </GroupedTransactionsContainer>

                {hasNextPageSpending && (
                  <div style={{ padding: `${designSystem.spacing.md}` }}>
                    <IonButton
                      onClick={fetchNextPageSpending}
                      color='primary'
                      fill='clear'
                      expand='full'
                    >
                      {t('spending.loadMore')}
                    </IonButton>
                  </div>
                )}
              </div>
            </TransactionsContainer>
          </>
        )}
        <Gap size={'2.3rem'} />
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
export default PeriodSpendingView;
