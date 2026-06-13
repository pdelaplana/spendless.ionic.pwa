# AI Chat Feature - Testing Guide

This directory contains PowerShell scripts for testing the AI Chat feature. These scripts help you test the AI Chat functionality locally using Firebase emulators or against deployed functions.

## 📋 Prerequisites

Before running the tests, ensure you have:

1. **Firebase CLI** installed globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Node.js and npm** installed (Node 22+ recommended)

3. **Firebase project** configured (for dev/prod testing)

4. **Test data** set up in Firestore (see below)

## 🧪 Available Test Scripts

### 1. `run-all-ai-chat-tests.ps1` - **Comprehensive Test Suite**

Runs all tests including build verification, linting, unit tests, and integration tests.

**Usage:**
```powershell
# Run all tests with emulator (default)
.\scripts\run-all-ai-chat-tests.ps1

# Run with interactive mode (asks before each step)
.\scripts\run-all-ai-chat-tests.ps1 -Interactive

# Run against dev environment
.\scripts\run-all-ai-chat-tests.ps1 -Environment dev

# Custom user ID
.\scripts\run-all-ai-chat-tests.ps1 -UserId "custom-user-123"
```

**What it tests:**
- ✓ Build verification (TypeScript compilation)
- ✓ Code quality (linting)
- ✓ Unit tests (Jest)
- ✓ Integration tests (function calls)

**Parameters:**
- `-Environment` - Target environment: `emulator`, `dev`, or `prod` (default: `emulator`)
- `-UserId` - Test user ID (default: `test-user-123`)
- `-Interactive` - Enable interactive mode with confirmations

---

### 2. `test-ai-chat.ps1` - **AI Chat Function Tests**

Tests the `aiChat` callable function with various scenarios.

**Usage:**
```powershell
# Basic test
.\scripts\test-ai-chat.ps1

# Custom message
.\scripts\test-ai-chat.ps1 -Message "What are my top spending categories?"

# Specific period
.\scripts\test-ai-chat.ps1 -PeriodId "period-123"

# Against dev environment
.\scripts\test-ai-chat.ps1 -Environment dev
```

**Test Cases:**
1. ✓ Basic chat message
2. ✓ Chat with session history
3. ✓ Category-specific question
4. ✓ Error: Empty message
5. ✓ Error: Message too long

**Parameters:**
- `-Environment` - Target environment (default: `emulator`)
- `-UserId` - Test user ID (default: `test-user-123`)
- `-Message` - Message to send (default: "How much have I spent this month?")
- `-PeriodId` - Optional specific period ID

---

### 3. `test-ai-chat-notifications.ps1` - **Notifications Tests**

Tests the `getAiChatNotifications` callable function.

**Usage:**
```powershell
# Basic test
.\scripts\test-ai-chat-notifications.ps1

# Custom limit
.\scripts\test-ai-chat-notifications.ps1 -Limit 20

# Against dev environment
.\scripts\test-ai-chat-notifications.ps1 -Environment dev
```

**Test Cases:**
1. ✓ Get notifications with default limit
2. ✓ Get notifications with custom limit
3. ✓ Error: Limit too high (>100)
4. ✓ Verify notifications marked as read

**Parameters:**
- `-Environment` - Target environment (default: `emulator`)
- `-UserId` - Test user ID (default: `test-user-123`)
- `-Limit` - Number of notifications to retrieve (default: 10)

---

### 4. `test-ai-chat-emulator.ps1` - **Emulator Integration Tests**

Starts the Firebase emulator, runs all tests, then stops the emulator.

**Usage:**
```powershell
# Run all tests with emulator
.\scripts\test-ai-chat-emulator.ps1

# Skip build step
.\scripts\test-ai-chat-emulator.ps1 -SkipBuild

# Keep emulator running after tests
.\scripts\test-ai-chat-emulator.ps1 -KeepEmulatorRunning
```

**What it does:**
1. Builds TypeScript functions
2. Starts Firebase emulator (Functions + Firestore + Auth)
3. Runs AI Chat tests
4. Runs Notifications tests
5. Stops emulator (unless `-KeepEmulatorRunning`)

**Parameters:**
- `-UserId` - Test user ID (default: `test-user-123`)
- `-SkipBuild` - Skip build step
- `-KeepEmulatorRunning` - Don't stop emulator after tests

---

### 5. `create-test-data.ps1` - **Test Data Setup**

Generates test data specifications for the AI Chat feature.

**Usage:**
```powershell
# Generate test data spec
.\scripts\create-test-data.ps1

# For dev environment
.\scripts\create-test-data.ps1 -Environment dev

# Custom user ID
.\scripts\create-test-data.ps1 -UserId "my-test-user"
```

**What it creates:**
- Account document specification
- Period document with budget
- 6 sample spending transactions
- Sample notification

**Note:** This script generates specifications. You need to manually create the documents in Firestore or use the provided Node.js script template.

---

## 🗄️ Setting Up Test Data

### Option 1: Firebase Console (Easiest)

1. Open Firebase Console → Firestore Database
2. Create the following structure:

