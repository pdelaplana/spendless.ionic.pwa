import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ScheduledSpendingItem } from './ScheduledSpendingItem';

// Mock the hooks
vi.mock('@/hooks/ui/useFormatters', () => ({
  default: () => ({
    formatCurrency: (amount: number, currency?: string) => `$${amount.toFixed(2)}`,
  }),
}));

vi.mock('@/providers/spendingAccount', () => ({
  useSpendingAccount: () => ({
    account: { currency: 'USD' },
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'spending.futureSpending') return 'Scheduled Spending';
      return key;
    },
  }),
}));

const renderComponent = (props: {
  futureSpendingCount: number;
  futureSpendingTotal: number;
}) => {
  return render(
    <BrowserRouter>
      <ScheduledSpendingItem {...props} />
    </BrowserRouter>,
  );
};

describe('ScheduledSpendingItem', () => {
  it('should render with total amount', () => {
    renderComponent({
      futureSpendingCount: 3,
      futureSpendingTotal: 150.5,
    });

    expect(screen.getByText('Scheduled Spending')).toBeInTheDocument();
    expect(screen.getByText('$150.50')).toBeInTheDocument();
  });

  it('should not render when count is 0', () => {
    renderComponent({
      futureSpendingCount: 0,
      futureSpendingTotal: 0,
    });

    expect(screen.queryByText('Scheduled Spending')).not.toBeInTheDocument();
  });

  it('should format large amounts correctly', () => {
    renderComponent({
      futureSpendingCount: 5,
      futureSpendingTotal: 1250.75,
    });

    expect(screen.getByText('$1250.75')).toBeInTheDocument();
  });
});
