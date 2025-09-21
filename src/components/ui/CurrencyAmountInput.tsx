import type { IAccount } from '@/domain/Account';
import { Currency } from '@/domain/Currencies';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { IonInput, IonText } from '@ionic/react';
import { maskitoCaretGuard, maskitoNumberOptionsGenerator } from '@maskito/kit';
import { useMaskito } from '@maskito/react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';

const ProminentAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${designSystem.spacing.lg};
  background: transparent;
  border-radius: ${designSystem.borderRadius.lg};
`;

const AmountLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};

  text-align: left;
`;

const StyledInput = styled.input`
  font-size: 3.5rem;
  color: ${designSystem.colors.primary};
  padding: ${designSystem.spacing.xl} 0px;
  background: transparent;
  border: none;
  outline: none;
  font-weight: 700;
  min-height: 120px;
  width: 100%;
  max-width: 400px;
  font-family: inherit;

  &::placeholder {
    color: ${designSystem.colors.textSecondary};
    opacity: 0.6;
  }

  &:focus {
    outline: none;
  }
`;

interface CurrencyAmountInputProps {
  label?: string;
  placeholder?: string;
  value?: number; // Clean numeric value in dollars (e.g., 129.50)
  onChange?: (value: number) => void; // Clean callback with numeric value
  currency?: Currency; // Currency for formatting (overrides account currency if provided)
  autoFocus?: boolean;
  error?: string;
}

const CurrencyAmountInput = forwardRef<HTMLInputElement, CurrencyAmountInputProps>(
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

    // Create Maskito options for currency input
    const maskitoOptions = useMemo(() => {
      const baseOptions = maskitoNumberOptionsGenerator({
        decimalSeparator: '.',
        thousandSeparator: ',',
        prefix: activeCurrency.symbol,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        min: 0,
        max: 999999.99,
      });

      // Add caret guard to position cursor after the currency symbol
      return {
        ...baseOptions,
        plugins: [
          ...(baseOptions.plugins || []),
          maskitoCaretGuard((value) => {
            // Position cursor after the currency symbol (at first digit position)
            const prefixLength = activeCurrency.symbol.length;
            return [prefixLength, value.length];
          }),
        ],
      };
    }, [activeCurrency.symbol]);

    const maskitoRef = useMaskito({ options: maskitoOptions });
    const internalRef = useRef<HTMLInputElement>(null);

    // State to manage display value
    const [inputValue, setInputValue] = useState('');

    // Merge refs for Maskito and external ref
    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        // Apply Maskito to the node
        maskitoRef(node);

        // Store in internal ref for auto-focus
        if (internalRef.current !== node) {
          internalRef.current = node;
        }

        // Handle external ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && typeof ref === 'object' && 'current' in ref) {
          ref.current = node;
        }
      },
      [maskitoRef, ref],
    );

    // Handle value prop changes
    useEffect(() => {
      if (value !== undefined && value !== 0) {
        const formattedValue = `${activeCurrency.symbol}${value.toFixed(2)}`;
        setInputValue(formattedValue);
      } else {
        setInputValue(`${activeCurrency.symbol}0.00`);
      }
    }, [value, activeCurrency.symbol]);

    // Handle auto-focus
    useEffect(() => {
      if (autoFocus && internalRef.current) {
        const timer = setTimeout(() => {
          internalRef.current?.focus();
          // Also position cursor after currency symbol
          const prefixLength = activeCurrency.symbol.length;
          internalRef.current?.setSelectionRange(prefixLength, prefixLength);
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [autoFocus, activeCurrency.symbol]);

    return (
      <ProminentAmountContainer>
        <AmountLabel>{label}</AmountLabel>
        <StyledInput
          ref={mergedRef}
          type='text'
          inputMode='decimal'
          placeholder={placeholder || `${activeCurrency.symbol}0.00`}
          value={inputValue}
          onChange={(e) => {
            // Update local state
            const maskedValue = e.target.value;
            setInputValue(maskedValue);

            // Let Maskito handle the formatting, just extract the numeric value
            // Remove currency symbol and parse the number
            const numericValue =
              Number.parseFloat(maskedValue.replace(activeCurrency.symbol, '').replace(/,/g, '')) ||
              0;
            onChange?.(numericValue);
          }}
          onFocus={(e) => {
            // Check if the current value is just the default zero amount
            const currentValue = inputValue;
            const numericValue =
              Number.parseFloat(
                currentValue.replace(activeCurrency.symbol, '').replace(/,/g, ''),
              ) || 0;

            // If the value is 0 (no real amount entered), clear the input for fresh typing
            if (numericValue === 0) {
              const newValue = activeCurrency.symbol;
              setInputValue(newValue);
              e.target.value = newValue;
            }

            // Position cursor after the currency symbol when focused
            const prefixLength = activeCurrency.symbol.length;
            // Use setTimeout to ensure the cursor positioning happens after the focus event
            setTimeout(() => {
              e.target.setSelectionRange(prefixLength, prefixLength);
            }, 0);
          }}
          onBlur={(e) => {
            // If user exits with zero amount, reset to formatted 0.00
            const currentValue = inputValue;
            const numericValue =
              Number.parseFloat(
                currentValue.replace(activeCurrency.symbol, '').replace(/,/g, ''),
              ) || 0;

            if (numericValue === 0) {
              // Reset to properly formatted zero
              const formattedZero = `${activeCurrency.symbol}0.00`;
              setInputValue(formattedZero);
              e.target.value = formattedZero;
              onChange?.(0);
            }
          }}
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

CurrencyAmountInput.displayName = 'CurrencyAmountInput';

export default CurrencyAmountInput;
