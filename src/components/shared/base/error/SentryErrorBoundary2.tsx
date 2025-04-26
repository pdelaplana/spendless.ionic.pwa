import { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { refreshOutline, warningOutline } from 'ionicons/icons';
import * as Sentry from '@sentry/react';

const SentryErrorBoundary2 = ({ children }: { children: ReactNode }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <>
          <IonCard className='ion-padding'>
            <IonCardHeader>
              <IonIcon icon={warningOutline} color='danger' size='large' />
              <IonCardTitle>Something went wrong</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{error?.toString() || 'An unexpected error occurred'}</p>
              <IonButton expand='block' onClick={resetError} className='ion-margin-top'>
                <IonIcon slot='start' icon={refreshOutline} />
                Try Again
              </IonButton>
            </IonCardContent>
          </IonCard>
        </>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default SentryErrorBoundary2;
