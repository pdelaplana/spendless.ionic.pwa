import { useSpendingAccount } from '@/providers/spendingAccount';
import { useSpendModal } from '../modals/SpendModal';
import type { ISpend } from '@/domain/Spend';
import { createSpend as createNewSpend } from '@/domain/Spend';

export const useSpendActions = () => {
  const { open: openSpendModal } = useSpendModal();
  const { account, currentPeriod, createSpend, updateSpend, refetchSpending, resetMutationState } =
    useSpendingAccount();

  const saveSpendHandler = async (spend: ISpend) => {
    if (spend.id) {
      await updateSpend({ accountId: account?.id || '', spendId: spend.id, data: spend });
    } else {
      await createSpend(spend);
    }
    resetMutationState();
    refetchSpending();
  };

  const editSpendHandler = (spend: ISpend) => {
    openSpendModal(spend, saveSpendHandler);
  };

  const newSpendHandler = () => {
    openSpendModal(
      createNewSpend({
        accountId: account?.id || '',
        periodId: currentPeriod?.id || '',
        date: new Date(),
        category: 'need',
        amount: 0,
        description: '',
      }),
      saveSpendHandler,
    );
  };

  return {
    newSpendHandler,
    editSpendHandler,
  };
};
