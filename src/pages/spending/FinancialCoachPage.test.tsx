import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

// ─── Mock hooks ─────────────────────────────────────────────────────────────

vi.mock('@/hooks/api/coachSessions', () => ({
  useFetchCoachSessions: vi.fn(),
  useCreateCoachSession: vi.fn(),
  useArchiveCoachSession: vi.fn(),
  useCoachTrialStatus: vi.fn(),
}));
vi.mock('@/hooks/subscription', () => ({
  useSubscription: vi.fn(),
}));
vi.mock('@/hooks/ui/useFormatters', () => ({
  default: vi.fn(),
}));
vi.mock('@/providers/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/providers/spendingAccount/useSpendingAccount', () => ({
  useSpendingAccount: vi.fn(),
}));
vi.mock('react-router-dom', () => ({
  useHistory: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

// ─── Mock UI / Layout ─────────────────────────────────────────────────────

vi.mock('@/components/layouts', () => ({
  BasePageLayout: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid='base-layout'>
      <h1>{title}</h1>
      {children}
    </div>
  ),
  CenterContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='center-container'>{children}</div>
  ),
}));
vi.mock('@/components/menu/MainMenuContent', () => ({
  default: () => <div data-testid='main-menu' />,
}));
vi.mock('@/components/shared', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid='empty-state'>{title}</div>,
  LoadingState: ({ message }: { message: string }) => (
    <div data-testid='loading-state'>{message}</div>
  ),
  SentryErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='error-boundary'>{children}</div>
  ),
}));
vi.mock('@/theme/components', () => ({
  GradientBackground: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='gradient-bg'>{children}</div>
  ),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
  }),
}));
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    IonButton: ({
      children,
      onClick,
      disabled,
    }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    IonIcon: () => <span />,
    IonAlert: () => null,
    IonList: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
    IonItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    IonItemSliding: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    IonItemOptions: () => null,
    IonItemOption: () => null,
    IonLabel: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  };
});

// ─── Import subject ──────────────────────────────────────────────────────────

import {
  useArchiveCoachSession,
  useCoachTrialStatus,
  useCreateCoachSession,
  useFetchCoachSessions,
} from '@/hooks/api/coachSessions';
import { useSubscription } from '@/hooks/subscription';
import useFormatters from '@/hooks/ui/useFormatters';
import { useAuth } from '@/providers/auth/useAuth';
import { useSpendingAccount } from '@/providers/spendingAccount/useSpendingAccount';
import FinancialCoachPage from './FinancialCoachPage';

const mockUseFetchCoachSessions = useFetchCoachSessions as Mock;
const mockUseCreateCoachSession = useCreateCoachSession as Mock;
const mockUseArchiveCoachSession = useArchiveCoachSession as Mock;
const mockUseCoachTrialStatus = useCoachTrialStatus as Mock;
const mockUseSubscription = useSubscription as Mock;
const mockUseFormatters = useFormatters as Mock;
const mockUseAuth = useAuth as Mock;
const mockUseSpendingAccount = useSpendingAccount as Mock;

const defaultSetup = () => {
  mockUseSpendingAccount.mockReturnValue({
    account: { id: 'acc-1', currency: 'USD' },
  });
  mockUseAuth.mockReturnValue({ user: { uid: 'user-1' } });
  mockUseSubscription.mockReturnValue({ isPremium: false });
  mockUseFormatters.mockReturnValue({ formatDate: () => '01/01/2026' });
  mockUseCreateCoachSession.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUseArchiveCoachSession.mockReturnValue({ mutate: vi.fn() });
  mockUseCoachTrialStatus.mockReturnValue({ messagesRemaining: 3 });
};

describe('FinancialCoachPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state while fetching sessions', () => {
    defaultSetup();
    mockUseFetchCoachSessions.mockReturnValue({ data: [], isLoading: true });

    render(<FinancialCoachPage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders empty state when there are no sessions', () => {
    defaultSetup();
    mockUseFetchCoachSessions.mockReturnValue({ data: [], isLoading: false });

    render(<FinancialCoachPage />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('coach.noSessions')).toBeInTheDocument();
  });

  it('renders session list when sessions exist', () => {
    defaultSetup();
    mockUseFetchCoachSessions.mockReturnValue({
      data: [
        {
          id: 's1',
          title: 'My First Session',
          messageCount: 4,
          updatedAt: new Date('2026-01-01'),
        },
      ],
      isLoading: false,
    });

    render(<FinancialCoachPage />);

    expect(screen.getByText('My First Session')).toBeInTheDocument();
  });

  it('shows trial banner for non-premium users', () => {
    defaultSetup();
    mockUseFetchCoachSessions.mockReturnValue({ data: [], isLoading: false });
    mockUseSubscription.mockReturnValue({ isPremium: false });
    mockUseCoachTrialStatus.mockReturnValue({ messagesRemaining: 3 });

    render(<FinancialCoachPage />);

    // Trial banner should be visible (contains trial key text)
    expect(screen.getByText('coach.trial.messagesRemainingPlural:3')).toBeInTheDocument();
  });

  it('hides trial banner for premium users', () => {
    defaultSetup();
    mockUseFetchCoachSessions.mockReturnValue({ data: [], isLoading: false });
    mockUseSubscription.mockReturnValue({ isPremium: true });

    render(<FinancialCoachPage />);

    expect(screen.queryByText(/coach\.trial\.messages/)).not.toBeInTheDocument();
  });

  it('shows singular trial message key when 1 message remaining', () => {
    defaultSetup();
    mockUseFetchCoachSessions.mockReturnValue({ data: [], isLoading: false });
    mockUseCoachTrialStatus.mockReturnValue({ messagesRemaining: 1 });

    render(<FinancialCoachPage />);

    expect(screen.getByText('coach.trial.messagesRemaining:1')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    defaultSetup();
    mockUseFetchCoachSessions.mockReturnValue({ data: [], isLoading: false });

    render(<FinancialCoachPage />);

    expect(screen.getByText('coach.title')).toBeInTheDocument();
  });
});
