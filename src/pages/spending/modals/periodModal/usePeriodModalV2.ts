import type { IPeriod } from '@/domain/Period';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import PeriodModalV2 from './PeriodModalV2';

export const usePeriodModalV2 = (): {
  open: (
    period?: IPeriod,
    onSave?: (period: Partial<IPeriod>) => void,
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    period?: IPeriod;
    onSave?: (period: Partial<IPeriod>) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodModalV2, {
    period: inputs?.period,
    onSave: inputs?.onSave,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (period?: IPeriod, onSave?: (period: Partial<IPeriod>) => void) => {
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
