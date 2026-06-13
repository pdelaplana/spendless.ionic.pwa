# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spendless Cloud Functions is a Firebase Cloud Functions backend for the Spendless Ionic PWA application. It handles asynchronous job processing, data exports, account deletions, email notifications, and system health monitoring.

## Development Commands

All commands should be run from the `functions/` directory:

```bash
# Build
npm run build              # Compile TypeScript
npm run build:watch        # Compile in watch mode

# Testing
npm test                   # Run all tests
npm test -- <filename>     # Run specific test file (e.g., npm test -- sendWelcomeEmail)
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report

# Code Quality
npm run lint              # Check code with Biome
npm run lint:fix          # Auto-fix linting issues
npm run biome:fix         # Fix both linting and formatting

# Local Development
npm run serve             # Start Firebase emulators
npm run shell             # Interactive shell for testing functions

# Deployment
npm run deploy            # Deploy to Firebase (use with caution)

# Configuration (Windows)
.\scripts\configure-stripe.ps1  # Configure Stripe for dev/prod environments
```

## Architecture

### Function Types

**HTTPS Callable Functions** (require authentication):
- `exportData` - Allows users to export their data
- `deleteAccount` - Permanently deletes user accounts and all data
- `queueJob` - Adds jobs to the processing queue
- `triggerAiCheckin` - Manually triggers AI spending analysis for premium users
- `createCheckoutSession` - Creates a Stripe Checkout session for premium subscription
- `createCustomerPortalSession` - Creates a Stripe Customer Portal session for subscription management

**HTTP Functions**:
- `healthcheck` - System health monitoring endpoint
- `handleStripeWebhook` - Processes Stripe webhook events for subscription lifecycle management

**Firestore Triggers**:
- `processJob` - Processes jobs from the `jobs/` collection when created
- `sendWelcomeEmail` - Sends welcome email when Account document is created
- `sendPremiumSubscriptionEmail` - Sends email when user upgrades to premium
- `periodEndAiCheckin` - Triggers AI analysis when a spending period ends

**Scheduled Functions**:
- `weeklyAiCheckin` - Runs every Monday to generate AI insights for weekly users
- `cleanupProcessedEvents` - Daily cleanup of old processed webhook events

### Job Processing System

The codebase implements an asynchronous job queue pattern:

1. **Client calls `queueJob`** → Creates a document in Firestore `jobs` collection with status `pending`
2. **Firestore onCreate trigger fires `processJob`** → Picks up the job document
3. **`processJob` routes to job handler** → Based on `jobType` field, calls appropriate handler from `jobs/` directory
4. **Job executes and updates status** → Sets status to `completed` or `failed`

**Job Types** (defined in `types.ts`):
- `exportData` - Export user data to CSV
- `deleteAccount` - Delete user account and all associated data
- `generateAiCheckin` - Generate AI-powered spending insights (premium only)

To add a new job type:
1. Add type to `JobType` union in `types.ts`
2. Create handler in `jobs/` directory
3. Add case to switch statement in `processJob.ts`

### Code Organization

