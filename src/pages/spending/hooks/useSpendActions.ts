import type { ISpend } from '@/domain/Spend';
import { createSpend as createNewSpend } from '@/domain/Spend';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { useSpendModal } from '../modals/spendModal';

export const useSpendActions = () => {
  const { open: openSpendModal } = useSpendModal();
  const { selectedWallet } = useWallet();
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
      // For existing spends, preserve walletId if it exists, otherwise use current wallet
      const spendWithWallet = {
        ...spend,
        walletId: spend.walletId || selectedWallet?.id || '',
      };
      await updateSpend({ accountId: account?.id || '', spendId: spend.id, data: spendWithWallet });
    } else {
      // Add walletId from current wallet context for new spending
      const spendWithWallet = {
        ...spend,
        walletId: selectedWallet?.id || '', // Use current selected wallet
      };
      await createSpend(spendWithWallet);
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
    openSpendModal(spend, saveSpendHandler, deleteSpendHandler, suggestedTags, account?.currency);
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
      account?.currency,
    );
  };

  return {
    newSpendHandler,
    editSpendHandler,
    deleteSpendHandler,
  };
};
