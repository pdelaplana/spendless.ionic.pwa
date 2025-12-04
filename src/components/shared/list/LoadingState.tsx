import { designSystem } from '@/theme/designSystem';
import { IonSpinner, IonText } from '@ionic/react';
import styled from 'styled-components';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designSystem.spacing.md};
`;

/**
 * Displays a loading state with spinner and optional message
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ message, className }) => {
  return (
    <LoadingContainer className={className}>
      <IonSpinner name='crescent' />
      {message && (
        <IonText>
          <p style={{ margin: 0 }}>{message}</p>
        </IonText>
      )}
    </LoadingContainer>
  );
};
