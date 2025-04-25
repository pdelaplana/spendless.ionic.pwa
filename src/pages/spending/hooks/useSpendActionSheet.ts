import { useIonActionSheet } from '@ionic/react';
import { usePeriodActions } from './usePeriodActions';
import { useSpendActions } from './useSpendActions';
import {
  calendarNumberOutline,
  calendarClearOutline,
  addCircleOutline,
  trashBinOutline,
  addOutline,
  listOutline,
  todayOutline,
  calendarOutline,
} from 'ionicons/icons';
import { useSpendingAccount } from '@/providers/spendingAccount';

export const useSpendActionSheet = () => {
  const [present] = useIonActionSheet();
  const {
    editCurrentPeriodHandler,
    startNewPeriodHandler,
    deleteClosedPeriodHandler,
    openSpendingPeriodsPage,
  } = usePeriodActions();
  const { newSpendHandler } = useSpendActions();
  const { selectedPeriod, setSelectedPeriod } = useSpendingAccount();

  const openActionSheet = () => {
    let buttons = [
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
        icon: todayOutline,
        handler: startNewPeriodHandler,
      },
      {
        text: 'View All Periods',
        data: {
          action: 'viewAllPeriod',
        },
        icon: calendarOutline,
        handler: openSpendingPeriodsPage,
      },
    ];
    if (selectedPeriod?.closedAt) {
      buttons = [
        ...buttons,
        {
          text: 'Delete Period',
          data: {
            action: 'deletePeriod',
          },
          icon: trashBinOutline,
          handler: () => {
            deleteClosedPeriodHandler(selectedPeriod.id || '');
          },
        },
      ];
    } else if (!selectedPeriod?.closedAt) {
      buttons = [
        ...buttons,
        {
          text: 'New Spend',
          data: {
            action: 'newSpend',
          },
          icon: addCircleOutline,
          handler: newSpendHandler,
        },
      ];
    }

    present({
      header: 'Actions',
      buttons: buttons,
    });
  };

  return {
    openActionSheet,
  };
};
