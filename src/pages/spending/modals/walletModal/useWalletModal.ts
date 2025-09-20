import type { IWallet } from '@/domain/Wallet';
import { useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import WalletModal from './WalletModal';

export const useWalletModal = (): {
  open: (
    wallet: IWallet | null,
    onSave: (walletData: { name: string; spendingLimit: number; isDefault: boolean }) => void,
    accountId: string,
    periodId: string,
    existingWallets?: IWallet[],
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    wallet?: IWallet | null;
    onSave?: (walletData: { name: string; spendingLimit: number; isDefault: boolean }) => void;
    accountId?: string;
    periodId?: string;
    existingWallets?: IWallet[];
  }>();

  const [present, dismiss] = useIonModal(WalletModal, {
    wallet: inputs?.wallet,
    onSave: inputs?.onSave,
    accountId: inputs?.accountId || '',
    periodId: inputs?.periodId || '',
    existingWallets: inputs?.existingWallets || [],
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });

  return {
    open: (
      wallet: IWallet | null,
      onSave: (walletData: { name: string; spendingLimit: number; isDefault: boolean }) => void,
      accountId: string,
      periodId: string,
      existingWallets?: IWallet[],
    ) => {
      setInputs({
        wallet,
        onSave,
        accountId,
        periodId,
        existingWallets,
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
