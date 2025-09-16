import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WalletSetupModal from './WalletSetupModal';

// Mock the hooks
vi.mock('@/hooks/api/wallet', () => ({
  useFetchWalletsByPeriod: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCreateWallet: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateWallet: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteWallet: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/hooks', () => ({
  usePrompt: vi.fn(() => ({
    showConfirmPrompt: vi.fn(),
  })),
}));

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react');
  return {
    ...actual,
    useIonToast: vi.fn(() => [vi.fn()]),
  };
});

vi.mock('@/providers/wallet', () => ({
  useWallet: vi.fn(() => ({
    wallets: [],
    selectedWallet: null,
    isLoading: false,
    error: null,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('WalletSetupModal', () => {
  const defaultProps = {
    wallets: [],
    onDismiss: vi.fn(),
    accountId: 'test-account',
    periodId: 'test-period',
  };

  it('renders wallet management title when not editing', () => {
    render(<WalletSetupModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Manage Wallets')).toBeInTheDocument();
  });

  it('shows create first wallet button when no wallets exist', () => {
    render(<WalletSetupModal {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Create Your First Wallet')).toBeInTheDocument();
  });
});
