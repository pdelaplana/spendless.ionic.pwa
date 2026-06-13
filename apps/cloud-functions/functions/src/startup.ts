import * as fs from 'node:fs';
import * as Sentry from '@sentry/node';
import * as admin from 'firebase-admin';
import { defineString } from 'firebase-functions/params';

export const sentryDsnConfig = defineString('SENTRY_DSN');
export const envConfig = defineString('ENVIRONMENT');

// Initialize Sentry with environment variables when available
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
});

// Initialize Firebase Admin SDK
try {
  // In production/CI environment, use service account from env or file
  if (fs.existsSync('./spendless-firebase-adminsdk.json')) {
    admin.initializeApp({
      credential: admin.credential.cert('./spendless-firebase-adminsdk.json'),
      storageBucket: 'spendless-dev-15971.firebasestorage.app',
    });
  } else {
    // Default initialization for production environment
    admin.initializeApp();
  }
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}
