# Loading Sample Data into Firestore

This guide explains how to load demo sample data into your Firestore database for testing and demonstration purposes.

## Prerequisites

1. **Firebase Admin SDK Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to **Project Settings > Service Accounts**
   - Click **Generate New Private Key**
   - Save the JSON file as `serviceAccountKey.json` in the project root
   - ⚠️ **Important:** Add `serviceAccountKey.json` to `.gitignore` (already done)

2. **Firebase Admin SDK Package**
   ```bash
   npm install firebase-admin --save-dev
   ```

3. **TypeScript execution tool (tsx or ts-node)**
   ```bash
   npm install tsx --save-dev
   ```

---

## Quick Start

### 1. Add NPM Script

Add this script to your `package.json`:

```json
{
  "scripts": {
    "load-sample-data": "tsx scripts/loadSampleData.ts"
  }
}
```

### 2. Get Your User ID

You need your Firebase Auth user ID. You can find it by:

**Option A: Firebase Console**
- Go to Firebase Console > Authentication > Users
- Copy your User UID

**Option B: Browser DevTools**
- Log into the app
- Open DevTools Console
- Run: `firebase.auth().currentUser.uid`

**Option C: From App Code**
- Add a console.log in your app:
  ```typescript
  console.log('User ID:', auth.currentUser?.uid);
  ```

### 3. Run the Script

```bash
npm run load-sample-data YOUR_USER_ID_HERE
```

Example:
```bash
npm run load-sample-data abc123xyz789
```

---

## What Gets Created

The script creates a complete demo dataset:

### 📦 Account
- 1 account linked to your user ID
- Currency: USD
- Date Format: MM/DD/YYYY

### 📅 Period
- January 2025 (Monthly period)
- Start: January 1, 2025
- End: January 31, 2025
- Status: Open (not closed)

### 💰 5 Wallets
1. **Personal Spending** ($800 budget) - Default wallet
2. **Groceries & Household** ($600 budget)
3. **Entertainment & Dining** ($400 budget)
4. **Health & Wellness** ($300 budget)
5. **Travel Fund** ($500 budget)

### 💸 40+ Spending Transactions
- Realistic dates throughout January 2025
- Variety of amounts ($5 - $150)
- All 6 mindful categories represented
- 60+ unique tags (coffee, fitness, travel, dining, etc.)
- Detailed descriptions and notes

### 🎯 5 Period Goals
1. **Reduce Coffee Spending** - Target: $100
2. **Prioritize Mental Health** - Target: $480
3. **Stay Under Grocery Budget** - Target: $600
4. **Build Travel Fund** - Target: $400
5. **Reduce Takeout Spending** - Target: $80

---

## Script Output

When successful, you'll see output like:

```
🚀 Starting sample data load for user: abc123xyz

📝 Creating account...
✅ Account created: xyz789abc

📅 Creating period...
✅ Period created: period123

💰 Creating wallets...
  ✅ Created wallet: Personal Spending (wallet1)
  ✅ Created wallet: Groceries & Household (wallet2)
  ✅ Created wallet: Entertainment & Dining (wallet3)
  ✅ Created wallet: Health & Wellness (wallet4)
  ✅ Created wallet: Travel Fund (wallet5)

💸 Creating spending transactions...
✅ Created 40 spending transactions

🎯 Creating period goals...
✅ Created 5 period goals

🎉 Sample data loaded successfully!
═══════════════════════════════════════
Account ID: xyz789abc
Period ID: period123
Wallets: 5
Transactions: 40
Goals: 5
═══════════════════════════════════════

💰 Wallet Balances:
  ✅ Personal Spending: $467.98 / $800 (58.5%)
  ⚠️  Groceries & Household: $619.49 / $600 (103.2%)
  ✅ Entertainment & Dining: $354.99 / $400 (88.7%)
  ⚠️  Health & Wellness: $400.00 / $300 (133.3%)
  ✅ Travel Fund: $405.00 / $500 (81.0%)

📊 Category Breakdown:
  need: $892.49
  rituals: $106.99
  culture: $794.99
  want: $243.99
  connections: $298.00

🏷️  Top Tags:
  groceries: 5 transactions
  coffee: 3 transactions
  fitness: 3 transactions
  dining: 4 transactions
  ...

✅ Done! You can now log in with your user account to see the sample data.
```

---

## Troubleshooting

### Error: Service account key not found

