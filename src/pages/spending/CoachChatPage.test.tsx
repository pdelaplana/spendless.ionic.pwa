import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// ─── Mock hooks ─────────────────────────────────────────────────────────────

vi.mock('@/hooks/api/coachSessions', () => ({
  useCoachSessionMessages: vi.fn(),
  useSendCoachMessage: vi.fn(),
  useCoachTrialStatus: vi.fn(),
}));
vi.mock('@/hooks/api/coachSessions/coachSessionUtils', () => ({
  buildSystemPrompt: vi.fn().mockReturnValue('mocked system prompt'),
}));
vi.mock('@/hooks/subscription', () => ({
  useSubscription: vi.fn(),
}));
vi.mock('@/providers/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/providers/spendingAccount/useSpendingAccount', () => ({
  useSpendingAccount: vi.fn(),
}));
vi.mock('react-router-dom', () => ({
  useParams: vi.fn().mockReturnValue({ sessionId: 'sess-1' }),
  useLocation: vi.fn().mockReturnValue({
    state: { session: { id: 'sess-1', title: 'Test Session' } },
  }),
}));

// ─── Mock UI / Layout ────────────────────────────────────────────────────────

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
}));
vi.mock('@/components/shared', () => ({
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
      routerLink,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      routerLink?: string;
    }) => (
      <button type='button' onClick={onClick} disabled={disabled} data-router-link={routerLink}>
        {children}
      </button>
    ),
    IonIcon: () => <span />,
    IonTextarea: ({
      value,
      placeholder,
    }: {
      value: string;
      placeholder: string;
    }) => <textarea data-testid='message-input' value={value} placeholder={placeholder} readOnly />,
    IonSpinner: () => <span data-testid='spinner' />,
  };
});
vi.mock('./components/coach/SpendingContextBanner', () => ({
  SpendingContextBanner: ({
    includeContext,
    onToggle,
  }: {
    includeContext: boolean;
    onToggle: (v: boolean) => void;
  }) => (
    <button
      type='button'
      data-testid='context-banner'
      data-context={includeContext}
      onClick={() => onToggle(!includeContext)}
    />
  ),
}));

// ─── Import subject ──────────────────────────────────────────────────────────

import {
  useCoachSessionMessages,
  useCoachTrialStatus,
  useSendCoachMessage,
} from '@/hooks/api/coachSessions';
import { useSubscription } from '@/hooks/subscription';
import { useAuth } from '@/providers/auth/useAuth';
import { useSpendingAccount } from '@/providers/spendingAccount/useSpendingAccount';
import CoachChatPage from './CoachChatPage';

const mockUseCoachSessionMessages = useCoachSessionMessages as Mock;
const mockUseSendCoachMessage = useSendCoachMessage as Mock;
const mockUseCoachTrialStatus = useCoachTrialStatus as Mock;
const mockUseSubscription = useSubscription as Mock;
const mockUseAuth = useAuth as Mock;
const mockUseSpendingAccount = useSpendingAccount as Mock;

const defaultSetup = () => {
  mockUseSpendingAccount.mockReturnValue({
    account: { id: 'acc-1', currency: 'USD' },
    spending: [],
  });
  mockUseAuth.mockReturnValue({ user: { uid: 'user-1' } });
  mockUseSubscription.mockReturnValue({ isPremium: true });
  mockUseSendCoachMessage.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUseCoachTrialStatus.mockReturnValue({
    messagesRemaining: 5,
    hasTrialExpired: false,
    decrementMessages: vi.fn(),
  });
};

