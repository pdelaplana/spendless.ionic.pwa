import type { IAccount } from '@/domain/Account';
import type { CreatePeriodDTO, IPeriod } from '@/domain/Period';
import type { CreateSpendDTO, ISpend } from '@/domain/Spend';

export interface SpendingAccountContextType {
  account?: IAccount | undefined;
  currentPeriod: IPeriod | undefined;
  periods: IPeriod[];
  spending: ISpend[];
  startAt?: Date;
  endAt?: Date;

  setDateRange: (startAt?: Date, endAt?: Date) => void;

  refetchSpending: () => void;

  updateAccount: ({ id, data }: { id: string; data: Partial<IAccount> }) => Promise<IAccount>;
  deleteAccount: (id: string) => Promise<IAccount>;

  createPeriod: ({
    accountId,
    data,
  }: { accountId: string; data: CreatePeriodDTO }) => Promise<IPeriod>;
  updatePeriod: ({
    accountId,
    periodId,
    data,
  }: { accountId: string; periodId: string; data: Partial<IPeriod> }) => Promise<IPeriod>;
  closePeriod: ({
    accountId,
    periodId,
  }: { accountId: string; periodId: string }) => Promise<IPeriod>;

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

  isMutationPending: boolean;
  didMutationSucceed: boolean;
  didMutationFail: boolean;
  mutationError: unknown;
  mutationErrorMessage: string;

  resetMutationState: () => void;
  resetFetchState: () => void;
}
