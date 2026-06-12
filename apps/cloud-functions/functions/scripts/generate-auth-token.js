#!/usr/bin/env node

/**
 * Generate a Firebase custom auth token for testing
 * Usage: node generate-auth-token.js <userId> [environment]
 */

const admin = require('firebase-admin');
const path = require('path');

// Get arguments
const userId = process.argv[2];
const environment = process.argv[3] || 'dev';

if (!userId) {
  console.error('Error: User ID is required');
  console.error('Usage: node generate-auth-token.js <userId> [environment]');
  console.error('Example: node generate-auth-token.js user123 dev');
  process.exit(1);
}

// Determine service account path and project ID
let serviceAccountPath;
let projectId;

if (environment === 'dev') {
  serviceAccountPath = path.join(__dirname, '..', 'spendless-dev-firebase-adminsdk.json');
  projectId = 'spendless-dev';
} else if (environment === 'prod') {
  serviceAccountPath = path.join(__dirname, '..', 'spendless-prod-firebase-adminsdk.json');
  projectId = 'spendless-prod';
} else {
  serviceAccountPath = path.join(__dirname, '..', 'spendless-firebase-adminsdk.json');
  projectId = 'spendless-dev';
}

// Check if service account file exists
const fs = require('fs');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: Service account file not found at: ${serviceAccountPath}`);
  console.error('Please download the service account key from Firebase Console');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: projectId,
});

// Generate custom token
admin
  .auth()
  .createCustomToken(userId)
  .then((customToken) => {
    console.log('');
    console.log('========================================');
    console.log('Custom Auth Token Generated');
    console.log('========================================');
    console.log('');
    console.log('User ID:', userId);
    console.log('Environment:', environment);
    console.log('');
    console.log('Token:');
    console.log(customToken);
    console.log('');
    console.log('========================================');
    console.log('');
    console.log('To use this token:');
    console.log('1. Exchange it for an ID token at:');
    console.log(`   https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=<API_KEY>`);
    console.log('2. Or copy it to use in your test scripts');
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error creating custom token:', error);
    process.exit(1);
  });