```
functions/src/
├── index.ts              # Entry point - exports all functions
├── startup.ts            # Initialization (Sentry, Firebase Admin)
├── types.ts              # Shared TypeScript types
├── config/               # Configuration modules
│   ├── stripe.ts         # Stripe client initialization
│   └── gemini.ts         # Google Gemini API client initialization
├── helpers/              # Utility functions
│   ├── sendEmail.ts      # Mailgun email helper
│   └── aiInsights.ts     # AI insight generation and formatting
├── jobs/                 # Job handler implementations
│   ├── exportData.ts     # Data export logic
│   ├── deleteAccount.ts  # Account deletion logic
│   └── generateAiCheckin.ts  # AI checkin generation
├── scheduled/            # Scheduled and triggered functions
│   ├── weeklyAiCheckin.ts    # Weekly AI checkin scheduler
│   └── periodEndAiCheckin.ts # Period-end AI checkin trigger
├── stripe/               # Stripe integration functions
│   ├── createCheckoutSession.ts        # Checkout session creation
│   ├── createCustomerPortalSession.ts  # Customer portal creation
│   ├── handleStripeWebhook.ts          # Webhook event processing
│   ├── cleanupProcessedEvents.ts       # Cleanup scheduled function
│   └── helpers.ts                      # Stripe utility functions
├── templates/emails/     # Email templates (markdown)
│   ├── welcome-email.md
│   ├── premium-subscription-email.md
│   └── ai-checkin.md
├── queueJob.ts           # HTTPS callable - queues jobs
├── processJob.ts         # Firestore trigger - processes queued jobs
├── exportData.ts         # HTTPS callable wrapper for exportData job
├── deleteAccount.ts      # HTTPS callable wrapper for deleteAccount job
├── triggerAiCheckin.ts   # HTTPS callable - triggers AI checkin
├── sendWelcomeEmail.ts   # Firestore trigger - sends welcome emails
├── sendPremiumSubscriptionEmail.ts  # Firestore trigger - sends premium email
├── healthCheck.ts        # HTTP function for monitoring
└── __tests__/            # Jest unit tests
```

### Key Patterns

**Authentication Pattern** (HTTPS Callable functions):
```typescript
if (request?.auth === null) {
  throw new HttpsError('unauthenticated', 'User must be authenticated...');
}
const userId = request.auth?.uid;
```

**Sentry Instrumentation**:
All functions wrap their main logic in `Sentry.startSpan()` for performance tracking and error monitoring.

**Error Handling**:
- HTTPS Callable functions throw `HttpsError` for client-facing errors
- Background jobs (Firestore triggers) catch errors, log to Sentry, and return error status without throwing
- Email failures are logged but never block the main operation