```
accounts/{userId}
  - userId: "test-user-123"
  - name: "Test User"
  - email: "test@example.com"
  - currency: "USD"
  - subscriptionTier: "premium"
  - aiChatEnabled: true
  - createdAt: <timestamp>

accounts/{userId}/periods/{periodId}
  - name: "January 2025"
  - startAt: <15 days ago>
  - endAt: <15 days from now>
  - targetSpend: 1000
  - targetSavings: 500
  - goals: "Save for vacation"

accounts/{userId}/spending/{auto-id}
  - date: <timestamp>
  - amount: 50.00
  - description: "Grocery shopping"
  - category: "essentials"
  - periodId: {periodId}
  - tags: ["food", "weekly"]
  - recurring: false

accounts/{userId}/aiChatNotifications/{auto-id}
  - userId: "test-user-123"
  - periodId: {periodId}
  - periodName: "January 2025"
  - content: "Test notification content"
  - checkInType: "milestone"
  - createdAt: <timestamp>
  - isRead: false
  - tokensUsed: 150
  - aiModel: "gemini-2.5-flash"
```

### Option 2: Node.js Script (Recommended)

Create a script using Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const userId = 'test-user-123';

async function setupTestData() {
  // Create account
  await db.collection('accounts').doc(userId).set({
    userId: userId,
    name: 'Test User',
    email: 'test@example.com',
    currency: 'USD',
    subscriptionTier: 'premium',
    aiChatEnabled: true,
    aiCheckinEnabled: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  });

  // Create period
  const periodRef = await db.collection('accounts').doc(userId)
    .collection('periods').add({
      name: 'January 2025',
      startAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      ),
      endAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      ),
      targetSpend: 1000,
      targetSavings: 500,
      goals: 'Save for vacation',
      createdAt: admin.firestore.Timestamp.now()
    });

  const periodId = periodRef.id;

  // Create spending transactions
  const spendingRef = db.collection('accounts').doc(userId).collection('spending');

  await spendingRef.add({
    date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
    amount: 50.00,
    description: 'Grocery shopping',
    category: 'essentials',
    periodId: periodId,
    notes: 'Weekly groceries',
    tags: ['food', 'weekly'],
    recurring: false
  });

  // Add more transactions...

  console.log('✓ Test data created successfully!');
  console.log(`Period ID: ${periodId}`);
}

setupTestData().catch(console.error);
```

Run with: `node setupTestData.js`

---

## 🚀 Quick Start

### For Local Testing (Emulator)

```powershell
# 1. Set up test data (one time)
.\scripts\create-test-data.ps1

# 2. Manually create data in Firestore (see above)

# 3. Run comprehensive test suite
.\scripts\run-all-ai-chat-tests.ps1
```

### For Dev Environment Testing

```powershell
# 1. Ensure test data exists in dev Firestore

# 2. Run tests against dev
.\scripts\run-all-ai-chat-tests.ps1 -Environment dev
```

---

## 🔒 Authentication Notes

**Important:** The test scripts currently **do not handle authentication**. The callable functions require authenticated requests.

### For Emulator Testing:
The Firebase emulator allows unauthenticated calls by default during development.

### For Dev/Prod Testing:
You need to:
1. Obtain a Firebase Auth ID token
2. Pass it in the `Authorization` header

Example with authenticated token:
```powershell
$token = "your-firebase-auth-token"
# Modify the test scripts to include:
# $headers["Authorization"] = "Bearer $token"
```

---

## 📊 Expected Results

### Successful Test Run:

```
✓ Build successful
✓ Linting passed
✓ All unit tests passed
✓ AI Chat tests completed
✓ Notifications tests completed

Pass Rate: 100%

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                  ✓ ALL TESTS PASSED! ✓                        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `User must be authenticated` | No auth token | Add authentication or use emulator |
| `Account not found` | Missing test data | Run create-test-data.ps1 and set up Firestore |
| `AI Chat is not enabled` | aiChatEnabled: false | Set aiChatEnabled: true in account |
| `No active period found` | Missing period data | Create period document |
| `Rate limit exceeded` | Too many requests | Wait or reset rate limit document |

---

## 🛠️ Troubleshooting

### Emulator Won't Start

```powershell
# Check if emulator is already running
firebase emulators:list

# Kill existing emulator processes
Get-Process -Name "java" | Stop-Process

# Start fresh
firebase emulators:start --only functions,firestore,auth
```

### Build Failures

```powershell
# Clean and rebuild
cd functions
Remove-Item -Recurse -Force lib
npm run build
```

### Test Data Issues

```powershell
# View Firestore emulator data
# Open: http://127.0.0.1:4000/firestore

# Clear emulator data
firebase emulators:start --import=./emulator-data --export-on-exit
```

---

## 📝 Writing Custom Tests

You can create custom test scripts based on the provided templates:

```powershell
# Example: Test specific user scenario
param([string]$UserId)

$baseUrl = "http://127.0.0.1:5001/spendless-dev/us-central1"

$data = @{
    message = "Show me my spending trends"
    sessionHistory = @()
}

$body = @{ data = $data } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/aiChat" -Method Post -Body $body -ContentType "application/json"

Write-Host "Response: $($response.result.response)"
```

---

## 🔄 CI/CD Integration

To integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Test AI Chat Feature
  run: |
    cd functions
    npm install
    npm run build
    npm test -- --testPathPattern="aiChat"
```

Or using PowerShell in CI:

```yaml
- name: Run AI Chat Tests
  shell: pwsh
  run: |
    ./scripts/run-all-ai-chat-tests.ps1 -Environment emulator
```

---

## 📞 Support

For issues or questions:
1. Check the main README.md in the functions directory
2. Review Firebase Functions documentation
3. Check CloudFunctions logs in Firebase Console

---

**Last Updated:** 2025-01-30
**Version:** 1.0.0
