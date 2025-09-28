import type { IWalletSetup } from '@/domain/Wallet';
import { addWeeks } from 'date-fns';
import { useState } from 'react';

export interface PeriodFormData {
  // Step 0: Basics
  goals: string;
  startAt: string;
  endAt: string;

  // Step 1: Wallets
  wallets: Array<{
    id: string; // temporary ID for form management
    name: string;
    spendingLimit: string;
    isDefault: boolean;
  }>;

  // Step 2: Recurring Expenses
  recurringExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    originalDate: Date;
    newDate: Date;
    category: string;
    walletId: string;
  }>;

  // Internal state
  currentStep: 0 | 1 | 2 | 3;
}

const getInitialFormData = (): PeriodFormData => ({
  goals: '',
  startAt: new Date().toISOString().split('T')[0],
  endAt: addWeeks(new Date(), 4).toISOString().split('T')[0],
  wallets: [],
  recurringExpenses: [],
  currentStep: 0,
});

export const useMultiStepForm = (initialData?: Partial<PeriodFormData>) => {
  const [formData, setFormData] = useState<PeriodFormData>(() => ({
    ...getInitialFormData(),
    ...initialData,
  }));

  // Step navigation
  const goToStep = (step: 0 | 1 | 2 | 3) => {
    setFormData((prev) => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    if (formData.currentStep < 3) {
      setFormData((prev) => ({ ...prev, currentStep: (prev.currentStep + 1) as 0 | 1 | 2 | 3 }));
    }
  };

  const prevStep = () => {
    if (formData.currentStep > 0) {
      setFormData((prev) => ({ ...prev, currentStep: (prev.currentStep - 1) as 0 | 1 | 2 | 3 }));
    }
  };

  // Form data updates
  const updateBasics = (data: Pick<PeriodFormData, 'goals' | 'startAt' | 'endAt'>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const updateWallets = (wallets: PeriodFormData['wallets']) => {
    setFormData((prev) => ({ ...prev, wallets }));
  };

  // Wallet management
  const addWallet = (wallet: Omit<PeriodFormData['wallets'][0], 'id' | 'isDefault'>) => {
    const newWallet = {
      ...wallet,
      id: `temp-${Date.now()}-${Math.random()}`,
      isDefault: formData.wallets.length === 0, // First wallet is default
    };

    setFormData((prev) => ({
      ...prev,
      wallets: [...prev.wallets, newWallet],
    }));
  };

  const removeWallet = (walletId: string) => {
    setFormData((prev) => {
      const updatedWallets = prev.wallets.filter((w) => w.id !== walletId);

      // If we removed the default wallet, make the first remaining wallet default
      if (updatedWallets.length > 0 && !updatedWallets.some((w) => w.isDefault)) {
        updatedWallets[0].isDefault = true;
      }

      return { ...prev, wallets: updatedWallets };
    });
  };

  const updateWallet = (walletId: string, updates: Partial<PeriodFormData['wallets'][0]>) => {
    setFormData((prev) => ({
      ...prev,
      wallets: prev.wallets.map((w) => (w.id === walletId ? { ...w, ...updates } : w)),
    }));
  };

  const setDefaultWallet = (walletId: string) => {
    setFormData((prev) => ({
      ...prev,
      wallets: prev.wallets.map((w) => ({
        ...w,
        isDefault: w.id === walletId,
      })),
    }));
  };

  // Recurring expenses management
  const setRecurringExpenses = (expenses: PeriodFormData['recurringExpenses']) => {
    setFormData((prev) => ({ ...prev, recurringExpenses: expenses }));
  };

  const removeRecurringExpense = (expenseId: string) => {
    setFormData((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.filter((e) => e.id !== expenseId),
    }));
  };

  // Validation
  const isStep0Valid = () => {
    // Step 0: Basics validation
    return (
      formData.goals.trim().length >= 3 &&
      formData.startAt &&
      formData.endAt &&
      new Date(formData.endAt) > new Date(formData.startAt)
    );
  };

  const isStep1Valid = () => {
    // Step 1: Wallets validation
    return (
      formData.wallets.length > 0 &&
      formData.wallets.every((w) => w.name.trim() && Number.parseFloat(w.spendingLimit) > 0)
    );
  };

  const isStep2Valid = () => {
    // Step 2: Recurring expenses step is always valid (user can skip/remove all)
    return true;
  };

  const isStep3Valid = () => {
    // Step 3: Review step is always valid (final review)
    return true;
  };

  const canGoNext = () => {
    switch (formData.currentStep) {
      case 0:
        return isStep0Valid();
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      default:
        return false;
    }
  };

  const canGoBack = () => formData.currentStep > 0;

  // Calculated values
  const totalBudget = formData.wallets.reduce(
    (total, wallet) => total + Number.parseFloat(wallet.spendingLimit || '0'),
    0,
  );

  // Convert form data to domain format
  const toPeriodData = () => {
    const walletSetup: IWalletSetup[] = formData.wallets.map((w) => ({
      name: w.name,
      spendingLimit: Number.parseFloat(w.spendingLimit),
      isDefault: w.isDefault,
    }));

    // Generate period name from date range
    const startDate = new Date(formData.startAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endDate = new Date(formData.endAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const periodName = `${startDate} - ${endDate}`;

    return {
      name: periodName,
      goals: formData.goals,
      startAt: new Date(formData.startAt),
      endAt: new Date(formData.endAt),
      walletSetup,
      targetSpend: totalBudget,
      targetSavings: 0, // Could be calculated or set separately
      reflection: '', // Required field, start with empty string
    };
  };

  // Reset form
  const reset = () => {
    setFormData(getInitialFormData());
  };

  return {
    // State
    formData,
    currentStep: formData.currentStep,
    totalBudget,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoBack,

    // Updates
    updateBasics,
    updateWallets,

    // Wallet management
    addWallet,
    removeWallet,
    updateWallet,
    setDefaultWallet,

    // Recurring expenses management
    setRecurringExpenses,
    removeRecurringExpense,

    // Validation
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,

    // Conversion
    toPeriodData,

    // Reset
    reset,
  };
};
