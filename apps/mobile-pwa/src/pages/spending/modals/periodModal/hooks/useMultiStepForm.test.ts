import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMultiStepForm } from './useMultiStepForm';

describe('useMultiStepForm', () => {
  it('should initialize recurringSpendsWalletMapping as an empty object', () => {
    const { result } = renderHook(() => useMultiStepForm());
    expect(result.current.formData.recurringSpendsWalletMapping).toEqual({});
  });

  it('should update recurringSpendsWalletMapping when updateRecurringSpendWalletMapping is called', () => {
    const { result } = renderHook(() => useMultiStepForm());

    act(() => {
      result.current.updateRecurringSpendWalletMapping('spend-1', 'Essentials');
    });

    expect(result.current.formData.recurringSpendsWalletMapping).toEqual({
      'spend-1': 'Essentials',
    });
  });

  it('should preserve existing mappings when a new mapping is added', () => {
    const { result } = renderHook(() => useMultiStepForm());

    act(() => {
      result.current.updateRecurringSpendWalletMapping('spend-1', 'Essentials');
    });

    act(() => {
      result.current.updateRecurringSpendWalletMapping('spend-2', 'Rituals');
    });

    expect(result.current.formData.recurringSpendsWalletMapping).toEqual({
      'spend-1': 'Essentials',
      'spend-2': 'Rituals',
    });
  });

  it('should overwrite mapping for the same recurring spend id if updated again', () => {
    const { result } = renderHook(() => useMultiStepForm());

    act(() => {
      result.current.updateRecurringSpendWalletMapping('spend-1', 'Essentials');
    });

    act(() => {
      result.current.updateRecurringSpendWalletMapping('spend-1', 'Savings');
    });

    expect(result.current.formData.recurringSpendsWalletMapping).toEqual({
      'spend-1': 'Savings',
    });
  });
});
