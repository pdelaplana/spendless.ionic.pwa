import { useIonActionSheet } from '@ionic/react';
import { usePeriodActions } from './usePeriodActions';
import { useSpendActions } from './useSpendActions';
import { calendarNumberOutline, calendarClearOutline, addCircleOutline } from 'ionicons/icons';

export const useSpendActionSheet = () => {
  const [present] = useIonActionSheet();
  const { editCurrentPeriodHandler, startNewPeriodHandler, openSpendingPeriodsPage } =
    usePeriodActions();
  const { newSpendHandler } = useSpendActions();

  const openActionSheet = () => {
    present({
      header: 'Actions',
      buttons: [
        {
          text: 'Edit Current Period',
          role: 'destructive',
          data: {
            action: 'editCurrentPeriod',
          },
          icon: calendarNumberOutline,
          handler: editCurrentPeriodHandler,
        },
        {
          text: 'Start New Period',
          data: {
            action: 'startNewPeriod',
          },
          icon: calendarClearOutline,
          handler: startNewPeriodHandler,
        },
        {
          text: 'View All Periods',
          data: {
            action: 'viewAllPeriod',
          },
          icon: calendarClearOutline,
          handler: openSpendingPeriodsPage,
        },
        {
          text: 'New Spend',
          data: {
            action: 'newSpend',
          },
          icon: addCircleOutline,
          handler: newSpendHandler,
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });
  };

  return {
    openActionSheet,
  };
};
