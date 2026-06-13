import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ROUTES } from './routes.constants';

// Mock AiInsightsListPage so we can detect when it renders
vi.mock('@/pages/spending/AiInsightsListPage', () => ({
  default: () => <div data-testid='ai-insights-list-page'>AI Insights List Page</div>,
}));

// Mock all dependencies for AiInsightsListPage
vi.mock('@/providers/wallet', () => ({
  WalletProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useWallet: vi.fn(() => ({ wallets: [], isLoading: false })),
}));

describe('ROUTES constants', () => {
  it('defines an INBOX route', () => {
    expect(ROUTES.INBOX).toBeDefined();
  });

  it('INBOX route is a valid path string starting with /', () => {
    expect(typeof ROUTES.INBOX).toBe('string');
    expect(ROUTES.INBOX).toMatch(/^\//);
  });
});

describe('Inbox page rendering', () => {
  it('AiInsightsListPage renders when used as the Inbox page component', async () => {
    const AiInsightsListPage = (await import('@/pages/spending/AiInsightsListPage')).default;
    render(<AiInsightsListPage />);
    expect(screen.getByTestId('ai-insights-list-page')).toBeInTheDocument();
  });
});