describe('CoachChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the session title in the header', () => {
    defaultSetup();
    mockUseCoachSessionMessages.mockReturnValue({ messages: [], isLoading: false });

    render(<CoachChatPage />);

    expect(screen.getByText('Test Session')).toBeInTheDocument();
  });

  it('renders the SpendingContextBanner', () => {
    defaultSetup();
    mockUseCoachSessionMessages.mockReturnValue({ messages: [], isLoading: false });

    render(<CoachChatPage />);

    expect(screen.getByTestId('context-banner')).toBeInTheDocument();
  });

  it('renders messages when loaded', () => {
    defaultSetup();
    mockUseCoachSessionMessages.mockReturnValue({
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: 'Hello coach!',
          status: 'sent',
          createdAt: new Date(),
        },
        {
          id: 'm2',
          role: 'model',
          content: 'How can I help you today?',
          status: 'sent',
          createdAt: new Date(),
        },
      ],
      isLoading: false,
    });

    render(<CoachChatPage />);

    expect(screen.getByText('Hello coach!')).toBeInTheDocument();
    expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
  });

  it('renders AI response content as markdown — bold text becomes strong element', () => {
    defaultSetup();
    mockUseCoachSessionMessages.mockReturnValue({
      messages: [
        {
          id: 'm1',
          role: 'model',
          content: '**Save more money**',
          status: 'sent',
          createdAt: new Date(),
        },
      ],
      isLoading: false,
    });

    render(<CoachChatPage />);

    const strongEl = document.querySelector('strong');
    expect(strongEl).not.toBeNull();
    expect(strongEl).toHaveTextContent('Save more money');
  });

  it('renders AI response list items as li elements', () => {
    defaultSetup();
    mockUseCoachSessionMessages.mockReturnValue({
      messages: [
        {
          id: 'm1',
          role: 'model',
          content: '- Cut dining out\n- Cancel subscriptions',
          status: 'sent',
          createdAt: new Date(),
        },
      ],
      isLoading: false,
    });

    render(<CoachChatPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Cut dining out');
    expect(items[1]).toHaveTextContent('Cancel subscriptions');
  });

  it('renders message input for premium users', () => {
    defaultSetup();
    mockUseCoachSessionMessages.mockReturnValue({ messages: [], isLoading: false });

    render(<CoachChatPage />);

    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('shows upgrade prompt when trial has expired for non-premium user', () => {
    defaultSetup();
    mockUseSubscription.mockReturnValue({ isPremium: false });
    mockUseCoachTrialStatus.mockReturnValue({
      messagesRemaining: 0,
      hasTrialExpired: true,
      decrementMessages: vi.fn(),
    });
    mockUseCoachSessionMessages.mockReturnValue({ messages: [], isLoading: false });

    render(<CoachChatPage />);

    expect(screen.getByText('coach.trial.trialEndedDescription')).toBeInTheDocument();
    expect(screen.getByText('coach.trial.upgradeNow')).toBeInTheDocument();
  });

  it('hides message input when trial has expired for non-premium user', () => {
    defaultSetup();
    mockUseSubscription.mockReturnValue({ isPremium: false });
    mockUseCoachTrialStatus.mockReturnValue({
      messagesRemaining: 0,
      hasTrialExpired: true,
      decrementMessages: vi.fn(),
    });
    mockUseCoachSessionMessages.mockReturnValue({ messages: [], isLoading: false });

    render(<CoachChatPage />);

    expect(screen.queryByTestId('message-input')).not.toBeInTheDocument();
  });

  it('shows context is on by default', () => {
    defaultSetup();
    mockUseCoachSessionMessages.mockReturnValue({ messages: [], isLoading: false });

    render(<CoachChatPage />);

    const banner = screen.getByTestId('context-banner');
    expect(banner).toHaveAttribute('data-context', 'true');
  });

  it('shows trial warning when messages remaining is low for non-premium user', () => {
    defaultSetup();
    mockUseSubscription.mockReturnValue({ isPremium: false });
    mockUseCoachTrialStatus.mockReturnValue({
      messagesRemaining: 2,
      hasTrialExpired: false,
      decrementMessages: vi.fn(),
    });
    mockUseCoachSessionMessages.mockReturnValue({ messages: [], isLoading: false });

    render(<CoachChatPage />);

    expect(screen.getByText('coach.trial.messagesRemainingPlural:2')).toBeInTheDocument();
  });
});
