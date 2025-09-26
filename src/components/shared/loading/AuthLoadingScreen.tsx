import type React from 'react';
import LoadingScreen from './LoadingScreen';

const AuthLoadingScreen: React.FC = () => {
  return (
    <LoadingScreen
      message='Verifying authentication...'
      fullPage={true}
      logoSize='large'
      animationSpeed='slow'
    />
  );
};

export default AuthLoadingScreen;
