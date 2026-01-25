import type { ISpend } from '@/domain/Spend';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import MoodSpendingChart from './MoodSpendingChart';

interface MockPieOptions {
  onClick?: (event: unknown, elements: { index: number }[]) => void;
}

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Pie: ({ data, options }: { data: unknown; options: MockPieOptions }) => (
    <button
      type='button'
      data-testid='mood-pie-chart'
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && options.onClick) {
          options.onClick(e, [{ index: 0 }]);
        }
      }}
      onClick={(e) => {
        if (options.onClick) {
          options.onClick(e, [{ index: 0 }]);
        }
      }}
      style={{
        width: '100%',
        height: '300px',
        background: 'transparent',
        border: 'none',
        padding: 0,
      }}
    >
      <div data-testid='chart-data'>{JSON.stringify(data)}</div>
      <div data-testid='chart-options'>{JSON.stringify(options)}</div>
    </button>
  ),
}));

// Mock ionic icons
vi.mock('ionicons/icons', () => ({
  arrowBackOutline: 'arrow-back',
}));

// Mock Ionic components
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    IonIcon: () => <div data-testid='ion-icon' />,
    IonButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button type='button' onClick={onClick} aria-label='go back'>
        {children}
      </button>
    ),
  };
});

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

const mockSpending: ISpend[] = [
  {
    id: '1',
    accountId: 'acc1',
    walletId: 'w1',
    amount: 100,
    category: 'need',
    date: new Date(),
    emotionalState: 'sad',
    emotionalContext: ['rough day'],
    createdAt: new Date(),
    updatedAt: new Date(),
    periodId: 'p1',
    description: 'test',
  },
  {
    id: '2',
    accountId: 'acc1',
    walletId: 'w1',
    amount: 50,
    category: 'rituals',
    date: new Date(),
    emotionalState: 'happy',
    emotionalContext: ['coffee'],
    createdAt: new Date(),
    updatedAt: new Date(),
    periodId: 'p1',
    description: 'test',
  },
];

describe('MoodSpendingChart', () => {
  it('renders correctly with initial mood view', () => {
    render(<MoodSpendingChart spending={mockSpending} currency='USD' />);

    expect(screen.getByText('All Moods')).toBeInTheDocument();
    expect(screen.getByTestId('mood-pie-chart')).toBeInTheDocument();
  });

  it('aggregates mood data correctly', () => {
    render(<MoodSpendingChart spending={mockSpending} currency='USD' />);

    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');

    // Check labels (should include amounts)
    expect(chartData.labels).toContain('😊 Happy: $50.00');
    expect(chartData.labels).toContain('😔 Sad: $100.00');

    // Check datasets
    expect(chartData.datasets[0].data).toEqual([100, 50]); // Order based on Object.keys(moodData)
  });

  it('handles drill-down when a chart segment is clicked', async () => {
    render(<MoodSpendingChart spending={mockSpending} currency='USD' />);

    const chart = screen.getByTestId('mood-pie-chart');
    fireEvent.click(chart);

    // Now title should change to the selected mood (Sad)
    // Note: The mock click on index 0 corresponds to 'sad' in our aggregated data
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/sad/i);

    // Should show back button
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();

    // Verify that data is now context-specific
    const contextChartData = JSON.parse(screen.getByTestId('chart-data').textContent || '{}');
    expect(contextChartData.labels[0]).toContain('rough day');
    expect(contextChartData.datasets[0].data).toEqual([100]);
  });

  it('returns to main view when back button is clicked', () => {
    render(<MoodSpendingChart spending={mockSpending} currency='USD' />);

    // 1. Drill down
    fireEvent.click(screen.getByTestId('mood-pie-chart'));
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();

    // 2. Click back button
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));

    // 3. Should be back to main view
    expect(screen.getByText('All Moods')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
  });

  it('renders empty state when no spending data', () => {
    render(<MoodSpendingChart spending={[]} currency='USD' />);

    expect(screen.getByText('charts.noDataAvailable')).toBeInTheDocument();
    expect(screen.queryByTestId('mood-pie-chart')).not.toBeInTheDocument();
  });
});
