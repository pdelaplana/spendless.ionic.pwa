import type { IRecurringSpend } from '@/domain/RecurringSpend';
import type { IWallet } from '@/domain/Wallet';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import RecurringSpendModal from './RecurringSpendModal';

export const useRecurringSpendModal = (
  wallets: IWallet[],
): {
  open: (
    recurringSpend: IRecurringSpend,
    onSave: (recurringSpend: IRecurringSpend) => void,
    onDelete: (recurringSpendId: string) => void,
    options?: {
      suggestedTags?: string[];
      currency?: string;
      initialBreakpoint?: number;
      breakpoints?: number[];
    },
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    recurringSpend?: IRecurringSpend;
    onSave?: (recurringSpend: IRecurringSpend) => void;
    onDelete?: (recurringSpendId: string) => void;
    suggestedTags?: string[];
    currency?: string;
  }>();

  const [present, dismiss] = useIonModal(RecurringSpendModal, {
    recurringSpend: inputs?.recurringSpend,
    wallets,
    onSave: inputs?.onSave,
    onDelete: inputs?.onDelete,
    suggestedTags: inputs?.suggestedTags,
    currency: inputs?.currency,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (
      recurringSpend: IRecurringSpend,
      onSave: (recurringSpend: IRecurringSpend) => void,
      onDelete: (recurringSpendId: string) => void,
      options?: {
        suggestedTags?: string[];
        currency?: string;
        initialBreakpoint?: number;
        breakpoints?: number[];
      },
    ) => {
      setInputs({
        recurringSpend,
        onSave,
        onDelete,
        suggestedTags: options?.suggestedTags,
        currency: options?.currency,
      });
      return new Promise((resolve) => {
        present({
          initialBreakpoint: options?.initialBreakpoint,
          breakpoints: options?.breakpoints,
          onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            if (ev.detail.role) {
              resolve({ role: ev.detail.role });
            }
          },
        });
      });
    },
  };
};
