import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import MainMenuContent from './MainMenuContent';
import { useSpendingAccount } from '@/providers/spendingAccount';

vi.mock('@/providers/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { displayName: 'Test User', email: 'test@example.com' },
    updatePhotoUrl: vi.fn(),
    signout: vi.fn(),
  })),
}));

vi.mock('@/hooks', () => ({
  usePrompt: vi.fn(() => ({
    showConfirmPrompt: vi.fn(),
  })),
}));

vi.mock('@/components/shared', async () => {
  const actual = await vi.importActual<typeof import('@/components/shared')>(
    '@/components/shared',
  );
  return {
    ...actual,
    ProfilePhoto: () => null,
    PwaInstallPrompt: () => null,
  };
});

vi.mock('@/providers/spendingAccount', () => ({
  useSpendingAccount: vi.fn(() => ({
    account: { subscriptionTier: 'premium' },
  })),
}));

vi.mock('@/hooks/subscription', () => ({
  useSubscription: vi.fn((account) => {
    const isPremium = account?.subscriptionTier === 'premium';
    return {
      tier: isPremium ? 'premium' : 'essentials',
      isEssentials: !isPremium,
      isPremium,
      isExpired: false,
      expiresAt: null,
      daysUntilExpiry: null,
      isExpiringSoon: false,
      isCancelled: false,
    };
  }),
}));

describe('MainMenuContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a Notifications section heading', () => {
    render(<MainMenuContent />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders the Inbox navigation item', () => {
    render(<MainMenuContent />);
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('renders Inbox above Recurring Spending', () => {
    render(<MainMenuContent />);

    const inbox = screen.getByText('Inbox');
    const recurring = screen.getByText('Recurring Spending');

    // DOCUMENT_POSITION_FOLLOWING means recurring comes after inbox in the DOM
    const position = inbox.compareDocumentPosition(recurring);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the Recurring Spending navigation item', () => {
    render(<MainMenuContent />);
    expect(screen.getByText('Recurring Spending')).toBeInTheDocument();
  });

  it('hides the Inbox item and Notifications heading for non-premium users', () => {
    vi.mocked(useSpendingAccount).mockReturnValueOnce({
      account: { subscriptionTier: 'essentials' },
    } as any);

    render(<MainMenuContent />);

    expect(screen.queryByText('Inbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('shows the Inbox item and Notifications heading for premium users', () => {
    render(<MainMenuContent />);

    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});
