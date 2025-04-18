import { CenterContainer, CenterContent } from '@/components/layouts';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { IonButton } from '@ionic/react';
import { usePeriodModal } from '../../modals/PeriodModal';
import type { IPeriod } from '@/domain/Period';
import { useAppNotifications } from '@/hooks';
import { useEffect } from 'react';
import { MutationNotificationHandler } from '@/components/shared';

const NoCurrentPeriodView: React.FC = () => {
  const { account, createPeriod, didMutationSucceed, didMutationFail, resetMutationState } =
    useSpendingAccount();
  const { open } = usePeriodModal();
  const { showErrorNotification, showNotification } = useAppNotifications();

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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      onSavePeriod,
    );
  };

  const onSavePeriod = async (period: IPeriod) => {
    await createPeriod({ accountId: account?.id ?? '', data: period });
  };

  useEffect(() => {
    if (didMutationFail) {
      // Handle the error here
      console.error('Mutation failed');
      showErrorNotification('An error occurred while saving the record.');
    }
    if (didMutationSucceed) {
      // Handle the success here
      console.log('Mutation succeeded');
      showNotification('Record saved successfully.');
    }
  }, [didMutationFail, didMutationSucceed, showErrorNotification, showNotification]);

  return (
    <>
      <MutationNotificationHandler
        didSucceed={didMutationSucceed}
        didFail={didMutationFail}
        onNotified={resetMutationState}
      />
      <CenterContainer>
        <CenterContent>
          <h1>No Current Period</h1>
          <p>Please create a new period to view your spending.</p>
          <IonButton onClick={handleStartNewPeriod}>Start New Spending Period</IonButton>
        </CenterContent>
      </CenterContainer>
    </>
  );
};

export default NoCurrentPeriodView;
