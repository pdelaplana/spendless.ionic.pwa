import type { IPeriod } from '@/domain/Period';
import type { ISpend } from '@/domain/Spend';
import type { IWallet } from '@/domain/Wallet';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import PeriodModalV2 from './PeriodModalV2';

export const usePeriodModalV2 = (): {
  open: (
    period?: IPeriod,
    onSave?: (period: Partial<IPeriod>) => void,
    currentWallets?: IWallet[],
    currentRecurringExpenses?: ISpend[],
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    period?: IPeriod;
    currentWallets?: IWallet[];
    currentRecurringExpenses?: ISpend[];
    onSave?: (period: Partial<IPeriod>) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodModalV2, {
    period: inputs?.period,
    currentWallets: inputs?.currentWallets,
    currentRecurringExpenses: inputs?.currentRecurringExpenses,
    onSave: inputs?.onSave,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (
      period?: IPeriod,
      onSave?: (period: Partial<IPeriod>) => void,
      currentWallets?: IWallet[],
      currentRecurringExpenses?: ISpend[],
    ) => {
      setInputs({
        period,
        currentWallets,
        currentRecurringExpenses,
        onSave,
      });
      return new Promise((resolve) => {
        present({
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
