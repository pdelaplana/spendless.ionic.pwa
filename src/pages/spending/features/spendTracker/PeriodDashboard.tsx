import { IonSpinner, useIonToast } from '@ionic/react';
import type React from 'react';
import { Suspense } from 'react';
import { useHistory } from 'react-router-dom';
import { CenterContainer } from '../../../../components/layouts';
import { Gap } from '../../../../components/shared';
import { SubscriptionRestrictedBanner } from '../../../../components/subscription';
import { IosInstallPrompt } from '../../../../components/ui/IosInstallPrompt';
import { PwaInstallPrompt } from '../../../../components/ui/PwaInstallPrompt';
import { useCreateCheckoutSession } from '../../../../hooks/functions';
import { STRIPE_PRICE_ID_MONTHLY } from '../../../../infrastructure/stripe';
import { useSpendingAccount } from '../../../../providers/spendingAccount';
import { useWallet } from '../../../../providers/wallet';
import { ROUTES } from '../../../../routes/routes.constants';
import { GradientBackground } from '../../../../theme';
import { isIOS } from '../../../../utils/platformDetection';
import AiCheckinCard from '../../components/common/aiCheckinCard';
import InsightsCard from '../../components/common/insightsCard';
import { PeriodActionsBar } from '../../components/common/periodActionsBar/PeriodActionsBar';
import { PeriodSwitcher } from '../../components/common/periodSwitcher';
import { ProfileHeader } from '../../components/common/profileHeader';
import { WalletList } from '../../components/common/walletList';

const PeriodDashboard: React.FC = () => {
  const history = useHistory();
  const { selectWallet, wallets } = useWallet();
  const { isDataRestricted } = useSpendingAccount();
  const [presentToast] = useIonToast();
  const { mutate: createCheckoutSession } = useCreateCheckoutSession();

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

  const handleUpgrade = () => {
    if (!STRIPE_PRICE_ID_MONTHLY) {
      presentToast({
        message: 'Upgrade is currently unavailable. Please try again later.',
        duration: 3000,
        color: 'danger',
      });
      return;
    }

    createCheckoutSession(
      {
        priceId: STRIPE_PRICE_ID_MONTHLY,
        successUrl: `${window.location.origin}${ROUTES.SUBSCRIPTION_SUCCESS}`,
        cancelUrl: `${window.location.origin}${ROUTES.SUBSCRIPTION_CANCEL}`,
      },
      {
        onSuccess: (data) => {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        },
        onError: () => {
          presentToast({
            message: 'Failed to start upgrade process. Please try again.',
            duration: 3000,
            color: 'danger',
          });
        },
      },
    );
  };

  return (
    <GradientBackground>
      <CenterContainer>
        <ProfileHeader />
        {isDataRestricted && <SubscriptionRestrictedBanner onUpgrade={handleUpgrade} />}
        <PeriodSwitcher />
        <AiCheckinCard />
        <InsightsCard />
        <WalletList onWalletClick={handleWalletClick} />

        <PeriodActionsBar />
        {isIOS() ? <IosInstallPrompt /> : <PwaInstallPrompt />}
      </CenterContainer>
    </GradientBackground>
  );
};
export default PeriodDashboard;
