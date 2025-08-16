import type { IPeriod } from '@/domain/Period';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import PeriodReflectionModal from './PeriodReflectionModal';

export const usePeriodReflectionModal = (): {
  open: (period: IPeriod, onSave: () => void, onDelete: () => void) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    period?: IPeriod;
    onSave?: () => void;
    onDelete?: () => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodReflectionModal, {
    period: inputs?.period,
    onSave: inputs?.onSave,
    onDelete: inputs?.onDelete,

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (period: IPeriod, onSave: () => void, onDelete: () => void) => {
      setInputs({
        period,
        onSave,
        onDelete,
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
