import { Currency } from '@/domain/Currencies';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CurrencyAmountInput from './CurrencyAmountInput';

// Mock the useSpendingAccount hook
vi.mock('@/providers/spendingAccount', () => ({
  useSpendingAccount: () => {
    throw new Error('Provider not available');
  },
}));

describe('CurrencyAmountInput', () => {
  const defaultProps = {
    label: 'Test Amount',
    value: 0,
    onChange: vi.fn(),
    currency: Currency.USD,
    autoFocus: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<CurrencyAmountInput />);

    expect(screen.getByText('Transaction Amount')).toBeInTheDocument();
  });

  it('displays custom label', () => {
    render(<CurrencyAmountInput label='Enter Amount' />);

    expect(screen.getByText('Enter Amount')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<CurrencyAmountInput error='Invalid amount' />);

    expect(screen.getByText('Invalid amount')).toBeInTheDocument();
  });

  it('uses USD symbol when no currency specified', () => {
    render(<CurrencyAmountInput />);

    expect(screen.getByPlaceholderText('$0.00')).toBeInTheDocument();
  });

  it('handles custom placeholder text', () => {
    render(<CurrencyAmountInput placeholder='Enter amount...' />);

    const input = screen.getByPlaceholderText('Enter amount...');
    expect(input).toBeInTheDocument();
  });

  // NEW COMPREHENSIVE TESTS FOR THE REQUESTED FUNCTIONALITY

  describe('Auto-focus behavior', () => {
    it('should auto-focus when autoFocus prop is true', async () => {
      render(<CurrencyAmountInput {...defaultProps} autoFocus={true} />);

      const input = screen.getByRole('textbox');

      // Wait for the component to mount and auto-focus to take effect
      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it('should not auto-focus when autoFocus prop is false', () => {
      render(<CurrencyAmountInput {...defaultProps} autoFocus={false} />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveFocus();
    });

    it('should auto-focus by default when no autoFocus prop is specified', async () => {
      const { autoFocus, ...propsWithoutAutoFocus } = defaultProps;
      render(<CurrencyAmountInput {...propsWithoutAutoFocus} />);

      const input = screen.getByRole('textbox');

      // The component defaults autoFocus to false, so it should not be focused
      expect(input).not.toHaveFocus();
    });
  });

  describe('Zero amount reset behavior', () => {
    it('should reset to "0.00" when user exits input with zero amount', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(<CurrencyAmountInput {...defaultProps} onChange={mockOnChange} autoFocus={false} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Clear the input and blur to trigger the reset
      await user.clear(input);
      await user.click(document.body); // Click outside to blur

      // Check that the input value is reset to formatted zero
      await waitFor(() => {
        expect(input.value).toBe('$0.00');
      });

      // Check that onChange was called with 0
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it('should reset to "0.00" when user enters empty string and tabs out', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <CurrencyAmountInput
          {...defaultProps}
          onChange={mockOnChange}
          value={100}
          autoFocus={false}
        />,
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Clear the input completely
      await user.clear(input);
      await user.tab(); // Tab out to blur

      // Check that the input value is reset to formatted zero
      await waitFor(() => {
        expect(input.value).toBe('$0.00');
      });

      // Check that onChange was called with 0
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it('should not reset non-zero amounts on blur', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(<CurrencyAmountInput {...defaultProps} onChange={mockOnChange} autoFocus={false} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Enter a non-zero amount
      await user.clear(input);
      await user.type(input, '150.75');
      await user.tab(); // Tab out to blur

      // Value should remain as entered (formatted by Maskito)
      await waitFor(() => {
        expect(input.value).toContain('150.75');
      });

      // Should not call onChange with 0 for the blur event
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      expect(lastCall[0]).not.toBe(0);
    });

    it('should handle zero amount with different currency symbols', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <CurrencyAmountInput
          {...defaultProps}
          onChange={mockOnChange}
          currency={Currency.EUR}
          autoFocus={false}
        />,
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Clear input and blur
      await user.clear(input);
      await user.click(document.body);

      // Should reset to EUR formatted zero
      await waitFor(() => {
        expect(input.value).toBe('€0.00');
      });

      expect(mockOnChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Cursor positioning', () => {
    it('should position cursor after currency symbol on focus', async () => {
      const user = userEvent.setup();

      render(<CurrencyAmountInput {...defaultProps} autoFocus={false} value={123.45} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Focus the input
      await user.click(input);

      // Wait for cursor positioning to take effect
      await waitFor(() => {
        // Cursor should be positioned after the $ symbol (position 1)
        expect(input.selectionStart).toBe(1);
        expect(input.selectionEnd).toBe(1);
      });
    });

    it('should position cursor correctly with different currency symbols', async () => {
      const user = userEvent.setup();

      render(
        <CurrencyAmountInput
          {...defaultProps}
          currency={Currency.EUR}
          autoFocus={false}
          value={0}
        />,
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Check that EUR symbol is used
      expect(input.value).toBe('€0.00');

      // Focus and check cursor position after EUR symbol
      await user.click(input);

      await waitFor(() => {
        // Cursor should be positioned after the € symbol (position 1)
        expect(input.selectionStart).toBe(1);
        expect(input.selectionEnd).toBe(1);
      });
    });

    it('should handle cursor positioning with longer currency symbols', async () => {
      const user = userEvent.setup();

      // Use a predefined currency
      const customCurrency = Currency.USD;

      render(
        <CurrencyAmountInput
          {...defaultProps}
          currency={customCurrency}
          autoFocus={false}
          value={0}
        />,
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Focus and check cursor position after the longer symbol
      await user.click(input);

      await waitFor(() => {
        // Cursor should be positioned after the 'US$' symbol (position 3)
        expect(input.selectionStart).toBe(3);
        expect(input.selectionEnd).toBe(3);
      });
    });

    it('should maintain cursor position after focus event completes', async () => {
      const user = userEvent.setup();

      render(<CurrencyAmountInput {...defaultProps} autoFocus={false} value={100} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Focus the input
      await user.click(input);

      // Wait a bit more to ensure setTimeout in focus handler completes
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Cursor should still be positioned after the currency symbol
      expect(input.selectionStart).toBe(1);
      expect(input.selectionEnd).toBe(1);
    });
  });

  describe('Integration behavior', () => {
    it('should display the correct default value with currency formatting', () => {
      render(<CurrencyAmountInput {...defaultProps} value={123.45} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('$123.45');
    });

    it('should call onChange with numeric value when input changes', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(<CurrencyAmountInput {...defaultProps} onChange={mockOnChange} autoFocus={false} />);

      const input = screen.getByRole('textbox');

      // Type a value
      await user.clear(input);
      await user.type(input, '100.50');

      // onChange should be called with the numeric value
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(100.5);
      });
    });

    it('should handle complex user interaction flow', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(<CurrencyAmountInput {...defaultProps} onChange={mockOnChange} autoFocus={true} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Should auto-focus on mount
      await waitFor(() => {
        expect(input).toHaveFocus();
      });

      // Type a value
      await user.type(input, '250.00');

      // Clear and blur to test zero reset
      await user.clear(input);
      await user.tab();

      // Should reset to zero
      await waitFor(() => {
        expect(input.value).toBe('$0.00');
      });

      // Focus again and check cursor position
      await user.click(input);
      await waitFor(() => {
        expect(input.selectionStart).toBe(1);
      });
    });
  });
});
