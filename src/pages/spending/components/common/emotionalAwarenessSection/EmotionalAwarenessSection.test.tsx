import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import EmotionalAwarenessSection from './EmotionalAwarenessSection';
import { MOOD_CONTEXTS } from './emotionalContexts';

// Mock Ionic components
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual<typeof import('@ionic/react')>('@ionic/react');
  return {
    ...actual,
    IonIcon: () => <div data-testid='ion-icon' />,
  };
});

// Mock react-hook-form's useWatch
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<typeof import('react-hook-form')>('react-hook-form');
  return {
    ...actual,
    useWatch: ({ name }: { name: string }) => {
      if (name === 'emotionalState') return 'happy';
      if (name === 'emotionalContext') return ['celebrating a win'];
      return '';
    },
  };
});

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock TextAreaFormField
vi.mock('@/components/forms/fields/TextAreaFormField', () => ({
  default: ({
    label,
    value,
    onChange,
  }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label htmlFor='mock-textarea'>{label}</label>
      <textarea
        id='mock-textarea'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid='mock-textarea'
      />
    </div>
  ),
}));

describe('EmotionalAwarenessSection', () => {
  const mockProps = {
    setValue: vi.fn() as unknown as UseFormSetValue<SpendFormData>,
    getValues: vi.fn() as unknown as UseFormGetValues<SpendFormData>,
    control: {} as unknown as Control<SpendFormData>,
    register: vi.fn() as unknown as UseFormRegister<SpendFormData>,
    errors: {} as FieldErrors<SpendFormData>,
    customContexts: {
      happy: ['winning'],
    },
    onAddCustomContext: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with mood options', () => {
    (mockProps.getValues as unknown as Mock).mockReturnValue('');
    render(<EmotionalAwarenessSection {...mockProps} />);

    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.getByText('😰')).toBeInTheDocument();
    expect(screen.getByText('Stressed')).toBeInTheDocument();
  });

  it('calls setValue when a mood is selected', () => {
    render(<EmotionalAwarenessSection {...mockProps} />);

    const stressedMood = screen.getByText('Stressed').closest('div');
    if (stressedMood) fireEvent.click(stressedMood);

    expect(mockProps.setValue).toHaveBeenCalledWith(
      'emotionalState',
      'stressed',
      expect.anything(),
    );
  });

  it('renders context chips for the selected mood', () => {
    render(<EmotionalAwarenessSection {...mockProps} />);

    // Default contexts for 'happy' include things like 'Celebrating a win'
    expect(screen.getByText(/celebrating a win/i)).toBeInTheDocument();
    // Custom context for 'happy'
    expect(screen.getByText(/winning/i)).toBeInTheDocument();
  });

  it('toggles context and updates notes when a context chip is clicked', () => {
    // Current state from mock useWatch: happy mood, 'celebrating a win' context selected.
    // notes is initially empty.
    (mockProps.getValues as unknown as Mock).mockReturnValue('');
    render(<EmotionalAwarenessSection {...mockProps} />);

    const contextChip = screen.getByText('winning');
    fireEvent.click(contextChip);

    // Should call setValue for both context and notes
    expect(mockProps.setValue).toHaveBeenCalledWith(
      'emotionalContext',
      ['celebrating a win', 'winning'],
      expect.anything(),
    );
    expect(mockProps.setValue).toHaveBeenCalledWith('notes', 'winning', expect.anything());
  });

  it('handles custom context addition', async () => {
    render(<EmotionalAwarenessSection {...mockProps} />);

    // Find the add icon (mocked as div)
    const addChip = screen.getByTestId('ion-icon').closest('div');
    if (addChip) fireEvent.click(addChip);

    const input = screen.getByPlaceholderText('Add context...');
    fireEvent.change(input, { target: { value: 'New Custom' } });

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockProps.onAddCustomContext).toHaveBeenCalledWith('happy', 'New Custom');
    });
  });
});
