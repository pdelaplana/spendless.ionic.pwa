import type React from 'react';
import LoadingScreen from './LoadingScreen';

interface SuspenseLoadingScreenProps {
  message?: string;
}

const SuspenseLoadingScreen: React.FC<SuspenseLoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  return (
    <LoadingScreen message={message} fullPage={false} logoSize='medium' animationSpeed='fast' />
  );
};

export default SuspenseLoadingScreen;
