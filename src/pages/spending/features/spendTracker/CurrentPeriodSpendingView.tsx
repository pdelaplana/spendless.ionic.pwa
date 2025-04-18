import { StyledItem, MutationNotificationHandler } from '@/components/shared';
import { IonLabel, IonItemGroup, IonIcon, IonFab, IonFabButton } from '@ionic/react';
import {
  addCircleOutline,
  addCircleSharp,
  chevronDownCircle,
  chevronForward,
  documentsOutline,
} from 'ionicons/icons';
import {
  StyledIonList,
  StyledItemDivider,
  StyledDateLabel,
  StyledTotalLabel,
} from '../../styles/SpendingPage.styled';
import useFormatters from '@/hooks/ui/useFormatters';
import { useTranslation } from 'react-i18next';
import { useAppNotifications } from '@/hooks';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useEffect, useMemo } from 'react';
import { CenterContainer, CenterContent } from '@/components/layouts';
import { ROUTES } from '@/routes/routes.constants';
import { SpendIcon } from '../../components/base';
import { useSpendTracking } from '../../hooks/useSpendTracking';
import { usePeriodActions } from '../../hooks/usePeriodActions';
import { useSpendActions } from '../../hooks/useSpendActions';
import { useSpendActionSheet } from '../../hooks/useSpendActionSheet';
import { SpendAnalyticsCharts } from '../spendAnalytics/components/SpendAnalyticsCharts';
import { QuickActionButtons } from '../../components/common/quickActionsButtons';

const CurrentPeriodSpendingView: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const {
    account,
    currentPeriod,
    spending,
    didMutationFail,
    didMutationSucceed,
    resetMutationState,
  } = useSpendingAccount();

  const { currentSpending, futureSpending, groupedSpending } = useSpendTracking(spending);
  const { editCurrentPeriodHandler } = usePeriodActions();
  const { newSpendHandler, editSpendHandler } = useSpendActions();
  const { openActionSheet } = useSpendActionSheet();

  const { totalSpending, remainingBudget } = useMemo(() => {
    const total = currentSpending.reduce((sum, spend) => sum + spend.amount, 0);
    return {
      totalSpending: total,
      remainingBudget: (currentPeriod?.targetSpend || 0) - total,
    };
  }, [currentSpending, currentPeriod]);

  return (
    <>
      <MutationNotificationHandler
        didSucceed={didMutationSucceed}
        didFail={didMutationFail}
        onNotified={resetMutationState}
      />

      <CenterContainer>
        {spending.length === 0 ? (
          <CenterContent>
            <h1>{t('spend.noSpending')}</h1>
            <p>{t('spend.noSpendingDescription')}</p>
          </CenterContent>
        ) : (
          <>
            <SpendAnalyticsCharts
              spending={spending}
              remainingBudget={remainingBudget}
              targetSpend={currentPeriod?.targetSpend}
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
                    <h2>{t('spend.futureSpending')}</h2>
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
                        <p>{t(`spend.categories.${spend.category}`)}</p>
                      </IonLabel>
                      <IonLabel slot='end'>{formatCurrency(spend.amount)}</IonLabel>
                    </StyledItem>
                  ))}
                  <StyledItem lines='none' color='light'>
                    <StyledTotalLabel slot='end'>
                      {formatCurrency(spends.reduce((sum, spend) => sum + spend.amount, 0))}
                    </StyledTotalLabel>
                  </StyledItem>
                </IonItemGroup>
              ))}
            </StyledIonList>
          </>
        )}
      </CenterContainer>

      <IonFab slot='fixed' vertical='top' horizontal='end' edge>
        <IonFabButton id='open-action-sheet' color='primary' onClick={newSpendHandler}>
          <IonIcon icon={addCircleSharp} />
        </IonFabButton>
      </IonFab>
    </>
  );
};
export default CurrentPeriodSpendingView;
