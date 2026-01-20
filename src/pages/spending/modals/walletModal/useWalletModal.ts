import type { ISpend } from '@/domain/Spend';
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
    currency?: string,
    onDelete?: (walletId: string) => void,
    walletSpending?: ISpend[],
  ) => Promise<{ role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    wallet?: IWallet | null;
    onSave?: (walletData: { name: string; spendingLimit: number; isDefault: boolean }) => void;
    onDelete?: (walletId: string) => void;
    accountId?: string;
    periodId?: string;
    existingWallets?: IWallet[];
    currency?: string;
    walletSpending?: ISpend[];
  }>();

  const [present, dismiss] = useIonModal(WalletModal, {
    wallet: inputs?.wallet,
    onSave: inputs?.onSave,
    onDelete: inputs?.onDelete,
    accountId: inputs?.accountId || '',
    periodId: inputs?.periodId || '',
    existingWallets: inputs?.existingWallets || [],
    currency: inputs?.currency,
    walletSpending: inputs?.walletSpending,
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
      currency?: string,
      onDelete?: (walletId: string) => void,
      walletSpending?: ISpend[],
    ) => {
      setInputs({
        wallet,
        onSave,
        onDelete,
        accountId,
        periodId,
        existingWallets,
        currency,
        walletSpending,
      });
      return new Promise((resolve) => {
        present({
          initialBreakpoint: 0.99,
          breakpoints: [0, 0.5, 0.99],
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
