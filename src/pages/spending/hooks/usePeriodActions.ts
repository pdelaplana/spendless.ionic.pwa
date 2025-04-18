import { useSpendingAccount } from '@/providers/spendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { usePeriodModal } from '../modals/PeriodModal';
import { useIonRouter } from '@ionic/react';

export const usePeriodActions = () => {
  const { account, currentPeriod, updatePeriod, startPeriod, refetchSpending, resetMutationState } =
    useSpendingAccount();

  const { open: openPeriodModal } = usePeriodModal();

  const { push } = useIonRouter();

  const editCurrentPeriodHandler = () => {
    if (currentPeriod) {
      openPeriodModal(
        {
          ...currentPeriod,
        },
        async (data) => {
          await updatePeriod({
            accountId: account?.id || '',
            periodId: currentPeriod.id || '',
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
    push(ROUTES.SPENDING_PERIODS);
  };

  return {
    editCurrentPeriodHandler,
    startNewPeriodHandler,
    openSpendingPeriodsPage,
  };
};
