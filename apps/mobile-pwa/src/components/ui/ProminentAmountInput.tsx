import type { IAccount } from '@/domain/Account';
import { Currency } from '@/domain/Currencies';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { IonInput, IonText } from '@ionic/react';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const ProminentAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${designSystem.spacing.xl};
  padding: ${designSystem.spacing.lg};
  background: transparent;
  border-radius: ${designSystem.borderRadius.lg};
`;

const AmountLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};
  margin-bottom: ${designSystem.spacing.md};
  text-align: center;
`;

const StyledProminentAmountInput = styled(IonInput)`
  --font-size: 3.5rem;
  --color: ${designSystem.colors.primary};
  --padding-start: ${designSystem.spacing.xl};
  --padding-end: ${designSystem.spacing.xl};
  --padding-top: ${designSystem.spacing.xl};
  --padding-bottom: ${designSystem.spacing.xl};
  --background: transparent;
  text-align: center;
  font-weight: 700;
  min-height: 120px;

  .native-input {
    text-align: center !important;
    font-size: 3.5rem !important;
    font-weight: 700 !important;
    background: transparent !important;
    line-height: 1.2 !important;
    transition: none !important;
  }
`;

interface ProminentAmountInputProps {
  label?: string;
  placeholder?: string;
  value?: number; // Clean numeric value in dollars (e.g., 129.50)
  onChange?: (value: number) => void; // Clean callback with numeric value
  currency?: Currency; // Currency for formatting (overrides account currency if provided)
  autoFocus?: boolean;
  error?: string;
}

const ProminentAmountInput = forwardRef<HTMLIonInputElement, ProminentAmountInputProps>(
  (
    {
      label = 'Transaction Amount',
      placeholder,
      value = 0,
      onChange,
      currency,
      autoFocus = false,
      error,
    },
    ref,
  ) => {
    // Get account context to use preferred currency (safely handle if provider not available)
    let account: IAccount | undefined;
    try {
      const context = useSpendingAccount();
      account = context.account;
    } catch {
      // Component is being used outside of SpendingAccountProvider
      account = undefined;
    }

    // Use provided currency or fall back to account currency, then USD
    const activeCurrency =
      currency ?? Currency.fromCode(account?.currency ?? 'USD') ?? Currency.USD;
    const internalRef = useRef<HTMLIonInputElement>(null);
    const inputRef = ref || internalRef;

    // Internal state for managing display
    const [displayAmount, setDisplayAmount] = useState(`${activeCurrency.symbol}0.00`);
    const [inputValue, setInputValue] = useState('');
    const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Currency formatting functions
    const formatCurrency = useCallback(
      (numericValue: string): string => {
        const number = Number.parseInt(numericValue) || 0;
        const dollars = Math.floor(number / 100);
        const cents = number % 100;
        return `${activeCurrency.symbol}${dollars.toLocaleString()}.${cents.toString().padStart(2, '0')}`;
      },
      [activeCurrency.symbol],
    );

    const parseCurrency = useCallback((formattedValue: string): number => {
      const numericValue = formattedValue.replace(/[^0-9]/g, '');
      const number = Number.parseInt(numericValue) || 0;
      return number / 100;
    }, []);

    // Debounced formatting logic

    const debouncedFormatting = useCallback(
      (numericValue: string) => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
          if (numericValue === '') {
            setDisplayAmount(`${activeCurrency.symbol}0.00`);
            setInputValue('');
            onChange?.(0);
            return;
          }

          const formatted = formatCurrency(numericValue);
          setDisplayAmount(formatted);
          setInputValue(''); // Clear so displayAmount shows
          onChange?.(parseCurrency(formatted));
        }, 1250);
      },
      [activeCurrency.symbol, formatCurrency, parseCurrency, onChange],
    );

    // Handle input changes
    const handleAmountChange = useCallback(
      (e: CustomEvent) => {
        const newInputValue = e.detail.value || '';

        // Extract only numeric characters from the new input
        const numericOnly = newInputValue.replace(/[^0-9]/g, '');

        // Show immediate feedback with currency symbol during typing
        if (numericOnly === '') {
          setInputValue('');
          setDisplayAmount(`${activeCurrency.symbol}0.00`);
        } else {
          setInputValue(`${activeCurrency.symbol}${numericOnly}`);
          setDisplayAmount(''); // Clear so inputValue shows
        }

        // Trigger debounced formatting
        //debouncedFormatting(numericOnly);
      },
      [activeCurrency.symbol],
    );

    // Handle key presses (restrict to numeric only)
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLIonInputElement>) => {
      const key = e.key;
      // Allow: backspace, delete, tab, escape, enter, and numbers only
      if (
        !/[0-9]/.test(key) &&
        ![
          'Backspace',
          'Delete',
          'Tab',
          'Escape',
          'Enter',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
        ].includes(key)
      ) {
        e.preventDefault();
      }
    }, []);

    // Initialize display value from prop
    useEffect(() => {
      if (value !== undefined && value !== 0) {
        const cents = Math.round(value * 100);
        const formatted = formatCurrency(cents.toString());
        setDisplayAmount(formatted);
        setInputValue('');
      } else {
        setDisplayAmount(`${activeCurrency.symbol}0.00`);
        setInputValue('');
      }
    }, [value, activeCurrency.symbol, formatCurrency]);

    // Auto focus logic
    useEffect(() => {
      if (autoFocus && typeof inputRef === 'object' && inputRef?.current) {
        const timer = setTimeout(() => {
          inputRef.current?.setFocus();
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [autoFocus, inputRef]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, []);

    return (
      <ProminentAmountContainer>
        <AmountLabel>{label}</AmountLabel>
        <StyledProminentAmountInput
          ref={inputRef}
          type='text'
          inputmode='numeric'
          pattern='[0-9]*'
          placeholder={placeholder || `${activeCurrency.symbol}0.00`}
          value={inputValue || displayAmount}
          onIonInput={handleAmountChange}
          onKeyDown={handleKeyPress}
        />
        {error && (
          <IonText
            color='danger'
            style={{ marginTop: designSystem.spacing.sm, fontSize: '0.9rem' }}
          >
            {error}
          </IonText>
        )}
      </ProminentAmountContainer>
    );
  },
);

ProminentAmountInput.displayName = 'ProminentAmountInput';

export default ProminentAmountInput;
