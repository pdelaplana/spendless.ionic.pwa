import { StyledItem, MutationNotificationHandler, Gap } from '@/components/shared';
import {
  IonLabel,
  IonItemGroup,
  IonIcon,
  IonFab,
  IonFabButton,
  IonButton,
  IonCardContent,
  IonCard,
} from '@ionic/react';
import { addCircleSharp, chevronForward, close, documentsOutline } from 'ionicons/icons';
import { StyledDateLabel, StyledTotalLabel } from '../../styles/SpendingPage.styled';
import useFormatters from '@/hooks/ui/useFormatters';
import { useTranslation } from 'react-i18next';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useMemo } from 'react';
import { CenterContainer, CenterContent } from '@/components/layouts';
import { ROUTES } from '@/routes/routes.constants';
import { SpendIcon } from '../../components/base';
import { useSpendTracking } from '../../hooks/useSpendTracking';
import { usePeriodActions } from '../../hooks/usePeriodActions';
import { useSpendActions } from '../../hooks/useSpendActions';
import { useSpendActionSheet } from '../../hooks/useSpendActionSheet';
import { SpendAnalyticsCharts } from '../spendAnalytics';
import { QuickActionButtons } from '../../components/common/quickActionsButtons';
import { StyledIonList, StyledItemDivider } from '@/styles/IonList.styled';

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

  const { currentSpending, futureSpending, groupedSpending } = useSpendTracking(spending);
  const { editCurrentPeriodHandler } = usePeriodActions();
  const { newSpendHandler, editSpendHandler } = useSpendActions();
  const { openActionSheet } = useSpendActionSheet();

  const { remainingBudget } = useMemo(() => {
    const total = currentSpending.reduce((sum, spend) => sum + spend.amount, 0);
    return {
      totalSpending: total,
      remainingBudget: (selectedPeriod?.targetSpend || 0) - total,
    };
  }, [currentSpending, selectedPeriod]);

  return (
    <>
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
        {spending.length === 0 ? (
          <CenterContent>
            <h1>{t('spending.noSpending')}</h1>
            <p>{t('spending.noSpendingDescription')}</p>
          </CenterContent>
        ) : (
          <>
            <SpendAnalyticsCharts
              spending={spending}
              remainingBudget={remainingBudget}
              targetSpend={selectedPeriod?.targetSpend}
              periodStartDate={selectedPeriod?.startAt}
              periodEndDate={selectedPeriod?.endAt}
            />

            <QuickActionButtons
              onNewSpend={newSpendHandler}
              onEditPeriod={editCurrentPeriodHandler}
              onMore={openActionSheet}
            />

            <StyledIonList
              lines='none'
              className='ion-margin-bottom'
              style={{ backgroundColor: 'var(--color-light)' }}
            >
              {futureSpending.length > 0 && (
                <StyledItem
                  detail
                  detailIcon={chevronForward}
                  button
                  routerLink={ROUTES.SPENDING_SCHEDULED}
                  routerDirection='forward'
                >
                  <IonIcon icon={documentsOutline} slot='start' />
                  <IonLabel>
                    <h2>{t('spending.futureSpending')}</h2>
                    <p>See your scheduled spending for this period</p>
                  </IonLabel>
                </StyledItem>
              )}
            </StyledIonList>
            <StyledIonList
              color='light'
              style={{ backgroundColor: 'var(--color-light)' }}
              lines='none'
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
            </StyledIonList>
            {hasNextPageSpending && (
              <IonButton onClick={fetchNextPageSpending} color='primary' fill='clear' expand='full'>
                {t('spending.loadMore')}
              </IonButton>
            )}
          </>
        )}
        <Gap size={'2.3rem'} />
      </CenterContainer>
      {!selectedPeriod?.closedAt && (
        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton
            id='open-action-sheet'
            color='primary'
            onClick={() => {
              newSpendHandler();
            }}
          >
            <IonIcon icon={addCircleSharp} />
          </IonFabButton>
        </IonFab>
      )}
    </>
  );
};
export default PeriodSpendingView;
