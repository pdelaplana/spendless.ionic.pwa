import type { ISpend } from '@/domain/Spend';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import SpendModal from './SpendModal';

export const useSpendModal = (): {
  open: (
    spend: ISpend,
    onSave: (spend: ISpend) => void,
    onDelete: (spendId: string) => void,
    suggestedTags?: string[],
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    spend?: ISpend;
    onSave?: (spend: ISpend) => void;
    onDelete?: (spendId: string) => void;
    suggestedTags?: string[];
  }>();

  const [present, dismiss] = useIonModal(SpendModal, {
    spend: inputs?.spend,
    onSave: inputs?.onSave,
    onDelete: inputs?.onDelete,
    suggestedTags: inputs?.suggestedTags,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (
      spend: ISpend,
      onSave: (spend: ISpend) => void,
      onDelete: (spendId: string) => void,
      suggestedTags?: string[],
    ) => {
      setInputs({
        spend,
        onSave,
        onDelete,
        suggestedTags,
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
