import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { refreshOutline, warningOutline } from 'ionicons/icons';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface SentryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SentryErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  eventId?: string;
}

class SentryErrorBoundary extends Component<SentryErrorBoundaryProps, SentryErrorBoundaryState> {
  constructor(props: SentryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SentryErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by SentryErrorBoundary:', error, errorInfo);

    // Uncomment when Sentry is installed and configured

    try {
      // Capture error with Sentry and get event ID for user feedback
      import('@sentry/react').then((Sentry) => {
        const eventId = Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });

        this.setState({ eventId });
      });
    } catch (e) {
      console.error('Failed to send error to Sentry:', e);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReportFeedback = (): void => {
    // Uncomment when Sentry is installed and configured

    if (this.state.eventId) {
      import('@sentry/react').then((Sentry) => {
        Sentry.showReportDialog({ eventId: this.state.eventId });
      });
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <IonCard className='ion-padding'>
          <IonCardHeader>
            <IonIcon icon={warningOutline} color='danger' size='large' />
            <IonCardTitle>Something went wrong</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <IonButton expand='block' onClick={this.handleReset} className='ion-margin-top'>
              <IonIcon slot='start' icon={refreshOutline} />
              Try Again
            </IonButton>

            <IonButton
              expand='block'
              fill='outline'
              onClick={this.handleReportFeedback}
              className='ion-margin-top'
            >
              Report Feedback
            </IonButton>
          </IonCardContent>
        </IonCard>
      );
    }

    return this.props.children;
  }
}

export default SentryErrorBoundary;
