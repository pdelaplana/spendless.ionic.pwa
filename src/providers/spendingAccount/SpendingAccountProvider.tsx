import type { ReactNode } from 'react';
import { SpendingAccountContext } from './context';
import {
  useFetchAccountByUserId,
  useUpdateAccount,
  useDeleteAccount,
  useCreateSpend,
  useUpdateSpend,
  useDeleteSpend,
  useFetchSpendingByAccountId,
} from '@/hooks';
import { useEffect, useState } from 'react';
import {
  useClosePeriod,
  useCopyRecurringSpend,
  useCreatePeriod,
  useDeletePeriod,
  useDeleteSpendingByPeriod,
  useFetchCurrentPeriod,
  useFetchPeriods,
  useUpdatePeriod,
} from '@/hooks/api';
import type { IPeriod } from '@/domain/Period';

export const SpendingAccountProvider: React.FC<{ userId: string; children: ReactNode }> = ({
  userId,
  children,
}) => {
  const {
    data: spendingAccount,
    isLoading: isFetchingAccount,
    isError: isFetchingAccountError,
    isSuccess: isFetchingAccountSuccess,
    error: fetchAccountError,
  } = useFetchAccountByUserId(userId);
  const {
    mutateAsync: updateAccount,
    isPending: isUpdatingAccount,
    isSuccess: isUpdatingAccountSuccess,
    isError: isUpdatingAccountFailed,
    error: updateAccountError,
    reset: resetUpdateAccount,
  } = useUpdateAccount();
  const {
    mutateAsync: deleteAccount,
    isPending: isDeletingAccount,
    isSuccess: isDeletingAccountSuccess,
    isError: isDeletingAccountFailed,
    error: deleteAccountError,
    reset: resetDeleteAccount,
  } = useDeleteAccount();

  const { data: currentPeriod } = useFetchCurrentPeriod(spendingAccount?.id);
  const { data: periods } = useFetchPeriods(spendingAccount?.id);
  const {
    mutateAsync: createPeriod,
    isPending: isCreatingPeriod,
    isSuccess: isCreatingPeriodSuccess,
    isError: isCreatingPeriodFailed,
    error: createPeriodError,
    reset: resetCreatePeriod,
  } = useCreatePeriod();
  const {
    mutateAsync: updatePeriod,
    isPending: isUpdatingPeriod,
    isSuccess: isUpdatingPeriodSuccess,
    isError: isUpdatingPeriodFailed,
    error: updatePeriodError,
    reset: resetUpdatePeriod,
  } = useUpdatePeriod();
  const {
    mutateAsync: deletePeriod,
    isPending: isDeletingPeriod,
    isSuccess: isDeletingPeriodSuccess,
    isError: isDeletingPeriodFailed,
    error: deletePeriodError,
    reset: resetDeletePeriod,
  } = useDeletePeriod();
  const {
    mutateAsync: closePeriod,
    isPending: isClosingPeriod,
    isSuccess: isClosingPeriodSuccess,
    isError: isClosingPeriodFailed,
    error: closePeriodError,
    reset: resetClosePeriod,
  } = useClosePeriod();

  const {
    mutateAsync: createSpend,
    isPending: isCreatingSpend,
    isSuccess: isCreatingSpendSuccess,
    isError: isCreatingSpendFailed,
    error: createSpendError,
    reset: resetCreateSpend,
  } = useCreateSpend();
  const {
    mutateAsync: updateSpend,
    isPending: isUpdatingSpend,
    isSuccess: isUpdatingSpendSuccess,
    isError: isUpdatingSpendFailed,
    error: updateSpendError,
    reset: resetUpdateSpend,
  } = useUpdateSpend();
  const {
    mutateAsync: deleteSpend,
    isPending: isDeletingSpend,
    isSuccess: isDeletingSpendSuccess,
    isError: isDeletingSpendFailed,
    error: deleteSpendError,
    reset: resetDeleteSpend,
  } = useDeleteSpend();
  const {
    mutateAsync: deleteSpendingForPeriod,
    isPending: isDeletingSpendingForPeriod,
    isSuccess: isDeletingSpendingForPeriodSuccess,
    isError: isDeletingSpendingForPeriodFailed,
    error: deleteSpendingForPeriodError,
    reset: resetDeleteSpendingForPeriod,
  } = useDeleteSpendingByPeriod();

  // Use state to track the current date range
  const [dateRange, setDateRange] = useState<{ startAt?: Date; endAt?: Date }>({
    startAt: undefined,
    endAt: undefined,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<IPeriod | undefined>(undefined);

  const {
    data: spending,
    hasPreviousPage: hasPreviousSpending,
    fetchNextPage: fetchNextPageSpending,
    hasNextPage: hasNextPageSpending,
    isFetching: isFetchingSpending,
    isError: isFetchingSpendingError,
    isSuccess: isFetchingSpendingSuccess,
    error: fetchSpendingError,
    refetch: refetchSpending,
  } = useFetchSpendingByAccountId(
    spendingAccount?.id,
    selectedPeriod?.id ?? currentPeriod?.id,
    dateRange.startAt,
    dateRange.endAt,
  );

  const resetMutationState = () => {
    resetUpdateAccount();
    resetDeleteAccount();
    resetCreateSpend();
    resetUpdateSpend();
    resetDeleteSpend();
  };

  const resetFetchState = () => {};

  const { mutateAsync: copyRecurringSpend } = useCopyRecurringSpend();

  const startPeriod = async (data: Partial<IPeriod>) => {
    try {
      if (currentPeriod) {
        await closePeriod({
          accountId: spendingAccount?.id || '',
          periodId: currentPeriod?.id || '',
        });
      }

      const newPeriod = await createPeriod({
        accountId: spendingAccount?.id || '',
        data: {
          name: '',
          goals: data.goals || '',
          targetSpend: data.targetSpend || 0,
          targetSavings: data.targetSavings || 0,
          startAt: data.startAt || new Date(),
          endAt: data.endAt || new Date(),
          reflection: '',
        },
      });

      await copyRecurringSpend({
        fromPeriodId: currentPeriod?.id || '',
        toPeriodId: newPeriod.id,
        accountId: spendingAccount?.id || '',
      });

      return newPeriod;
    } catch (error) {
      console.error('Error starting new period:', error);
      throw error;
    }
  };

  const deleteClosedPeriod = async (periodId: string) => {
    if (periodId !== currentPeriod?.id) {
      await deleteSpendingForPeriod({
        accountId: spendingAccount?.id || '',
        periodId,
      });
      await deletePeriod({
        accountId: spendingAccount?.id || '',
        periodId,
      });
    }
  };

  useEffect(() => {
    if (selectedPeriod === undefined) {
      setSelectedPeriod(currentPeriod ?? undefined);
    }
  }, [currentPeriod, selectedPeriod]);

  useEffect(() => {
    if (selectedPeriod) {
      refetchSpending();
    }
  }, [selectedPeriod, refetchSpending]);

  useEffect(() => {
    if (updateAccountError) {
      console.error('Error updating account:', updateAccountError);
    }
  }, [updateAccountError]);

  return (
    <SpendingAccountContext.Provider
      value={{
        account: spendingAccount ?? undefined,
        periods: periods ?? [],

        spending: spending?.pages?.flatMap((page) => page.spending) ?? [],
        startAt: dateRange.startAt,
        endAt: dateRange.endAt,
        setDateRange: (startAt?: Date, endAt?: Date) => setDateRange({ startAt, endAt }),

        selectedPeriod: selectedPeriod,
        setSelectedPeriod: setSelectedPeriod,

        hasNextPageSpending,
        fetchNextPageSpending,

        updateAccount,
        deleteAccount,

        createPeriod: async ({ data }) =>
          createPeriod({ accountId: spendingAccount?.id ?? '', data }),
        updatePeriod: async ({ periodId, data }) =>
          updatePeriod({ accountId: spendingAccount?.id ?? '', periodId, data }),

        closePeriod: async ({ periodId }) =>
          closePeriod({ accountId: spendingAccount?.id ?? '', periodId }),
        deleteClosedPeriod: async ({ periodId }) => deleteClosedPeriod(periodId),

        startPeriod: async (data) => startPeriod(data),

        createSpend,
        updateSpend,
        deleteSpend,

        refetchSpending,

        resetFetchState,
        resetMutationState,

        isFetching: isFetchingAccount || isFetchingSpending,
        isError: isFetchingAccountError || isFetchingSpendingError,
        fetchError: fetchAccountError || fetchSpendingError,
        isMutationPending:
          isUpdatingAccount ||
          isDeletingAccount ||
          isCreatingSpend ||
          isUpdatingSpend ||
          isDeletingSpend,
        didMutationSucceed:
          isUpdatingAccountSuccess ||
          isDeletingAccountSuccess ||
          isCreatingSpendSuccess ||
          isUpdatingSpendSuccess ||
          isDeletingSpendSuccess,
        didMutationFail:
          isUpdatingAccountFailed ||
          isDeletingAccountFailed ||
          isCreatingSpendFailed ||
          isUpdatingSpendFailed ||
          isDeletingSpendFailed,
        mutationError:
          updateAccountError ||
          deleteAccountError ||
          createSpendError ||
          updateSpendError ||
          deleteSpendError,
        mutationErrorMessage:
          (deleteAccountError as Error)?.message ||
          (createSpendError as Error)?.message ||
          (updateSpendError as Error)?.message ||
          (deleteSpendError as Error)?.message ||
          'An error occurred while processing your request.',
      }}
    >
      {children}
    </SpendingAccountContext.Provider>
  );
};
