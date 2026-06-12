import { type ReactNode, useEffect, useState } from 'react';
import { NetworkStatusContext } from './context';

export const NetworkStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing] = useState(false);
  const [hasPendingWrites] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Application is online - Firestore will auto-sync pending writes');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Application is offline - writes will be queued locally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, isSyncing, hasPendingWrites }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};
