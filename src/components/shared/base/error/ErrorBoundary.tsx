import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { refreshOutline, warningOutline } from 'ionicons/icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // If Sentry is integrated, you could use:
    // Sentry.captureException(error);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
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
          </IonCardContent>
        </IonCard>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
