import type { IPeriod } from '@/domain/Period';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import PeriodEditModal from './PeriodEditModal';

export const usePeriodEditModal = (): {
  open: (period: IPeriod, onSave?: (period: Partial<IPeriod>) => void) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    period: IPeriod;
    onSave?: (period: Partial<IPeriod>) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodEditModal, {
    period: inputs?.period,
    onSave: inputs?.onSave,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (period: IPeriod, onSave?: (period: Partial<IPeriod>) => void) => {
      // Ensure we're starting fresh by dismissing any existing modal first
      dismiss();

      setInputs({
        period,
        onSave,
      });

      return new Promise((resolve) => {
        // Small delay to ensure the previous modal is fully dismissed
        setTimeout(() => {
          present({
            onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
              if (ev.detail.role) {
                resolve({ role: ev.detail.role });
              }
            },
          });
        }, 100);
      });
    },
  };
};
