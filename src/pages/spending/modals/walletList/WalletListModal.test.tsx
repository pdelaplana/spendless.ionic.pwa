import type { IWallet } from '@/domain/Wallet';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WalletListModal from './WalletListModal';

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    useIonToast: vi.fn(() => [vi.fn()]),
  };
});

describe('WalletListModal', () => {
  const mockWallets: IWallet[] = [
    {
      id: 'wallet1',
      name: 'Groceries',
      currentBalance: 150,
      spendingLimit: 500,
      isDefault: true,
      accountId: 'test-account',
      periodId: 'test-period',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'wallet2',
      name: 'Entertainment',
      currentBalance: 75,
      spendingLimit: 200,
      isDefault: false,
      accountId: 'test-account',
      periodId: 'test-period',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultProps = {
    wallets: mockWallets,
    onDismiss: vi.fn(),
    onWalletSelected: vi.fn(),
  };

  it('renders select wallet title', () => {
    render(<WalletListModal {...defaultProps} />);
    expect(screen.getByText('Select Wallet')).toBeInTheDocument();
  });

  it('shows period overview with wallet data', () => {
    render(<WalletListModal {...defaultProps} />);
    expect(screen.getByText('Period Overview')).toBeInTheDocument();
    expect(screen.getByText('$225.00 of $700.00')).toBeInTheDocument();
    expect(screen.getByText('32% used across 2 wallets')).toBeInTheDocument();
  });

  it('renders wallet list items', () => {
    render(<WalletListModal {...defaultProps} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('calls onWalletSelected and onDismiss when a wallet is selected', () => {
    const onWalletSelected = vi.fn();
    const onDismiss = vi.fn();

    render(
      <WalletListModal
        {...defaultProps}
        onWalletSelected={onWalletSelected}
        onDismiss={onDismiss}
      />,
    );

    // Find and click the first wallet item
    const groceriesWallet = screen.getByText('Groceries').closest('ion-item');
    if (groceriesWallet) {
      fireEvent.click(groceriesWallet);
    }

    expect(onWalletSelected).toHaveBeenCalledWith(mockWallets[0]);
    expect(onDismiss).toHaveBeenCalledWith(mockWallets[0], 'select');
  });

  it('shows empty state when no wallets provided', () => {
    render(<WalletListModal {...defaultProps} wallets={[]} />);
    expect(screen.getByText('No wallets found')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first wallet to get started with budget tracking'),
    ).toBeInTheDocument();
  });
});
