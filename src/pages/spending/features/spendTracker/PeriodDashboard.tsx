import { IonSpinner } from '@ionic/react';
import type React from 'react';
import { Suspense } from 'react';
import { useHistory } from 'react-router-dom';
import { CenterContainer } from '../../../../components/layouts';
import { Gap } from '../../../../components/shared';
import { useWallet } from '../../../../providers/wallet';
import { ROUTES } from '../../../../routes/routes.constants';
import { GradientBackground } from '../../../../theme';
import { PeriodActionsBar } from '../../components/common/periodActionsBar/PeriodActionsBar';
import { PeriodSwitcher } from '../../components/common/periodSwitcher';
import { ProfileHeader } from '../../components/common/profileHeader';
import { WalletList } from '../../components/common/walletList';

const PeriodDashboard: React.FC = () => {
  const history = useHistory();
  const { selectWallet, wallets } = useWallet();

  const handleWalletClick = async (walletId: string) => {
    // Find the wallet object
    const selectedWallet = wallets.find((w) => w.id === walletId);

    if (selectedWallet) {
      // Update WalletProvider state
      await selectWallet(selectedWallet);

      // Navigate to wallet spending page
      history.push(ROUTES.SPENDING_WALLET);
    }
  };

  return (
    <GradientBackground>
      <CenterContainer>
        <ProfileHeader />
        <PeriodSwitcher />
        <WalletList onWalletClick={handleWalletClick} />
        <PeriodActionsBar />
      </CenterContainer>
    </GradientBackground>
  );
};
export default PeriodDashboard;
