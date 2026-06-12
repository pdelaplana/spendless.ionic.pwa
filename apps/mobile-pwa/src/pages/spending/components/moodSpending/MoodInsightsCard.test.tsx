import type { ISpend } from '@/domain/Spend';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MoodInsightsCard from './MoodInsightsCard';

// Mock Ionic components
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    IonIcon: () => <div data-testid='ion-icon' />,
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
    description: 'test transaction',
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
    description: 'test transaction',
  },
  {
    id: '3',
    accountId: 'acc1',
    walletId: 'w1',
    amount: 200,
    category: 'want',
    date: new Date(),
    emotionalState: 'sad',
    emotionalContext: ['retail therapy'],
    createdAt: new Date(),
    updatedAt: new Date(),
    periodId: 'p1',
    description: 'test transaction',
  },
];

describe('MoodInsightsCard', () => {
  it('renders null when no spending data', () => {
    const { container } = render(<MoodInsightsCard spending={[]} currency='USD' />);
    expect(container.firstChild).toBeNull();
  });

  it('identifies the highest spending mood', () => {
    render(<MoodInsightsCard spending={mockSpending} currency='USD' />);

    expect(screen.getByText('Highest Spending Mood')).toBeInTheDocument();
    // Sad: 100 + 200 = 300, Happy: 50. Total: 350.
    // Sad percentage: (300/350)*100 = 85.7%
    expect(screen.getByText(/happens when you feel sad/i)).toBeInTheDocument();
    expect(screen.getByText(/\$300\.00/)).toBeInTheDocument();
    // Use getAllByText because it appears in both highest mood and emotional alert
    const percentages = screen.getAllByText(/85\.7%/);
    expect(percentages.length).toBeGreaterThanOrEqual(1);
  });

  it('identifies the largest average purchase', () => {
    render(<MoodInsightsCard spending={mockSpending} currency='USD' />);

    expect(screen.getByText('Largest Average Purchase')).toBeInTheDocument();
    // Sad average: 300 / 2 = 150
    // Happy average: 50 / 1 = 50
    expect(screen.getByText(/averaging \$150\.00 per transaction/i)).toBeInTheDocument();
  });

  it('shows Emotional Spending Alert for negative moods exceeding threshold', () => {
    render(<MoodInsightsCard spending={mockSpending} currency='USD' />);

    expect(screen.getByText('Emotional Spending Alert')).toBeInTheDocument();
    // Sad is a negative mood. 300 out of 350 is ~85.7% (> 30%)
    expect(
      screen.getByText(/85\.7% of your spending this period was driven by negative emotions/i),
    ).toBeInTheDocument();
  });

  it('shows low-threshold message for emotional spending', () => {
    const lowEmotionalSpending: ISpend[] = [
      {
        id: '1',
        accountId: 'acc1',
        walletId: 'w1',
        amount: 20,
        category: 'need',
        date: new Date(),
        emotionalState: 'stressed',
        createdAt: new Date(),
        updatedAt: new Date(),
        periodId: 'p1',
        description: 'test',
      },
      {
        id: '2',
        accountId: 'acc1',
        walletId: 'w1',
        amount: 80,
        category: 'need',
        date: new Date(),
        emotionalState: 'happy',
        createdAt: new Date(),
        updatedAt: new Date(),
        periodId: 'p1',
        description: 'test',
      },
    ];

    render(<MoodInsightsCard spending={lowEmotionalSpending} currency='USD' />);

    expect(screen.getByText('Emotional Spending Alert')).toBeInTheDocument();
    // Stressed (negative): 20. Total: 100. Percentage: 20% (< 30%)
    expect(
      screen.getByText(/you spent \$20\.00 while feeling stressed, sad, or angry/i),
    ).toBeInTheDocument();
  });

  it('renders correctly with different currency', () => {
    render(<MoodInsightsCard spending={mockSpending} currency='EUR' />);

    // Check for EUR symbol or code depending on locale (intl en-US normally uses € or EUR)
    // Intl en-US for EUR is usually "€300.00"
    expect(screen.getByText(/€300\.00/)).toBeInTheDocument();
  });
});
