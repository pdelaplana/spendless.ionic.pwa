import { usePrompt } from '@/hooks';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { addWeeks, set } from 'date-fns';
import { usePeriodListModal } from '../modals/PeriodListModal';
import { usePeriodModal } from '../modals/periodModal/PeriodModal';

export const usePeriodActions = () => {
  const {
    account,
    selectedPeriod,
    periods,
    setSelectedPeriod,
    updatePeriod,
    deleteClosedPeriod,
    startPeriod,
    refetchSpending,
    resetMutationState,
  } = useSpendingAccount();

  const { showConfirmPrompt } = usePrompt();

  const { open: openPeriodModal } = usePeriodModal();
  const { open: openPeriodListModal } = usePeriodListModal();

  const editCurrentPeriodHandler = () => {
    if (selectedPeriod) {
      openPeriodModal(
        {
          ...selectedPeriod,
        },
        async (data) => {
          await updatePeriod({
            periodId: selectedPeriod.id || '',
            data,
          });
          resetMutationState();
          refetchSpending();
        },
      );
    }
  };

  const startNewPeriodHandler = () => {
    openPeriodModal(
      {
        name: '',
        goals: '',
        targetSpend: selectedPeriod?.targetSpend || 0,
        targetSavings: selectedPeriod?.targetSavings || 0,
        startAt: new Date(),
        endAt: addWeeks(new Date(), 4),
        reflection: '',
      },
      async (data) => {
        await startPeriod({
          ...data,
        });
        resetMutationState();
        refetchSpending();
      },
    );
  };

  const openSpendingPeriodsPage = () => {
    const pastPeriods = periods.filter((period) => period.closedAt);
    openPeriodListModal(pastPeriods, (period) => {
      setSelectedPeriod(period);
    });
  };

  const deleteClosedPeriodHandler = (periodId: string) => {
    showConfirmPrompt({
      title: 'Delete Period',
      message: 'Are you sure you want to delete this period?',
      onConfirm: async () => {
        await deleteClosedPeriod({ periodId });
        resetMutationState();
        setSelectedPeriod(undefined);
      },
      onCancel: () => {
        // Handle cancel action
      },
    });
  };

  return {
    editCurrentPeriodHandler,
    startNewPeriodHandler,
    deleteClosedPeriodHandler,
    openSpendingPeriodsPage,
  };
};
