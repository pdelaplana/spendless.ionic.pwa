import type { ISpend } from '@/domain/Spend';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import SpendList from './SpendList';

// Mock the hooks
vi.mock('@/providers/spendingAccount');
vi.mock('@/hooks/ui/useFormatters', () => ({
  default: () => ({
    formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Mock translation for categories
      if (key.startsWith('spending.categories.')) {
        const category = key.replace('spending.categories.', '');
        return category.charAt(0).toUpperCase() + category.slice(1);
      }
      if (key === 'spending.loadMore') return 'Load More';
      return key;
    },
  }),
}));

const mockUseSpendingAccount = useSpendingAccount as Mock;

const mockSpending: ISpend[] = [
  {
    id: 'spend-1',
    accountId: 'account-1',
    periodId: 'period-1',
    walletId: 'wallet-1',
    amount: 25.5,
    description: 'Coffee at Starbucks',
    category: 'want',
    date: new Date('2024-01-15'),
    tags: ['coffee', 'morning'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'spend-2',
    accountId: 'account-1',
    periodId: 'period-1',
    walletId: 'wallet-1',
    amount: 120.0,
    description: 'Grocery shopping',
    category: 'need',
    date: new Date('2024-01-15'),
    tags: ['food', 'weekly'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'spend-3',
    accountId: 'account-1',
    periodId: 'period-1',
    walletId: 'wallet-1',
    amount: 45.0,
    description: 'Gas station',
    category: 'need',
    date: new Date('2024-01-14'),
    tags: ['transport'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
];

const mockGroupedSpending: [string, ISpend[]][] = [
  ['Today', [mockSpending[0], mockSpending[1]]],
  ['Yesterday', [mockSpending[2]]],
];

describe('SpendList', () => {
  const mockOnSpendClick = vi.fn();
  const mockOnLoadMore = vi.fn();
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSpendingAccount.mockReturnValue({
      account: { id: 'account-1', currency: 'USD' },
    });
  });

  it('renders loading state', () => {
    render(<SpendList spending={[]} groupedSpending={[]} isLoading={true} />);

    const spinner = document.querySelector('ion-spinner');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders error state with retry button', async () => {
    const errorMessage = 'Failed to load spending';
    render(
      <SpendList spending={[]} groupedSpending={[]} error={errorMessage} onRetry={mockOnRetry} />,
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry loading spending/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    await waitFor(() => {
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  it('renders empty state when no spending', () => {
    render(<SpendList spending={[]} groupedSpending={[]} />);

    expect(screen.getByText('No spending found for this period')).toBeInTheDocument();
  });

  it('renders spending list correctly', () => {
    render(<SpendList spending={mockSpending} groupedSpending={mockGroupedSpending} />);

    expect(screen.getByText('Spending')).toBeInTheDocument();

    // Check date headers
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();

    // Check spend items
    expect(screen.getByText('Coffee at Starbucks')).toBeInTheDocument();
    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Gas station')).toBeInTheDocument();

    // Check categories
    expect(screen.getByText('Want')).toBeInTheDocument();
    expect(screen.getAllByText('Need')).toHaveLength(2);

    // Check amounts - some amounts appear multiple times (spend item + daily total)
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getAllByText('$45.00')).toHaveLength(2); // Spend item + daily total
  });

  it('displays daily totals correctly', () => {
    render(<SpendList spending={mockSpending} groupedSpending={mockGroupedSpending} />);

    // Today total: 25.50 + 120.00 = 145.50
    expect(screen.getByText('$145.50')).toBeInTheDocument();
    // Yesterday total: 45.00 - check for multiple instances with getAllByText
    expect(screen.getAllByText('$45.00')).toHaveLength(2); // Both spend item and total
  });

  it('calls onSpendClick when spend item is clicked', async () => {
    render(
      <SpendList
        spending={mockSpending}
        groupedSpending={mockGroupedSpending}
        onSpendClick={mockOnSpendClick}
      />,
    );

    const coffeeSpend = screen.getByText('Coffee at Starbucks').closest('ion-item');
    expect(coffeeSpend).toBeInTheDocument();

    fireEvent.click(coffeeSpend!);

    await waitFor(() => {
      expect(mockOnSpendClick).toHaveBeenCalledWith(mockSpending[0]);
    });
  });

  it('renders load more button when hasNextPage is true', async () => {
    render(
      <SpendList
        spending={mockSpending}
        groupedSpending={mockGroupedSpending}
        hasNextPage={true}
        onLoadMore={mockOnLoadMore}
      />,
    );

    const loadMoreButton = screen.getByText('Load More');
    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);
    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it('does not render load more button when hasNextPage is false', () => {
    render(
      <SpendList
        spending={mockSpending}
        groupedSpending={mockGroupedSpending}
        hasNextPage={false}
      />,
    );

    const loadMoreButton = screen.queryByText('Load More');
    expect(loadMoreButton).not.toBeInTheDocument();
  });

  it('renders tags for spend items', () => {
    render(<SpendList spending={mockSpending} groupedSpending={mockGroupedSpending} />);

    // Tags should be rendered for each spend item
    expect(screen.getByText('coffee')).toBeInTheDocument();
    expect(screen.getByText('morning')).toBeInTheDocument();
    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('weekly')).toBeInTheDocument();
    expect(screen.getByText('transport')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SpendList
        spending={mockSpending}
        groupedSpending={mockGroupedSpending}
        className='custom-class'
      />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles spending without onClick when onSpendClick is not provided', () => {
    render(<SpendList spending={mockSpending} groupedSpending={mockGroupedSpending} />);

    // Spending should be rendered
    expect(screen.getByText('Coffee at Starbucks')).toBeInTheDocument();
    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Gas station')).toBeInTheDocument();

    // Items should still have button properties from the original design
    const ionItems = document.querySelectorAll('ion-item');
    expect(ionItems.length).toBeGreaterThan(0);
  });

  it('handles missing account currency gracefully', () => {
    mockUseSpendingAccount.mockReturnValue({
      account: null,
    });

    render(<SpendList spending={mockSpending} groupedSpending={mockGroupedSpending} />);

    // Should still render amounts even without currency
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
  });

  it('renders spend icons for different categories', () => {
    render(<SpendList spending={mockSpending} groupedSpending={mockGroupedSpending} />);

    // SpendIcon components should be rendered (one for each spend item)
    // We can verify that we have spend items rendered
    const spendItems = document.querySelectorAll('ion-item[detail-icon]');
    expect(spendItems.length).toBe(3); // 3 spend items
  });

  it('has proper line styling for grouped items', () => {
    render(<SpendList spending={mockSpending} groupedSpending={mockGroupedSpending} />);

    const ionItems = document.querySelectorAll('ion-item[button]');

    // Check that items have proper line attributes
    ionItems.forEach((item) => {
      expect(item).toHaveAttribute('lines');
    });
  });
});
