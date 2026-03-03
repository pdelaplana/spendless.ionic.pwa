import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Ionic components
vi.mock('@ionic/react', () => ({
  IonIcon: ({ icon }: { icon: string }) => <span data-testid='ion-icon' data-icon={icon} />,
  IonToggle: ({
    checked,
    onIonChange,
    color,
  }: {
    checked: boolean;
    onIonChange: (e: { detail: { checked: boolean } }) => void;
    color: string;
  }) => (
    <input
      type='checkbox'
      data-testid='context-toggle'
      checked={checked}
      data-color={color}
      onChange={(e) => onIonChange({ detail: { checked: e.target.checked } })}
    />
  ),
}));

// Mock design system
vi.mock('@theme/designSystem', () => ({
  designSystem: {
    spacing: { sm: '8px', md: '16px' },
    colors: {
      gray: { 50: '#f9f9f9', 200: '#e0e0e0' },
      brand: { secondary: '#6200ee' },
      text: { primary: '#000', secondary: '#666' },
    },
  },
}));

import { SpendingContextBanner } from './SpendingContextBanner';

describe('SpendingContextBanner', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the context label', () => {
    render(<SpendingContextBanner includeContext={true} onToggle={mockOnToggle} />);

    expect(screen.getByText('coach.context.toggleLabel')).toBeInTheDocument();
  });

  it('shows toggle description when context is on', () => {
    render(<SpendingContextBanner includeContext={true} onToggle={mockOnToggle} />);

    expect(screen.getByText('coach.context.toggleDescription')).toBeInTheDocument();
  });

  it('shows context off message when context is off', () => {
    render(<SpendingContextBanner includeContext={false} onToggle={mockOnToggle} />);

    expect(screen.getByText('coach.context.contextOff')).toBeInTheDocument();
  });

  it('renders toggle in checked state when context is on', () => {
    render(<SpendingContextBanner includeContext={true} onToggle={mockOnToggle} />);

    const toggle = screen.getByTestId('context-toggle') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it('renders toggle in unchecked state when context is off', () => {
    render(<SpendingContextBanner includeContext={false} onToggle={mockOnToggle} />);

    const toggle = screen.getByTestId('context-toggle') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  });

  it('calls onToggle with true when toggled on', async () => {
    render(<SpendingContextBanner includeContext={false} onToggle={mockOnToggle} />);

    const toggle = screen.getByTestId('context-toggle');
    await userEvent.click(toggle);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('calls onToggle with false when toggled off', async () => {
    render(<SpendingContextBanner includeContext={true} onToggle={mockOnToggle} />);

    const toggle = screen.getByTestId('context-toggle');
    await userEvent.click(toggle);

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it('renders with secondary color on the toggle', () => {
    render(<SpendingContextBanner includeContext={true} onToggle={mockOnToggle} />);

    const toggle = screen.getByTestId('context-toggle');
    expect(toggle).toHaveAttribute('data-color', 'secondary');
  });
});
