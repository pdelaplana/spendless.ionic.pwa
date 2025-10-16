import type { CreatePeriodDTO, IPeriod } from '@/domain/Period';
import {
  useCreateSpend,
  useDeleteAccount,
  useDeleteSpend,
  useFetchAccountByUserId,
  useFetchSpendingByAccountId,
  useFetchSpendingForCharts,
  useUpdateAccount,
  useUpdateSpend,
} from '@/hooks';
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
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SpendingAccountContext } from './context';

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

  // Initialize selectedPeriod with currentPeriod to prevent flickering
  const [selectedPeriod, setSelectedPeriod] = useState<IPeriod | undefined>(
    currentPeriod ?? undefined,
  );

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

  // Separate hook for chart data - no pagination, gets all data for accurate charts
  const {
    data: chartSpending = [],
    isFetching: isFetchingChartData,
    isError: isChartDataError,
    error: chartDataError,
  } = useFetchSpendingForCharts(
    spendingAccount?.id,
    selectedPeriod?.id ?? currentPeriod?.id,
    dateRange.startAt,
    dateRange.endAt,
  );

  const resetMutationState = useCallback(() => {
    resetUpdateAccount();
    resetDeleteAccount();
    resetCreateSpend();
    resetUpdateSpend();
    resetDeleteSpend();
  }, [
    resetUpdateAccount,
    resetDeleteAccount,
    resetCreateSpend,
    resetUpdateSpend,
    resetDeleteSpend,
  ]);

  const resetFetchState = useCallback(() => {}, []);

  const { mutateAsync: copyRecurringSpend } = useCopyRecurringSpend();

  const startPeriod = useCallback(
    async (data: Partial<IPeriod>) => {
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
            name: data.name || '',
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
    },
    [currentPeriod, closePeriod, spendingAccount?.id, createPeriod, copyRecurringSpend],
  );

  const deleteClosedPeriod = useCallback(
    async (periodId: string) => {
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
    },
    [currentPeriod?.id, deleteSpendingForPeriod, spendingAccount?.id, deletePeriod],
  );

  // Memoize flattened spending array
  const flattenedSpending = useMemo(() => {
    return spending?.pages?.flatMap((page) => page.spending) ?? [];
  }, [spending?.pages]);

  const getUsedSpendingTags = useMemo(() => {
    const allTags = flattenedSpending.flatMap((spend) => spend.tags || []);
    return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
  }, [flattenedSpending]);

  // Only update selectedPeriod when currentPeriod changes and selectedPeriod is undefined
  useEffect(() => {
    if (selectedPeriod === undefined && currentPeriod !== undefined && currentPeriod !== null) {
      setSelectedPeriod(currentPeriod);
    }
  }, [currentPeriod, selectedPeriod]);

  useEffect(() => {
    if (updateAccountError) {
      console.error('Error updating account:', updateAccountError);
    }
  }, [updateAccountError]);

  // Memoize setDateRange callback
  const setDateRangeMemo = useCallback((startAt?: Date, endAt?: Date) => {
    setDateRange({ startAt, endAt });
  }, []);

  // Memoize complex async functions
  const createPeriodMemo = useCallback(
    async ({ data }: { data: Partial<IPeriod> }) => {
      // Ensure required fields are present for CreatePeriodDTO
      const createPeriodData: CreatePeriodDTO = {
        name: data.name ?? '',
        goals: data.goals ?? '',
        targetSpend: data.targetSpend ?? 0,
        targetSavings: data.targetSavings ?? 0,
        startAt: data.startAt ?? new Date(),
        endAt: data.endAt ?? new Date(),
        reflection: data.reflection ?? '',
        walletSetup: data.walletSetup,
      };
      return createPeriod({ accountId: spendingAccount?.id ?? '', data: createPeriodData });
    },
    [createPeriod, spendingAccount?.id],
  );

  const updatePeriodMemo = useCallback(
    async ({ periodId, data }: { periodId: string; data: Partial<IPeriod> }) => {
      return updatePeriod({ accountId: spendingAccount?.id ?? '', periodId, data });
    },
    [updatePeriod, spendingAccount?.id],
  );

  const closePeriodMemo = useCallback(
    async ({ periodId }: { periodId: string }) => {
      return closePeriod({ accountId: spendingAccount?.id ?? '', periodId });
    },
    [closePeriod, spendingAccount?.id],
  );

  const deleteClosedPeriodMemo = useCallback(
    async ({ periodId }: { periodId: string }) => {
      return deleteClosedPeriod(periodId);
    },
    [deleteClosedPeriod],
  );

  const startPeriodMemo = useCallback(
    async (data: Partial<IPeriod>) => {
      return startPeriod(data);
    },
    [startPeriod],
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      account: spendingAccount ?? undefined,
      periods: periods ?? [],

      spending: flattenedSpending,
      chartSpending,
      startAt: dateRange.startAt,
      endAt: dateRange.endAt,
      setDateRange: setDateRangeMemo,

      selectedPeriod: selectedPeriod,
      setSelectedPeriod: setSelectedPeriod,

      hasNextPageSpending,
      fetchNextPageSpending,

      updateAccount,
      deleteAccount,

      createPeriod: createPeriodMemo,
      updatePeriod: updatePeriodMemo,

      closePeriod: closePeriodMemo,
      deleteClosedPeriod: deleteClosedPeriodMemo,

      startPeriod: startPeriodMemo,

      createSpend,
      updateSpend,
      deleteSpend,

      refetchSpending,

      resetFetchState,
      resetMutationState,

      isFetching: isFetchingAccount || isFetchingSpending,
      isError: isFetchingAccountError || isFetchingSpendingError,
      fetchError: fetchAccountError || fetchSpendingError,

      isFetchingChartData,
      isChartDataError,
      chartDataError,

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

      usedSpendingTags: getUsedSpendingTags,
    }),
    [
      spendingAccount,
      periods,
      flattenedSpending,
      chartSpending,
      dateRange.startAt,
      dateRange.endAt,
      setDateRangeMemo,
      selectedPeriod,
      hasNextPageSpending,
      fetchNextPageSpending,
      updateAccount,
      deleteAccount,
      createPeriodMemo,
      updatePeriodMemo,
      closePeriodMemo,
      deleteClosedPeriodMemo,
      startPeriodMemo,
      createSpend,
      updateSpend,
      deleteSpend,
      refetchSpending,
      resetFetchState,
      resetMutationState,
      isFetchingAccount,
      isFetchingSpending,
      isFetchingAccountError,
      isFetchingSpendingError,
      fetchAccountError,
      fetchSpendingError,
      isFetchingChartData,
      isChartDataError,
      chartDataError,
      isUpdatingAccount,
      isDeletingAccount,
      isCreatingSpend,
      isUpdatingSpend,
      isDeletingSpend,
      isUpdatingAccountSuccess,
      isDeletingAccountSuccess,
      isCreatingSpendSuccess,
      isUpdatingSpendSuccess,
      isDeletingSpendSuccess,
      isUpdatingAccountFailed,
      isDeletingAccountFailed,
      isCreatingSpendFailed,
      isUpdatingSpendFailed,
      isDeletingSpendFailed,
      updateAccountError,
      deleteAccountError,
      createSpendError,
      updateSpendError,
      deleteSpendError,
      getUsedSpendingTags,
    ],
  );

  return (
    <SpendingAccountContext.Provider value={contextValue}>
      {children}
    </SpendingAccountContext.Provider>
  );
};
