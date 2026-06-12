import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import { Gap } from '@/components/shared';

interface PeriodReflectionModalProps {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const PeriodReflectionModal: React.FC<PeriodReflectionModalProps> = ({ onDismiss }) => {
  const footer = (
    <CenterContainer>
      <Gap size={'.65rem'} />
    </CenterContainer>
  );

  const checkIfCanDismiss = () => {
    /*
    if (isDirty) {
      showConfirmPrompt({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close this form?',
        onConfirm: () => {
          onDismiss();
        },
        onCancel: () => {
          // Do nothing, keep the modal open
        },
      });
    } else {
      // No changes, dismiss immediately
      onDismiss();
    }
      */
  };

  return (
    <ModalPageLayout footer={footer} onDismiss={checkIfCanDismiss}>
      <CenterContainer>
        <h2>Period Reflection</h2>
        <p>Reflect on your spending habits during this period.</p>
        <Gap size={'1rem'} />
        <p>How did you feel about your spending this period?</p>
      </CenterContainer>
    </ModalPageLayout>
  );
};

export default PeriodReflectionModal;
