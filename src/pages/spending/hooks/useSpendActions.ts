import type { ISpend } from '@/domain/Spend';
import { createSpend as createNewSpend } from '@/domain/Spend';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useSpendModal } from '../modals/spendModal';

export const useSpendActions = () => {
  const { open: openSpendModal } = useSpendModal();
  const {
    account,
    selectedPeriod,
    createSpend,
    updateSpend,
    deleteSpend,
    refetchSpending,
    resetMutationState,
    usedSpendingTags,
  } = useSpendingAccount();

  const saveSpendHandler = async (spend: ISpend) => {
    if (spend.id) {
      await updateSpend({ accountId: account?.id || '', spendId: spend.id, data: spend });
    } else {
      await createSpend(spend);
    }
    resetMutationState();
    refetchSpending();
  };

  const deleteSpendHandler = async (spendId: string) => {
    try {
      if (spendId && account?.id) {
        await deleteSpend({ spendId: spendId, accountId: account?.id || '' });
      }
    } catch (error) {
      console.error('Error saving spend:', error);
      // Handle error notification here
    } finally {
      resetMutationState();
      refetchSpending();
    }
  };

  const editSpendHandler = (spend: ISpend) => {
    const suggestedTags = usedSpendingTags;
    openSpendModal(spend, saveSpendHandler, deleteSpendHandler, suggestedTags);
  };

  const newSpendHandler = () => {
    const suggestedTags = usedSpendingTags;
    openSpendModal(
      createNewSpend({
        accountId: account?.id || '',
        periodId: selectedPeriod?.id || '',
        date: new Date(),
        category: 'need',
        amount: 0,
        description: '',
      }),
      saveSpendHandler,
      deleteSpendHandler,
      suggestedTags,
    );
  };

  return {
    newSpendHandler,
    editSpendHandler,
    deleteSpendHandler,
  };
};