**Firestore Data Deletion**:
When deleting data, always remember to:
1. Delete subcollections first (Firestore doesn't cascade delete)
2. Delete nested subcollections (e.g., `periods/{periodId}/wallets`)
3. Delete storage files with appropriate prefix
4. Delete Firebase Auth user record

### Testing Patterns

**Mocking Firebase Admin**:
```typescript
jest.mock('firebase-admin', () => ({
  firestore: jest.fn().mockReturnValue({ collection: jest.fn() }),
  storage: jest.fn().mockReturnValue({ bucket: jest.fn() }),
  auth: jest.fn().mockReturnValue({ getUser: jest.fn() }),
}));
```

**Mocking Sentry**:
```typescript
jest.mock('@sentry/node', () => ({
  default: { startSpan: jest.fn().mockImplementation((_options, fn) => fn()) },
  startSpan: jest.fn().mockImplementation((_options, fn) => fn()),
  captureException: jest.fn(),
}));
```

**Testing Firestore Triggers**:
Create mock events with `params` and `data` fields. Do not use `firebase-functions-test` for creating events as it conflicts with mocked Firebase Admin.

## Environment Variables

Required for local development (create `functions/.env`):
- `SENTRY_DSN` - Sentry error tracking DSN
- `ENVIRONMENT` - Application environment (development/staging/production)
- `MAILGUN_API_KEY` - Mailgun API key
- `MAILGUN_DOMAIN` - Mailgun sending domain
- `GEMINI_API_KEY` - Google Gemini API key for AI Checkin feature

Local development also requires:
- `functions/spendless-firebase-adminsdk.json` - Firebase Admin SDK service account key

## Build Process

The build process compiles TypeScript and copies template files:

```bash
npm run build  # Runs: tsc && npm run copy:templates
```

The `copy:templates` script (`scripts/copy-templates.js`) copies `src/templates/` to `lib/templates/` so that compiled functions can access template files at runtime. This ensures templates are available in the deployed Firebase Functions environment without deploying the entire `src/` directory.

## Email Templates

Email templates are stored in `src/templates/emails/` as Markdown files with special structure:

```markdown
## Subject Line
Email subject with {variables}

## Email Body
Email body content with {variables}

---

## Email Footer
(Optional footer content)
```

During build, templates are copied to `lib/templates/` and accessed at runtime via:
```typescript
const templatePath = path.join(__dirname, 'templates', 'emails', 'welcome-email.md');
```

Template variables are replaced using `replaceTemplateVariables()` helper function. The body is converted from Markdown to HTML using `convertMarkdownToHtml()`.

## Firebase Collections

Key Firestore collections:
- `accounts/{userId}` - User account data
- `accounts/{userId}/periods` - Spending periods
- `accounts/{userId}/periods/{periodId}/wallets` - Wallets within periods
- `accounts/{userId}/spending` - Spending transactions
- `accounts/{userId}/aiInsights` - AI-generated spending insights (premium feature)
- `jobs/{jobId}` - Job queue
- `processedWebhookEvents/{eventId}` - Processed Stripe webhook events (for idempotency)

## Stripe Integration

This project includes Stripe integration for premium subscription management.

### Stripe Functions

**`createCheckoutSession` (HTTPS Callable)**:
- Creates a Stripe Checkout session for users to upgrade to premium
- Input: `{ priceId, successUrl?, cancelUrl? }`
- Output: `{ sessionId, url }`
- Validates price ID against configured monthly/annual prices
- Creates or retrieves Stripe customer
- Prevents multiple active subscriptions

**`createCustomerPortalSession` (HTTPS Callable)**:
- Creates a Stripe Customer Portal session for subscription management
- Input: `{ returnUrl? }`
- Output: `{ url }`
- Allows users to update payment methods, cancel subscriptions, view invoices

**`handleStripeWebhook` (HTTP)**:
- Processes Stripe webhook events
- Verifies webhook signatures for security
- Handles events:
  - `customer.subscription.created` - New subscription created
  - `customer.subscription.updated` - Subscription modified
  - `customer.subscription.deleted` - Subscription canceled/expired
  - `invoice.payment_succeeded` - Payment successful (including renewals)
  - `invoice.payment_failed` - Payment failed
- Updates Firestore account documents with subscription status

### Stripe Code Organization

```
functions/src/
├── config/
│   └── stripe.ts             # Stripe client initialization and configuration
├── stripe/
│   ├── createCheckoutSession.ts       # Checkout session creation
│   ├── createCustomerPortalSession.ts # Customer portal creation
│   ├── handleStripeWebhook.ts         # Webhook event processing
│   └── helpers.ts                     # Stripe utility functions
└── __tests__/stripe/         # Stripe function tests
    ├── createCheckoutSession.spec.ts
    ├── createCustomerPortalSession.spec.ts
    └── handleStripeWebhook.spec.ts
```

### Stripe Helper Functions

Located in `stripe/helpers.ts`:
- `getOrCreateStripeCustomer()` - Get or create Stripe customer for an account
- `getAccountIdByUserId()` - Retrieve account ID from user ID
- `hasActiveSubscription()` - Check if account has active subscription
- `updateAccountSubscription()` - Update account with subscription data
- `downgradeToEssentials()` - Downgrade account to free tier
- `getAccountIdFromStripeCustomer()` - Get account ID from Stripe customer metadata

### Stripe Environment Variables

**Firebase Functions v2 Configuration**

This project uses Firebase Functions v2, which requires environment variables and Cloud Secret Manager instead of the deprecated `functions.config()` API.

**Local Development** (add to `functions/.env`):
```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_ANNUAL="price_..."

# Frontend URL for redirects (optional, defaults to localhost:8100)
FRONTEND_URL="http://localhost:8100"
```

**Production Deployment**:

For production, you must migrate from the deprecated `functions:config` to Cloud Secret Manager:

1. **Set secrets using Cloud Secret Manager** (recommended for sensitive data):
```bash
# Set secret key (will prompt for value)
firebase functions:secrets:set STRIPE_SECRET_KEY --project your-project-id

# Set webhook secret (will prompt for value)
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project your-project-id
```

2. **Set environment variables** for non-sensitive data (price IDs):
```bash
# Via .env.<project-id> file
echo "STRIPE_PRICE_ID_MONTHLY=price_..." >> functions/.env.your-project-id
echo "STRIPE_PRICE_ID_ANNUAL=price_..." >> functions/.env.your-project-id
```

Or set via Firebase Console: Functions > Configuration > Environment Variables

**Migration Script** (Windows PowerShell):

A PowerShell script is available to migrate from the deprecated `functions:config` to v2 secrets:

```powershell
# Migrate both dev and production environments
.\functions\scripts\migrate-to-v2-secrets.ps1

# Migrate only dev
.\functions\scripts\migrate-to-v2-secrets.ps1 -Environment dev

# Migrate only prod
.\functions\scripts\migrate-to-v2-secrets.ps1 -Environment prod
```

The script will:
- Read existing configuration from `functions:config`
- Migrate secrets to Cloud Secret Manager
- Provide instructions for setting environment variables
- Display next steps for cleanup

**⚠️ Important**: The old `functions:config` API will be shut down on December 31, 2025. You must migrate before then.

### Stripe Firestore Schema

The `accounts` collection includes Stripe-related fields:
```typescript
interface Account {
  // Existing fields
  id: string;
  userId: string;
  subscriptionTier: 'essentials' | 'premium';
  expiresAt: Timestamp | null;

  // Stripe fields
  stripeCustomerId?: string;           // Stripe customer ID
  stripeSubscriptionId?: string;       // Current subscription ID
  stripeSubscriptionStatus?: string;   // Subscription status (active, canceled, etc.)
  stripeSubscriptionPaymentFailedAt?: Timestamp;     // Last payment failure timestamp
}
```

### Webhook Configuration

After deploying, configure the webhook endpoint in Stripe Dashboard:
```
https://us-central1-<project-id>.cloudfunctions.net/handleStripeWebhook
```

Events to subscribe to:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

## AI Checkin Integration

This project includes an AI-powered spending analysis feature that generates personalized insights for premium users using Google Gemini API.

### AI Checkin Functions

**`triggerAiCheckin` (HTTPS Callable)**:
- Manually triggers AI Checkin generation for the authenticated user
- Input: `{ periodId?: string, analysisType?: 'weekly' | 'period-end' }`
- Output: `{ success: boolean, message: string, jobId: string }`
- Validates premium subscription with `hasActiveSubscription()`
- Checks if AI Checkin is enabled for the account
- Queues a `generateAiCheckin` job for async processing

**`weeklyAiCheckin` (Scheduled Function)**:
- Runs every Monday at 9:00 AM UTC
- Automatically generates weekly insights for eligible premium users
- Queries accounts with `aiCheckinEnabled: true` and frequency `'weekly'` or `'both'`
- Queues jobs for each eligible user

**`periodEndAiCheckin` (Firestore Trigger)**:
- Listens to `accounts/{userId}/periods/{periodId}` document updates
- Triggers when a period ends (closedAt is set or endAt passes)
- Checks premium status, aiCheckinEnabled, and frequency preference
- Queues AI checkin job for period-end users

**`generateAiCheckin` (Job Handler)**:
- Processes the queued AI checkin job asynchronously
- Fetches spending data, period info, and historical data
- Calls Google Gemini API to generate insights
- Stores results in `accounts/{userId}/aiInsights` subcollection
- Sends email with insights using template
- Updates `lastAiCheckinAt` timestamp

### AI Checkin Code Organization

```
functions/src/
├── config/
│   └── gemini.ts                        # Gemini API client initialization
├── helpers/
│   └── aiInsights.ts                    # AI insight generation and formatting
├── jobs/
│   └── generateAiCheckin.ts             # Job handler for AI checkin
├── scheduled/
│   ├── weeklyAiCheckin.ts               # Weekly scheduled trigger
│   └── periodEndAiCheckin.ts            # Period-end Firestore trigger
├── templates/emails/
│   └── ai-checkin.md                    # Email template for insights
└── triggerAiCheckin.ts                  # HTTPS callable for manual trigger
```

### AI Insight Types

The AI analyzes spending data and generates:

1. **Spending Patterns & Trends**:
   - Overall spending trajectory (increasing, decreasing, stable)
   - Day-of-week or time-based patterns
   - Unusual or one-time large purchases
   - Recurring vs. non-recurring spending distribution

2. **Category Breakdown**:
   - Top spending categories with amounts and percentages
   - Budget performance assessment vs. targets

3. **Tag Analysis** (user-defined tags on spending):
   - Top tags by spending amount
   - Tag trends over time (increasing/decreasing)
   - Tag correlations (tags that frequently appear together)
   - Tag-based budget recommendations

4. **Period Comparison**:
   - Comparison to previous period
   - Improvements and concerns highlighted

5. **Actionable Recommendations**:
   - Specific, personalized suggestions to improve spending habits

### AI Checkin Environment Variables

**Local Development** (add to `functions/.env`):
```bash
# Google Gemini API Configuration
GEMINI_API_KEY="your-gemini-api-key-here"
```

**Production Deployment**:
```bash
# Set secret using Cloud Secret Manager
firebase functions:secrets:set GEMINI_API_KEY --project your-project-id
```

### AI Checkin Firestore Schema

The `accounts` collection includes AI Checkin-related fields:
```typescript
interface Account {
  // Existing fields...

  // AI Checkin feature fields
  aiCheckinEnabled?: boolean;                         // Whether AI Checkin is enabled (enables both weekly and period-end)
  lastAiCheckinAt?: Timestamp | null;                 // Last generation timestamp
}
```

The `aiInsights` subcollection stores generated insights:
```
accounts/{userId}/aiInsights/{insightId}
```

```typescript
interface AiInsight {
  // Metadata
  id: string;
  userId: string;
  accountId: string;

  // Period/Time context
  periodId?: string;
  periodName?: string;
  periodStartDate?: Timestamp;
  periodEndDate?: Timestamp;
  weekStartDate?: Timestamp;
  weekEndDate?: Timestamp;

  // Analysis metadata
  analysisType: 'weekly' | 'period-end';
  totalSpendingAnalyzed: number;
  transactionCount: number;
  categoriesAnalyzed: string[];
  tagsAnalyzed: string[];

  // Structured insights
  insights: AiInsightData;  // Detailed structured data

  // Formatted version (for email)
  formattedInsights: string;  // Markdown-formatted complete insights

  // Status tracking
  generatedAt: Timestamp;
  emailSentAt?: Timestamp;
  emailStatus: 'pending' | 'sent' | 'failed';

  // AI metadata
  aiModel: string;          // e.g., "gemini-1.5-pro"
  tokensUsed?: number;      // API usage tracking
}
```

### AI Checkin Access Control

- **Premium Only**: AI Checkin is available exclusively to premium subscribers
- Validated using `hasActiveSubscription()` helper
- Frontend should check `subscriptionTier === 'premium'` before showing AI Checkin features
- Users can toggle `aiCheckinEnabled` in settings (enables both weekly and period-end insights)

### AI Checkin Job Type

Added to the job processing system:
- Job Type: `'generateAiCheckin'`
- Processed by `processJob` trigger
- Routed to `generateAiCheckin` job handler
- Supports optional `periodId` and `analysisType` parameters

## Node Version

This project requires **Node.js 22** (specified in `package.json` engines field).
