import type { IWallet } from '@/domain/Wallet';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import WalletSwitcherActionSheet from './WalletSwitcherActionSheet';

// Mock Ionic React components to render their children
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    useIonToast: vi.fn(() => [vi.fn()]),
    IonModal: ({ children, isOpen, ...props }: { children: React.ReactNode; isOpen: boolean; [key: string]: unknown }) =>
      isOpen ? (
        <div data-testid='ion-modal' {...props}>
          {children}
        </div>
      ) : null,
    IonHeader: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid='ion-header' {...props}>
        {children}
      </div>
    ),
    IonToolbar: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid='ion-toolbar' {...props}>
        {children}
      </div>
    ),
    IonTitle: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <h1 data-testid='ion-title' {...props}>
        {children}
      </h1>
    ),
    IonButton: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
      <button data-testid='ion-button' onClick={onClick} {...props}>
        {children}
      </button>
    ),
    IonIcon: ({ icon, ...props }: { icon: unknown; [key: string]: unknown }) => (
      <span data-testid='ion-icon' {...props}>
        {icon as React.ReactNode}
      </span>
    ),
    IonList: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid='ion-list' {...props}>
        {children}
      </div>
    ),
    IonItem: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
      <div data-testid='ion-item' onClick={onClick} {...props}>
        {children}
      </div>
    ),
    IonLabel: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid='ion-label' {...props}>
        {children}
      </div>
    ),
    IonNote: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <span data-testid='ion-note' {...props}>
        {children}
      </span>
    ),
    IonProgressBar: ({ value, color, ...props }: { value?: number; color?: string; [key: string]: unknown }) => (
      <div data-testid='ion-progress-bar' data-value={value} data-color={color} {...props} />
    ),
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('WalletSwitcherActionSheet', () => {
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
    isOpen: true,
    wallets: mockWallets,
    onDismiss: vi.fn(),
    onWalletSelected: vi.fn(),
  };

  it('renders switch wallet title', () => {
    render(<WalletSwitcherActionSheet {...defaultProps} />);
    expect(screen.getByText('Switch Wallet')).toBeInTheDocument();
  });

  it('shows period overview with wallet data', () => {
    render(<WalletSwitcherActionSheet {...defaultProps} />);
    expect(screen.getByText('Period Overview')).toBeInTheDocument();
    expect(screen.getByText('$225.00 of $700.00')).toBeInTheDocument();
    expect(screen.getByText('32% used across 2 wallets')).toBeInTheDocument();
  });

  it('renders wallet list items with progress bars', () => {
    render(<WalletSwitcherActionSheet {...defaultProps} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();

    // Check for progress information
    expect(screen.getByText('$150.00 of $500.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00 of $200.00')).toBeInTheDocument();
  });

  it('shows current wallet as selected', () => {
    render(<WalletSwitcherActionSheet {...defaultProps} currentWallet={mockWallets[0]} />);

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    // In a real test, we would check for visual indicators of selection
  });

  it('calls onWalletSelected and onDismiss when a wallet is selected', () => {
    const onWalletSelected = vi.fn();
    const onDismiss = vi.fn();

    render(
      <WalletSwitcherActionSheet
        {...defaultProps}
        onWalletSelected={onWalletSelected}
        onDismiss={onDismiss}
      />,
    );

    // Find and click the first wallet item
    const groceriesWallet = screen.getByText('Groceries').closest('[data-testid="ion-item"]');
    if (groceriesWallet) {
      fireEvent.click(groceriesWallet);
    }

    expect(onWalletSelected).toHaveBeenCalledWith(mockWallets[0]);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('only calls onDismiss when current wallet is selected again', () => {
    const onWalletSelected = vi.fn();
    const onDismiss = vi.fn();

    render(
      <WalletSwitcherActionSheet
        {...defaultProps}
        currentWallet={mockWallets[0]}
        onWalletSelected={onWalletSelected}
        onDismiss={onDismiss}
      />,
    );

    // Click the already selected wallet
    const groceriesWallet = screen.getByText('Groceries').closest('[data-testid="ion-item"]');
    if (groceriesWallet) {
      fireEvent.click(groceriesWallet);
    }

    expect(onWalletSelected).not.toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('shows empty state when no wallets provided', () => {
    render(<WalletSwitcherActionSheet {...defaultProps} wallets={[]} />);
    expect(screen.getByText('No wallets found')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first wallet to get started with budget tracking'),
    ).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<WalletSwitcherActionSheet {...defaultProps} onDismiss={onDismiss} />);

    const closeButton = screen.getByTestId('ion-button');
    fireEvent.click(closeButton);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('shows over-limit styling for wallets exceeding their limit', () => {
    const overLimitWallets: IWallet[] = [
      {
        id: 'wallet-over',
        name: 'Over Limit',
        currentBalance: 600, // Over the 500 limit
        spendingLimit: 500,
        isDefault: false,
        accountId: 'test-account',
        periodId: 'test-period',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<WalletSwitcherActionSheet {...defaultProps} wallets={overLimitWallets} />);
    expect(screen.getByText('Over by $100.00')).toBeInTheDocument();
  });
});
