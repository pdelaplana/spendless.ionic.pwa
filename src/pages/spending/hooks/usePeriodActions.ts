import { useSpendingAccount } from '@/providers/spendingAccount';
import { usePeriodModal } from '../modals/PeriodModal';
import { usePeriodListModal } from '../modals/PeriodListModal';
import { usePrompt } from '@/hooks';

export const usePeriodActions = () => {
  const {
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
        targetSpend: 0,
        targetSavings: 0,
        startAt: new Date(),
        endAt: new Date(),
        reflection: '',
        createdAt: new Date(),
        updatedAt: new Date(),
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
        refetchSpending();
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
