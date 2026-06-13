# Implementation Plan: Welcome Email Cloud Function

## Overview
Create a Firestore-triggered Cloud Function that sends a welcome email when a new Account document is created.

## Technical Specifications

### 1. Function Details
- **Name**: `sendWelcomeEmail`
- **Trigger**: Firestore `onDocumentCreated` for `accounts/{userId}` collection
- **Cloud Functions Version**: v2 (following existing pattern in `processJob.ts`)
- **Architecture**: Standalone Firestore trigger (not queued through job system)

### 2. File Structure
```
functions/src/
├── sendWelcomeEmail.ts          (new file - main function)
├── index.ts                      (updated - export new function)
└── __tests__/
    └── sendWelcomeEmail.spec.ts (new file - unit tests)
```

### 3. Dependencies & Imports
**Existing dependencies** (no new packages needed):
- `firebase-functions/v2/firestore` - for `onDocumentCreated`
- `firebase-admin` - for Auth SDK access
- `@sentry/node` - for error tracking
- `./helpers/sendEmail` - for Mailgun integration

### 4. Implementation Logic

#### Main Function Flow:
```
1. Firestore onCreate trigger fires for new Account document
2. Extract userId from document ID (event.params.userId)
3. Fetch user from Firebase Auth using userId
4. Extract email and displayName from Auth user
5. Parse firstName from displayName (split on space, take first part)
6. Load email template from templates/emails/welcome-email.md
7. Replace template variables:
   - {firstName} → extracted first name or "there"
   - {founderName} → "Patrick"
   - {currentYear} → current year (2025)
8. Send email via Mailgun using sendEmailNotification helper
9. Log success/errors to console and Sentry
10. Return null (don't block on email failures)
```

#### Error Handling Strategy:
- **User not found in Auth**: Log warning to Sentry, skip email send
- **Missing email address**: Log warning to Sentry, skip email send
- **Template read failure**: Log error to Sentry, skip email send
- **Mailgun send failure**: Log error to Sentry, skip email send
- **Critical principle**: Email failures must NOT block account creation

### 5. Email Template Processing
**Template variables to replace**:
- `{firstName}` - User's first name or "there"
- `{founderName}` - "Patrick" (hardcoded)
- `{currentYear}` - Dynamic year from `new Date().getFullYear()`

**Template parsing approach**:
- Read markdown file using Node.js `fs.readFileSync`
- Extract subject line from "## Subject Line" section
- Extract body from "## Email Body" section
- Replace all variable placeholders with actual values
- Convert markdown to HTML (simple approach: preserve formatting with line breaks)

### 6. Testing Approach

#### Unit Tests (`sendWelcomeEmail.spec.ts`):
1. **Test: Successful email send**
   - Mock Firebase Auth to return user with displayName "John Doe"
   - Mock sendEmailNotification to succeed
   - Verify email sent with correct recipient and subject
   - Verify firstName extracted correctly ("John")

2. **Test: User with no displayName**
   - Mock Firebase Auth to return user with no displayName
   - Verify email uses "there" as firstName

3. **Test: User not found in Firebase Auth**
   - Mock Firebase Auth to throw error
   - Verify error logged to Sentry
   - Verify function doesn't throw (graceful handling)

4. **Test: Email send failure**
   - Mock sendEmailNotification to fail
   - Verify error logged to Sentry
   - Verify function doesn't throw

5. **Test: Missing email address**
   - Mock Firebase Auth to return user without email
   - Verify error logged to Sentry
   - Verify no email sent

**Testing tools**:
- Jest (already configured)
- `firebase-functions-test` (already installed)
- `jest-mock-extended` (already installed)
- Mock Firestore event using existing test patterns from `deleteAccount.spec.ts`

### 7. Key Functions/Methods

#### `sendWelcomeEmail` (exported function)
```typescript
export const sendWelcomeEmail = onDocumentCreated(
  'accounts/{userId}',
  async (event) => { ... }
);
```

#### Helper: `extractFirstName(displayName: string | null | undefined): string`
- Split displayName on whitespace
- Return first part or "there" if empty/null

#### Helper: `loadEmailTemplate(): { subject: string; body: string }`
- Read welcome-email.md file
- Parse markdown sections
- Return structured template object

#### Helper: `replaceTemplateVariables(template: string, variables: Record<string, string>): string`
- Replace all {variableName} occurrences with actual values
- Return processed template string

### 8. Code Quality Checks
- Run TypeScript compiler (`npm run build`)
- Run linting (`npm run lint`)
- Run unit tests (`npm test`)
- Ensure all tests pass before completion

### 9. Export Configuration
Update `functions/src/index.ts`:
```typescript
export { sendWelcomeEmail } from './sendWelcomeEmail';
```

## Implementation Steps (Sequential)

1. ✅ Create implementation plan (this document)
2. ⏳ Get user approval
3. Create `sendWelcomeEmail.ts` with main function logic
4. Update `index.ts` to export new function
5. Create `__tests__/sendWelcomeEmail.spec.ts` with comprehensive tests
6. Run build, lint, and tests to verify correctness
7. Fix any TypeScript/linting errors that arise
8. Ensure all tests pass

## Success Criteria
- ✅ Function triggers on new Account document creation
- ✅ Fetches user data from Firebase Auth correctly
- ✅ Extracts firstName properly (with fallback)
- ✅ Sends email via Mailgun with correct content
- ✅ Handles all error cases gracefully without throwing
- ✅ Logs errors to Sentry for monitoring
- ✅ All unit tests pass
- ✅ No TypeScript or linting errors
- ✅ Function exported in index.ts

## Notes
- Follow existing code patterns from `processJob.ts` and `deleteAccount.ts`
- Use Sentry spans for performance monitoring (following existing pattern)
- Keep implementation simple and maintainable
- Email template already exists - no need to create it
- Mailgun configuration via environment variables already set up
