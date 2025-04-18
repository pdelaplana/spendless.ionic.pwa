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
import { useState } from 'react';
import {
  useClosePeriod,
  useCreatePeriod,
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

  // Use state to track the current date range
  const [dateRange, setDateRange] = useState<{ startAt?: Date; endAt?: Date }>({
    startAt: undefined, // Default to current date
    endAt: undefined, // Default to current date
  });

  const {
    data: spending,
    isFetching: isFetchingSpending,
    isError: isFetchingSpendingError,
    isSuccess: isFetchingSpendingSuccess,
    error: fetchSpendingError,
    refetch: refetchSpending,
  } = useFetchSpendingByAccountId(
    spendingAccount?.id,
    currentPeriod?.id,
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

  const startPeriod = async (data: Partial<IPeriod>) => {
    if (currentPeriod) {
      await closePeriod({
        accountId: spendingAccount?.id || '',
        periodId: currentPeriod?.id || '',
      });
    }

    return await createPeriod({
      accountId: spendingAccount?.id || '',
      data: {
        name: 'New Period',
        goals: '',
        targetSpend: 0,
        targetSavings: 0,
        startAt: new Date(),
        endAt: new Date(),
        reflection: '',
      },
    });
  };

  return (
    <SpendingAccountContext.Provider
      value={{
        account: spendingAccount ?? undefined,
        currentPeriod: currentPeriod ?? undefined,
        periods: periods ?? [],
        spending: spending?.pages?.flatMap((page) => page.spending) ?? [],
        startAt: dateRange.startAt,
        endAt: dateRange.endAt,
        setDateRange: (startAt?: Date, endAt?: Date) => setDateRange({ startAt, endAt }),

        updateAccount,
        deleteAccount,

        createPeriod,
        updatePeriod,
        closePeriod,

        startPeriod,

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
