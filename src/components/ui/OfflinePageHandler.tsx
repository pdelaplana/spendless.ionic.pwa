import { IonIcon, IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { cloudOffline, refresh, analytics, home } from 'ionicons/icons';
import React from 'react';
import styled from 'styled-components';
import { useNetworkStatus } from '@/providers/networkStatus/useNetworkStatus';
import { designSystem } from '@/theme/designSystem';
import { Button } from './Button';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${designSystem.spacing.xl};
  min-height: 60vh;
  text-align: center;
`;

const OfflineIcon = styled.div`
  width: 120px;
  height: 120px;
  background: ${designSystem.colors.gray[100]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${designSystem.spacing.xl};
  color: ${designSystem.colors.gray[400]};

  ion-icon {
    font-size: 64px;
  }
`;

const OfflineTitle = styled.h1`
  margin: 0 0 ${designSystem.spacing.md};
  font-size: ${designSystem.typography.fontSize.xl};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
`;

const OfflineDescription = styled.p`
  margin: 0 0 ${designSystem.spacing.xl};
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.secondary};
  line-height: 1.6;
  max-width: 400px;
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.md};
  width: 100%;
  max-width: 300px;
`;

const FeatureList = styled.div`
  margin-top: ${designSystem.spacing.xl};
  padding-top: ${designSystem.spacing.xl};
  border-top: 1px solid ${designSystem.colors.gray[200]};
`;

const FeatureListTitle = styled.h3`
  margin: 0 0 ${designSystem.spacing.lg};
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.lg};
  text-align: left;
`;

const FeatureIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: ${designSystem.colors.primary[100]};
  border-radius: ${designSystem.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${designSystem.colors.primary[500]};
`;

const FeatureContent = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h4`
  margin: 0 0 ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.primary};
`;

const FeatureDescription = styled.p`
  margin: 0;
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  line-height: 1.4;
`;

const StatusIndicator = styled.div<{ isOnline: boolean }>`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  background: ${props => props.isOnline ? designSystem.colors.success : designSystem.colors.gray[100]};
  color: ${props => props.isOnline ? designSystem.colors.text.inverse : designSystem.colors.text.secondary};
  border-radius: ${designSystem.borderRadius.md};
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  margin-bottom: ${designSystem.spacing.lg};
`;

const StatusDot = styled.div<{ isOnline: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isOnline ? designSystem.colors.text.inverse : designSystem.colors.gray[400]};
`;

interface OfflinePageHandlerProps {
  showFullPage?: boolean;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  className?: string;
}

export const OfflinePageHandler: React.FC<OfflinePageHandlerProps> = ({
  showFullPage = false,
  onRetry,
  onNavigateHome,
  className
}) => {
  const { isOnline } = useNetworkStatus();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  // If online and we're not forcing to show the page, don't render
  if (isOnline && !showFullPage) {
    return null;
  }

  const content = (
    <OfflineContainer className={className}>
      <StatusIndicator isOnline={isOnline}>
        <StatusDot isOnline={isOnline} />
        {isOnline ? 'Connection restored' : 'No internet connection'}
      </StatusIndicator>

      <OfflineIcon>
        <IonIcon icon={cloudOffline} />
      </OfflineIcon>

      <OfflineTitle>
        {isOnline ? 'Back Online!' : 'You\'re Offline'}
      </OfflineTitle>

      <OfflineDescription>
        {isOnline
          ? 'Your internet connection has been restored. You can now access all features.'
          : 'Don\'t worry - Spendless works offline too! You can still track your spending and view your data.'
        }
      </OfflineDescription>

      <ActionArea>
        {isOnline ? (
          <Button
            variant="primary"
            startIcon={refresh}
            onClick={handleRetry}
            fullWidth
          >
            Refresh Page
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              startIcon={refresh}
              onClick={handleRetry}
              fullWidth
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              startIcon={home}
              onClick={handleNavigateHome}
              fullWidth
            >
              Go Home
            </Button>
          </>
        )}
      </ActionArea>

      {!isOnline && (
        <FeatureList>
          <FeatureListTitle>What you can do offline:</FeatureListTitle>

          <FeatureItem>
            <FeatureIcon>
              <IonIcon icon={analytics} />
            </FeatureIcon>
            <FeatureContent>
              <FeatureTitle>View Your Data</FeatureTitle>
              <FeatureDescription>
                Browse your spending history, budgets, and financial insights from cached data.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>
              <IonIcon icon={analytics} />
            </FeatureIcon>
            <FeatureContent>
              <FeatureTitle>Track Spending</FeatureTitle>
              <FeatureDescription>
                Add new expenses - they'll sync automatically when you're back online.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>
              <IonIcon icon={analytics} />
            </FeatureIcon>
            <FeatureContent>
              <FeatureTitle>Analyze Trends</FeatureTitle>
              <FeatureDescription>
                Review your spending patterns and budget performance using local data.
              </FeatureDescription>
            </FeatureContent>
          </FeatureItem>
        </FeatureList>
      )}
    </OfflineContainer>
  );

  // Return as full page if requested
  if (showFullPage) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {isOnline ? 'Back Online' : 'Offline Mode'}
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {content}
        </IonContent>
      </IonPage>
    );
  }

  return content;
};

// Hook for handling offline fallbacks
export const useOfflineHandler = () => {
  const { isOnline } = useNetworkStatus();

  const showOfflineFallback = (error?: Error) => {
    // Check if the error is network-related
    const isNetworkError = error?.message?.includes('fetch') ||
                          error?.message?.includes('network') ||
                          error?.message?.includes('ERR_INTERNET_DISCONNECTED') ||
                          !isOnline;

    return isNetworkError;
  };

  const retryWhenOnline = (callback: () => void) => {
    if (isOnline) {
      callback();
    } else {
      // Wait for connection to be restored
      const handleOnline = () => {
        callback();
        window.removeEventListener('online', handleOnline);
      };
      window.addEventListener('online', handleOnline);
    }
  };

  return {
    isOnline,
    showOfflineFallback,
    retryWhenOnline,
  };
};