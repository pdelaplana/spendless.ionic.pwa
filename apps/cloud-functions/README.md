# Spendless Cloud Functions

A serverless backend infrastructure for the Spendless application built on Firebase Cloud Functions.

## Overview

This repository contains Firebase Cloud Functions used by the Spendless Ionic PWA.

### HealthCheck

The HealthCheck function provides a monitoring endpoint to verify the operational status of the Spendless backend services. This HTTP-triggered function performs various checks to ensure:

- Firebase connection is operational
- Database access is functioning correctly
- External APIs (like Mailgun) are accessible
- Background job processing is active

When invoked, it returns a comprehensive health status report with HTTP 200 for healthy systems or appropriate error codes for detected issues.

### QueueJob

The QueueJob function enables asynchronous task processing within the Spendless application. This HTTPS callable function:

- Receives job requests from authenticated users
- Validates job parameters and user permissions
- Prioritizes tasks based on job type and user requirements
- Stores job metadata in Firestore with appropriate status flags
- Returns a job ID for client-side tracking

Supported job types include data exports, notification sending, and data processing operations.

### ProcessJob

The ProcessJob function handles background execution of queued jobs. Triggered by Firestore document creation events, this function:

- Picks up jobs from the queue based on creation time and priority
- Executes job-specific logic based on the job type
- Updates job status throughout the execution lifecycle
- Handles retries for failed jobs with exponential backoff
- Provides detailed logging and error reporting

The function supports various job implementations stored in the jobs/ directory, with the most common being data export operations.

### DeleteAccount

The DeleteAccount function provides a secure way for users to completely remove their accounts and all associated data. This HTTPS callable function:

- Requires proper authentication to ensure only account owners can delete their data
- Systematically removes user data from Firestore collections and subcollections
- Deletes user files from Firebase Storage
- Removes the user's authentication record from Firebase Auth
- Sends a confirmation email upon successful deletion
- Implements comprehensive error handling and logging

This function follows data privacy best practices and ensures that users can exercise their "right to be forgotten" in compliance with privacy regulations.

## Project Structure

```
spendless.cloud.functions/
├── functions/               # Main functions codebase
│   ├── src/                 # TypeScript source code
│   │   ├── helpers/         # Helper utilities
│   │   ├── jobs/            # Background job implementations
│   │   ├── exportData.ts    # Data export functionality
│   │   ├── healthCheck.ts   # System health monitoring
│   │   ├── index.ts         # Functions entry point
│   │   ├── processJob.ts    # Job processor implementation
│   │   ├── queueJob.ts      # Job queuing functionality
│   │   ├── startup.ts       # Initialization code
│   │   └── types.ts         # TypeScript type definitions
│   ├── lib/                 # Compiled JavaScript (generated)
│   ├── package.json         # Dependencies and scripts
│   └── tsconfig.json        # TypeScript configuration
├── biome.json               # Biome linting/formatting config
├── firebase.json            # Firebase configuration
└── README.md                # This documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

### Installation

1. Clone the repository
   ```powershell
   git clone <repository-url>
   cd spendless.cloud.functions
   ```

2. Install dependencies
   ```powershell
   cd functions
   npm install
   ```

3. Set up Firebase configuration
   ```powershell
   firebase login
   firebase use --add
   ```

4. Create a `.env` file in the functions directory with the following variables:
   ```
   SENTRY_DSN=your-sentry-dsn
   ENVIRONMENT=development
   DEBUG_MODE=true
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain
   ```

5. For local development, place your Firebase Admin SDK service account key at:
   ```
   functions/spendless-firebase-adminsdk.json
   ```

### Local Development

```powershell
# Start the Firebase emulators
cd functions
npm run serve

# Build the project in watch mode
npm run build:watch
```

### Testing

The project uses Jest for unit testing, with test files located in `src/__tests__/`.

```powershell
# Run all tests
cd functions
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Deployment

```powershell
# Manual deployment
firebase deploy --only functions

# Or use the npm script
npm run deploy
```

## Available Functions

| Function | Type | Description |
|----------|------|-------------|
| `exportData` | HTTPS Callable | Allows users to export their data |
| `deleteAccount` | HTTPS Callable | Permanently deletes a user account and all associated data |
| `queueJob` | HTTPS Callable | Adds a job to the processing queue |
| `processJob` | Firestore Trigger | Processes jobs from the queue |
| `healthCheck` | HTTP Function | Monitors system health |

## Code Quality

This project uses Biome for code formatting and linting:

```powershell
# Check code quality
npm run biome:check

# Fix formatting issues
npm run biome:fix
```

## Environment Configuration

This project uses Firebase environment configuration for secrets management. The following environment variables are required:

- `SENTRY_DSN`: Data Source Name for Sentry error tracking
- `ENVIRONMENT`: Application environment (development, staging, production)

Additionally, local development can use a `.env` file or the Firebase local emulator configuration.

## Deployment

Deployment is handled through GitHub Actions, which automatically deploys changes to the appropriate environments based on the branch:

- `main` branch → production environment
- `develop` branch → staging environment

Manual deployments can be triggered through the GitHub Actions interface.

## License

This project is proprietary software owned by Spendless Inc.

## Contact

For questions or support, please contact the development team.
