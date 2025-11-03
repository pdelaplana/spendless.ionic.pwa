import type { IAccount } from '@/domain/Account';
import type { CreatePeriodDTO, IPeriod } from '@/domain/Period';
import type { CreateSpendDTO, ISpend } from '@/domain/Spend';

export interface SpendingAccountContextType {
  account?: IAccount | undefined;

  selectedPeriod: IPeriod | undefined;
  periods: (IPeriod & { actualSpend: number })[];
  spending: ISpend[];
  chartSpending: ISpend[];
  startAt?: Date;
  endAt?: Date;
  isDataRestricted: boolean;

  setDateRange: (startAt?: Date, endAt?: Date) => void;
  setSelectedPeriod: (period: IPeriod | undefined) => void;

  refetchSpending: () => void;

  updateAccount: ({ id, data }: { id: string; data: Partial<IAccount> }) => Promise<IAccount>;
  deleteAccount: (id: string) => Promise<IAccount>;

  createPeriod: ({ data }: { data: CreatePeriodDTO }) => Promise<IPeriod>;
  updatePeriod: ({
    periodId,
    data,
  }: { periodId: string; data: Partial<IPeriod> }) => Promise<IPeriod>;
  closePeriod: ({
    accountId,
    periodId,
  }: { accountId: string; periodId: string }) => Promise<IPeriod>;
  deleteClosedPeriod: ({ periodId }: { periodId: string }) => Promise<void>;

  startPeriod: (data: Partial<IPeriod>) => Promise<IPeriod>;

  createSpend: (createSpendDTO: CreateSpendDTO) => Promise<ISpend>;
  updateSpend: ({
    accountId,
    spendId,
    data,
  }: { accountId: string; spendId: string; data: Partial<ISpend> }) => Promise<ISpend>;
  deleteSpend: ({
    accountId,
    spendId,
  }: { accountId: string; spendId: string }) => Promise<{ accountId: string; spendId: string }>;

  isFetching: boolean;
  isError: boolean;
  fetchError: unknown;

  isFetchingChartData: boolean;
  isChartDataError: boolean;
  chartDataError: unknown;

  isMutationPending: boolean;
  didMutationSucceed: boolean;
  didMutationFail: boolean;
  mutationError: unknown;
  mutationErrorMessage: string;

  usedSpendingTags: string[];

  resetMutationState: () => void;
  resetFetchState: () => void;
}
