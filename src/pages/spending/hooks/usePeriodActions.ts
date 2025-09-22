import { usePrompt } from '@/hooks';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { addWeeks } from 'date-fns';
import { usePeriodListModal } from '../modals/periodList/PeriodListModal';
import { usePeriodEditModal } from '../modals/periodModal/usePeriodEditModal';
import { usePeriodModalV2 } from '../modals/periodModal/usePeriodModalV2';

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

  const { open: openPeriodModal } = usePeriodModalV2();
  const { open: openPeriodEditModal } = usePeriodEditModal();
  const { open: openPeriodListModal } = usePeriodListModal();

  const editCurrentPeriodHandler = () => {
    if (selectedPeriod) {
      openPeriodEditModal(selectedPeriod, async (data) => {
        console.log('usePeriodActions: Updating period with data:', data);
        console.log('usePeriodActions: Selected period ID:', selectedPeriod.id);
        const updatedPeriod = await updatePeriod({
          periodId: selectedPeriod.id || '',
          data,
        });
        console.log('usePeriodActions: Update completed, updated period:', updatedPeriod);

        // Update the selected period state with the fresh data
        if (updatedPeriod) {
          setSelectedPeriod(updatedPeriod);
        }

        resetMutationState();
        console.log('usePeriodActions: Refetching spending data');
        refetchSpending();
      });
    }
  };

  const startNewPeriodHandler = () => {
    openPeriodModal(
      undefined, // No existing period for new period creation
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
    openPeriodListModal(
      periods,
      (period) => {
        setSelectedPeriod(period);
      },
      deleteClosedPeriodHandler,
    );
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
