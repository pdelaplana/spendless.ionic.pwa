import { CenterContainer, CenterContent } from '@/components/layouts';
import { MutationNotificationHandler } from '@/components/shared';
import type { IPeriod } from '@/domain/Period';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { GradientBackground } from '@/theme/components';
import { IonButton } from '@ionic/react';
import { PeriodSwitcher } from '../../components/common/periodSwitcher';
import { usePeriodModal } from '../../modals/periodModal';

const NoCurrentPeriodView: React.FC = () => {
  const { account, createPeriod, didMutationSucceed, didMutationFail, resetMutationState } =
    useSpendingAccount();
  const { open } = usePeriodModal();

  const handleStartNewPeriod = () => {
    open(
      {
        name: '',
        goals: '',
        targetSpend: 0,
        targetSavings: 0,
        startAt: new Date(),
        endAt: new Date(),
        reflection: '',
      },
      onSavePeriod,
    );
  };

  const onSavePeriod = async (period: IPeriod) => {
    await createPeriod({ data: period });
  };

  return (
    <GradientBackground>
      <MutationNotificationHandler
        didSucceed={didMutationSucceed}
        didFail={didMutationFail}
        onNotified={resetMutationState}
      />
      <CenterContainer>
        <PeriodSwitcher />
        <CenterContent>
          <h1>No Current Period</h1>
          <p>Please create a new period to view your spending.</p>
          <IonButton onClick={handleStartNewPeriod}>Start New Spending Period</IonButton>
        </CenterContent>
      </CenterContainer>
    </GradientBackground>
  );
};

export default NoCurrentPeriodView;
