import type { CreatePeriodDTO, IPeriod } from '@/domain/Period';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import PeriodModal from './PeriodModal';

export const usePeriodModal = (): {
  open: (period: CreatePeriodDTO, onSave: (period: IPeriod) => void) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    period?: CreatePeriodDTO;
    onSave?: (period: IPeriod) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodModal, {
    period: inputs?.period,
    onSave: inputs?.onSave,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (period: Omit<IPeriod, 'createdAt' | 'updatedAt'>, onSave: (period: IPeriod) => void) => {
      setInputs({
        period,
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
