import type { IWallet } from '@/domain/Wallet';
import { useWallet } from '@/providers/wallet';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import WalletList from './WalletList';

// Mock the hooks
vi.mock('@/providers/wallet');
vi.mock('@/providers/spendingAccount', () => ({
  useSpendingAccount: () => ({
    account: {
      id: 'account-1',
      currency: 'USD',
    },
    selectedPeriod: {
      id: 'period-1',
    },
  }),
}));
vi.mock('@/hooks/ui/useFormatters', () => ({
  default: () => ({
    formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  }),
}));
vi.mock('../../../modals/walletModal', () => ({
  useWalletModal: () => ({
    open: vi.fn(),
  }),
}));
vi.mock('@/hooks/api/wallet', () => ({
  useCreateWallet: () => ({
    mutateAsync: vi.fn(),
  }),
  useUpdateWallet: () => ({
    mutateAsync: vi.fn(),
  }),
  useDeleteWallet: () => ({
    mutateAsync: vi.fn(),
  }),
}));
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    useIonToast: () => [vi.fn()],
  };
});

const mockUseWallet = useWallet as Mock;

const mockWallets: IWallet[] = [
  {
    id: 'wallet-1',
    accountId: 'account-1',
    periodId: 'period-1',
    name: 'Groceries',
    spendingLimit: 500,
    currentBalance: 150,
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'wallet-2',
    accountId: 'account-1',
    periodId: 'period-1',
    name: 'Entertainment',
    spendingLimit: 200,
    currentBalance: 75,
    isDefault: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

describe('WalletList', () => {
  const mockRefreshWallets = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseWallet.mockReturnValue({
      wallets: [],
      isLoading: true,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList />);

    const spinner = document.querySelector('ion-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders error state with retry button', async () => {
    const errorMessage = 'Failed to load wallets';
    mockUseWallet.mockReturnValue({
      wallets: [],
      isLoading: false,
      error: errorMessage,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry loading wallets/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    await waitFor(() => {
      expect(mockRefreshWallets).toHaveBeenCalledTimes(1);
    });
  });

  it('renders empty state when no wallets', () => {
    mockUseWallet.mockReturnValue({
      wallets: [],
      isLoading: false,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList />);

    expect(screen.getByText('No wallets found for this period')).toBeInTheDocument();
  });

  it('renders wallets list correctly', () => {
    mockUseWallet.mockReturnValue({
      wallets: mockWallets,
      isLoading: false,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList />);

    expect(screen.getByText('Wallets')).toBeInTheDocument();
    const ionList = document.querySelector('ion-list');
    expect(ionList).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('calls onWalletClick when wallet is clicked', async () => {
    const mockOnWalletClick = vi.fn();

    mockUseWallet.mockReturnValue({
      wallets: mockWallets,
      isLoading: false,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList onWalletClick={mockOnWalletClick} />);

    // Find the StyledItem that contains "Groceries"
    const groceriesWallet = screen.getByLabelText(/groceries.*spent.*remaining/i);
    fireEvent.click(groceriesWallet);

    await waitFor(() => {
      expect(mockOnWalletClick).toHaveBeenCalledWith('wallet-1');
    });
  });

  it('has proper accessibility with clickable wallet items', () => {
    const mockOnWalletClick = vi.fn();

    mockUseWallet.mockReturnValue({
      wallets: mockWallets,
      isLoading: false,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList onWalletClick={mockOnWalletClick} />);

    // Check that both wallet items have aria-labels for accessibility
    const ionItems = document.querySelectorAll('ion-item');
    expect(ionItems.length).toBe(2);

    if (ionItems) {
      for (const item of ionItems) {
        expect(item).toHaveAttribute('aria-label');
        expect(item).toHaveClass('item-has-start-slot');
      }
    }
  });

  it('applies custom className', () => {
    mockUseWallet.mockReturnValue({
      wallets: mockWallets,
      isLoading: false,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    const { container } = render(<WalletList className='custom-class' />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles wallets without onClick when onWalletClick is not provided', () => {
    mockUseWallet.mockReturnValue({
      wallets: mockWallets,
      isLoading: false,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList />);

    // Wallets should be rendered but not clickable
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();

    // IonItems should be present but without accessibility features of buttons
    const ionItems = document.querySelectorAll('ion-item');
    expect(ionItems.length).toBe(2);
    // Check that items don't have aria-label (indicating they're not clickable)
    for (const item of ionItems) {
      expect(item).not.toHaveAttribute('aria-label');
    }
  });

  it('displays formatted currency amounts', () => {
    mockUseWallet.mockReturnValue({
      wallets: mockWallets,
      isLoading: false,
      error: null,
      refreshWallets: mockRefreshWallets,
    });

    render(<WalletList />);

    // Check separate format for spent and remaining using getAllByText for repeated text
    const spentLabels = screen.getAllByText('Spent');
    expect(spentLabels).toHaveLength(2); // Two wallets
    const remainingLabels = screen.getAllByText('Remaining');
    expect(remainingLabels).toHaveLength(2); // Two wallets

    // Check specific amounts
    expect(screen.getByText('$150.00')).toBeInTheDocument(); // Groceries spent
    expect(screen.getByText('$350.00')).toBeInTheDocument(); // Groceries remaining: 500 - 150
    expect(screen.getByText('$75.00')).toBeInTheDocument(); // Entertainment spent
    expect(screen.getByText('$125.00')).toBeInTheDocument(); // Entertainment remaining: 200 - 75
  });
});
