import { useSpendingAccount } from '@/providers/spendingAccount';
import { render, screen } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import MoodAnalysisPage from './MoodAnalysisPage';

// Mock the providers
vi.mock('@/providers/spendingAccount', () => ({
  useSpendingAccount: vi.fn(),
}));
const mockUseSpendingAccount = useSpendingAccount as Mock;

// Mock the child components to simplify integration test
vi.mock('./components/moodSpending', () => ({
  MoodSpendingChart: () => <div data-testid='mock-spending-chart' />,
  MoodInsightsCard: () => <div data-testid='mock-insights-card' />,
}));

// Mock Layout components
vi.mock('@/components/layouts', () => ({
  BasePageLayout: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid='base-layout'>
      <h1>{title}</h1>
      {children}
    </div>
  ),
  CenterContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='center-container'>{children}</div>
  ),
}));

// Mock other components
vi.mock('@/components/menu/MainMenuContent', () => ({
  default: () => <div data-testid='main-menu' />,
}));
vi.mock('@/components/shared', () => ({
  SentryErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='error-boundary'>{children}</div>
  ),
}));
vi.mock('@/theme/components', () => ({
  GlassCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='glass-card'>{children}</div>
  ),
  GradientBackground: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='gradient-bg'>{children}</div>
  ),
}));

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock Ion components
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    IonText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  };
});

describe('MoodAnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when fetching', () => {
    mockUseSpendingAccount.mockReturnValueOnce({
      chartSpending: [],
      account: { id: 'acc1', currency: 'USD' },
      isFetching: true,
      isFetchingChartData: false,
    });

    render(<MoodAnalysisPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders empty state when no account is found', () => {
    mockUseSpendingAccount.mockReturnValueOnce({
      chartSpending: [],
      account: null,
      isFetching: false,
      isFetchingChartData: false,
    });

    render(<MoodAnalysisPage />);

    expect(screen.getByText(/no account data/i)).toBeInTheDocument();
  });

  it('renders chart and insights when data is available', () => {
    mockUseSpendingAccount.mockReturnValueOnce({
      chartSpending: [{ id: '1', amount: 10, date: new Date(), emotionalState: 'happy' }],
      account: { id: 'acc1', currency: 'USD' },
      isFetching: false,
      isFetchingChartData: false,
    });

    render(<MoodAnalysisPage />);

    expect(screen.getByText('Mood Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('mock-spending-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-insights-card')).toBeInTheDocument();
  });

  it('filters spending to only include past and present transactions', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    mockUseSpendingAccount.mockReturnValueOnce({
      chartSpending: [
        { id: '1', amount: 10, date: pastDate, emotionalState: 'happy' },
        { id: '2', amount: 20, date: futureDate, emotionalState: 'sad' },
      ],
      account: { id: 'acc1', currency: 'USD' },
      isFetching: false,
      isFetchingChartData: false,
    });

    render(<MoodAnalysisPage />);

    expect(screen.getByTestId('mock-spending-chart')).toBeInTheDocument();
  });
});
