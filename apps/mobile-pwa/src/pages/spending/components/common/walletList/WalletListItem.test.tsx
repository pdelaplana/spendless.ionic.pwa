import type { IWallet } from '@/domain/Wallet';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WalletListItem from './WalletListItem';

const mockWallet: IWallet = {
  id: 'wallet-1',
  accountId: 'account-1',
  periodId: 'period-1',
  name: 'Groceries & Food',
  spendingLimit: 500,
  currentBalance: 150,
  isDefault: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockFormatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

describe('WalletListItem', () => {
  it('renders wallet information correctly', () => {
    render(<WalletListItem wallet={mockWallet} formatCurrency={mockFormatCurrency} />);

    expect(screen.getByText('Groceries & Food')).toBeInTheDocument();
    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('$350.00')).toBeInTheDocument();
  });

  it('renders as clickable when onClick is provided', () => {
    const mockOnClick = vi.fn();

    render(
      <WalletListItem
        wallet={mockWallet}
        onClick={mockOnClick}
        formatCurrency={mockFormatCurrency}
      />,
    );

    const ionItem = document.querySelector('ion-item');
    expect(ionItem).toBeInTheDocument();
    expect(ionItem).toHaveAttribute(
      'aria-label',
      'Groceries & Food, spent $150.00, remaining $350.00',
    );

    // Should show wallet icon
    const icons = document.querySelectorAll('ion-icon');
    expect(icons.length).toBeGreaterThanOrEqual(1); // wallet icon (detail chevron is handled by IonItem)
  });

  it('renders as non-clickable when onClick is not provided', () => {
    render(<WalletListItem wallet={mockWallet} formatCurrency={mockFormatCurrency} />);

    const ionItem = document.querySelector('ion-item');
    expect(ionItem).toBeInTheDocument();
    expect(ionItem).not.toHaveAttribute('aria-label');

    // Should have wallet icon
    const icons = document.querySelectorAll('ion-icon');
    expect(icons.length).toBe(1); // Only wallet icon, no detail chevron
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();

    render(
      <WalletListItem
        wallet={mockWallet}
        onClick={mockOnClick}
        formatCurrency={mockFormatCurrency}
      />,
    );

    const ionItem = document.querySelector('ion-item');
    expect(ionItem).toBeInTheDocument();
    if (ionItem) {
      fireEvent.click(ionItem);
    }

    expect(mockOnClick).toHaveBeenCalledWith('wallet-1');
  });

  it('has proper accessibility when clickable', () => {
    const mockOnClick = vi.fn();

    render(
      <WalletListItem
        wallet={mockWallet}
        onClick={mockOnClick}
        formatCurrency={mockFormatCurrency}
      />,
    );

    const ionItem = document.querySelector('ion-item');

    // Should have proper aria-label for accessibility
    expect(ionItem).toHaveAttribute('aria-label');

    // Should have item-related classes (indicating it's a proper IonItem)
    expect(ionItem).toHaveClass('item-has-start-slot');
  });

  it('handles wallet with zero remaining balance', () => {
    const fullSpentWallet: IWallet = {
      ...mockWallet,
      currentBalance: 500, // Equal to spending limit
    };

    render(<WalletListItem wallet={fullSpentWallet} formatCurrency={mockFormatCurrency} />);

    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles wallet with overspent balance', () => {
    const overspentWallet: IWallet = {
      ...mockWallet,
      currentBalance: 600, // More than spending limit
    };

    render(<WalletListItem wallet={overspentWallet} formatCurrency={mockFormatCurrency} />);

    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText('$600.00')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles very long wallet names', () => {
    const longNameWallet: IWallet = {
      ...mockWallet,
      name: 'This is a very long wallet name that should be handled gracefully by the component',
    };

    render(<WalletListItem wallet={longNameWallet} formatCurrency={mockFormatCurrency} />);

    expect(screen.getByText(longNameWallet.name)).toBeInTheDocument();
  });

  it('handles wallet without id gracefully', () => {
    const noIdWallet: IWallet = {
      ...mockWallet,
      id: undefined,
    };

    const mockOnClick = vi.fn();

    render(
      <WalletListItem
        wallet={noIdWallet}
        onClick={mockOnClick}
        formatCurrency={mockFormatCurrency}
      />,
    );

    const ionItem = document.querySelector('ion-item');
    expect(ionItem).toBeInTheDocument();
    if (ionItem) {
      fireEvent.click(ionItem);
    }

    // Should not call onClick if no id
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('displays wallet icon', () => {
    render(<WalletListItem wallet={mockWallet} formatCurrency={mockFormatCurrency} />);

    // Check that wallet icon is present and has proper ARIA attribute
    const walletIcon = document.querySelector('ion-icon');
    expect(walletIcon).toBeInTheDocument();
    expect(walletIcon).toHaveAttribute('aria-hidden');
  });

  it('uses custom currency formatter', () => {
    const customFormatter = (amount: number) => `€${amount.toFixed(2)}`;

    render(<WalletListItem wallet={mockWallet} formatCurrency={customFormatter} />);

    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText('€150.00')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('€350.00')).toBeInTheDocument();
  });
});