**Problem:**
```
❌ Service account key not found at: ./serviceAccountKey.json
```

**Solution:**
1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Or set custom path:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/key.json npm run load-sample-data YOUR_USER_ID
   ```

---

### Error: Permission denied

**Problem:**
```
Error: Missing or insufficient permissions
```

**Solution:**
- Ensure your Firebase project has Firestore enabled
- Check that your service account has proper permissions
- In Firebase Console > IAM & Admin, verify service account has "Cloud Datastore User" or "Firebase Admin" role

---

### Error: User ID not provided

**Problem:**
```
❌ Usage: npm run load-sample-data [userId]
```

**Solution:**
Provide your Firebase Auth user ID:
```bash
npm run load-sample-data YOUR_ACTUAL_USER_ID
```

---

### Error: Account already exists

**Problem:** You already have data for this user

**Solution:**
1. Delete existing data from Firestore (via Firebase Console)
2. Or use a different test user account
3. Or modify the script to handle existing data

---

## Advanced Usage

### Custom Data Path

Set a custom path for the service account key:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/custom/path/key.json npm run load-sample-data abc123
```

### Load for Multiple Users

Create a batch script to load data for multiple test users:

```bash
#!/bin/bash
npm run load-sample-data user1-id
npm run load-sample-data user2-id
npm run load-sample-data user3-id
```

### Modify Sample Data

Edit `scripts/loadSampleData.ts` to customize:

- **SAMPLE_WALLETS** - Add/remove wallets, change budgets
- **SAMPLE_EXPENSES** - Add/remove transactions, change amounts
- **SAMPLE_GOALS** - Modify period goals

Then run the script again with a new user ID.

---

## Cleaning Up Sample Data

To remove sample data:

### Option 1: Firebase Console (Manual)
1. Go to Firebase Console > Firestore Database
2. Navigate to `accounts` collection
3. Find and delete the account document

### Option 2: Script (Automated - Future)
We can create a cleanup script if needed:
```bash
npm run cleanup-sample-data ACCOUNT_ID
```

---

## Sample Data Structure

### Firestore Collections

```
accounts/{accountId}
  - userId: string
  - currency: string
  - dateFormat: string
  - createdAt: timestamp
  - updatedAt: timestamp

  /periods/{periodId}
    - accountId: string
    - startDate: timestamp
    - endDate: timestamp
    - isClosed: boolean
    - goals: array
    - createdAt: timestamp
    - updatedAt: timestamp

    /wallets/{walletId}
      - accountId: string
      - periodId: string
      - name: string
      - spendingLimit: number
      - currentBalance: number
      - color: string
      - description: string
      - isDefault: boolean
      - createdAt: timestamp
      - updatedAt: timestamp

  /spending/{spendId}
    - accountId: string
    - periodId: string
    - walletId: string
    - date: timestamp
    - amount: number
    - description: string
    - category: string
    - tags: array
    - notes: string
    - recurring: boolean
    - createdAt: timestamp
    - updatedAt: timestamp
```

---

## Use Cases

### 1. Demo Presentations
Load sample data before showing the app to potential users or investors.

### 2. Testing
Populate Firestore with realistic data for manual or automated testing.

### 3. Development
Quickly set up a working environment without manual data entry.

### 4. Screenshots & Marketing
Create consistent, polished data for marketing materials.

### 5. User Onboarding Testing
Test the user experience with pre-populated data.

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `serviceAccountKey.json`**
   - Already in `.gitignore`
   - If accidentally committed, revoke the key immediately in Firebase Console

2. **Service Account Permissions**
   - Use principle of least privilege
   - Consider creating a separate service account just for data loading

3. **Production Usage**
   - This script is intended for **development/testing only**
   - Do not run against production Firestore without careful review
   - Consider environment checks to prevent accidental production runs

4. **Data Privacy**
   - Sample data is fictitious
   - Do not use real personal or financial information

---

## Next Steps

After loading sample data:

1. **Log into the app** with your user account
2. **Verify all data** appears correctly
3. **Test features** with realistic data
4. **Create demos** or screenshots
5. **Develop against** the sample dataset

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Firebase Console for error messages
3. Check Firestore security rules
4. Verify service account permissions

---

**Last Updated:** January 2025
**Script Location:** `scripts/loadSampleData.ts`
**Sample Data Reference:** `docs/DEMO_SAMPLE_DATA.md`