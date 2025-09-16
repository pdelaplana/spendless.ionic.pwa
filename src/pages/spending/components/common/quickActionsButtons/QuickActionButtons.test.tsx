import type { IWallet } from '@/domain/Wallet';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuickActionButtons } from './QuickActionButtons';

const mockWallet: IWallet = {
  id: 'test-wallet',
  accountId: 'test-account',
  periodId: 'test-period',
  name: 'Groceries',
  spendingLimit: 500,
  currentBalance: 150,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('QuickActionButtons', () => {
  const defaultProps = {
    onNewSpend: vi.fn(),
    onEditPeriod: vi.fn(),
    onMore: vi.fn(),
    onWalletSwitch: vi.fn(),
  };

  it('renders all action buttons', () => {
    render(<QuickActionButtons {...defaultProps} />);

    expect(screen.getByText('New Spend')).toBeInTheDocument();
    expect(screen.getByText('Edit Period')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument(); // No wallet selected
  });

  it('displays wallet information when current wallet is provided', () => {
    render(<QuickActionButtons {...defaultProps} currentWallet={mockWallet} />);

    expect(screen.getByText('Groceri...')).toBeInTheDocument(); // Truncated name
    expect(screen.getByText('30%')).toBeInTheDocument(); // 150/500 = 30%
  });

  it('truncates long wallet names', () => {
    const longNameWallet: IWallet = {
      ...mockWallet,
      name: 'Very Long Wallet Name',
    };

    render(<QuickActionButtons {...defaultProps} currentWallet={longNameWallet} />);

    expect(screen.getByText('Very Lo...')).toBeInTheDocument();
  });

  it('shows progress bar when wallet is provided', () => {
    render(<QuickActionButtons {...defaultProps} currentWallet={mockWallet} />);

    const progressBar = document.querySelector('ion-progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('color', 'primary');
  });

  it('applies correct color when wallet is over limit', () => {
    const overLimitWallet: IWallet = {
      ...mockWallet,
      currentBalance: 600, // Over the 500 limit
    };

    render(<QuickActionButtons {...defaultProps} currentWallet={overLimitWallet} />);

    // Check that the progress bar shows danger color
    const progressBar = document.querySelector('ion-progress-bar');
    expect(progressBar).toHaveAttribute('color', 'danger');

    // Check that the percentage shows 100% (over limit)
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows wallet action sheet button when handler is provided', () => {
    const onWalletActionSheet = vi.fn();
    render(
      <QuickActionButtons
        {...defaultProps}
        onWalletActionSheet={onWalletActionSheet}
        currentWallet={mockWallet}
      />,
    );

    expect(screen.getByText('Wallet Sheet')).toBeInTheDocument();
  });

  it('does not show wallet action sheet button when handler is not provided', () => {
    render(<QuickActionButtons {...defaultProps} currentWallet={mockWallet} />);

    expect(screen.queryByText('Wallet Sheet')).not.toBeInTheDocument();
  });
});
