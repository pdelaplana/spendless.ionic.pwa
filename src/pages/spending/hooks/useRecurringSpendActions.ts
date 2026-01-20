import type { IRecurringSpend } from '@/domain/RecurringSpend';
import { createRecurringSpend as createNewRecurringSpend } from '@/domain/RecurringSpend';
import {
  useCreateRecurringSpend,
  useDeleteRecurringSpend,
  useFetchRecurringSpends,
  useUpdateRecurringSpend,
} from '@/hooks/api/recurringSpend';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import { useRecurringSpendModal } from '../modals/recurringSpendModal';

export const useRecurringSpendActions = () => {
  const { account, usedSpendingTags } = useSpendingAccount();
  const { wallets, selectedWallet } = useWallet();
  const { open: openRecurringSpendModal } = useRecurringSpendModal(wallets);

  const { data: recurringSpends = [], refetch: refetchRecurringSpends } = useFetchRecurringSpends(
    account?.id,
  );
  const createRecurringSpend = useCreateRecurringSpend();
  const updateRecurringSpend = useUpdateRecurringSpend();
  const deleteRecurringSpend = useDeleteRecurringSpend();

  const saveRecurringSpendHandler = async (recurringSpend: IRecurringSpend) => {
    console.log('saveRecurringSpendHandler called with:', recurringSpend);

    if (recurringSpend.id) {
      console.log('Updating existing recurring spend');
      await updateRecurringSpend.mutateAsync({
        accountId: account?.id || '',
        recurringSpendId: recurringSpend.id,
        data: recurringSpend,
      });
    } else {
      console.log('Creating new recurring spend');
      await createRecurringSpend.mutateAsync({
        ...recurringSpend,
        accountId: account?.id || '',
      });
    }
    refetchRecurringSpends();
  };

  const deleteRecurringSpendHandler = async (recurringSpendId: string) => {
    try {
      if (recurringSpendId && account?.id) {
        await deleteRecurringSpend.mutateAsync({
          recurringSpendId,
          accountId: account.id,
        });
      }
    } catch (error) {
      console.error('Error deleting recurring spend:', error);
    } finally {
      refetchRecurringSpends();
    }
  };

  const editRecurringSpendHandler = (recurringSpend: IRecurringSpend) => {
    const suggestedTags = usedSpendingTags;
    openRecurringSpendModal(
      recurringSpend,
      saveRecurringSpendHandler,
      deleteRecurringSpendHandler,
      {
        suggestedTags,
        currency: account?.currency,
      },
    );
  };

  const newRecurringSpendHandler = () => {
    const suggestedTags = usedSpendingTags;
    openRecurringSpendModal(
      createNewRecurringSpend({
        accountId: account?.id || '',
        walletId: selectedWallet?.id || '',
        description: '',
        amount: 0,
        category: 'need',
        scheduleFrequency: 'monthly',
        dayOfMonth: 1,
        isActive: true,
      }),
      saveRecurringSpendHandler,
      deleteRecurringSpendHandler,
      {
        suggestedTags,
        currency: account?.currency,
        initialBreakpoint: 0.99,
        breakpoints: [0, 0.5, 0.99],
      },
    );
  };

  return {
    recurringSpends,
    newRecurringSpendHandler,
    editRecurringSpendHandler,
    deleteRecurringSpendHandler,
    refetchRecurringSpends,
    isLoading: createRecurringSpend.isPending || updateRecurringSpend.isPending,
  };
};
