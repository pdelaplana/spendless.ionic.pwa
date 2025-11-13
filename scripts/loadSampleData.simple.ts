/**
 * Simple Sample Data Loader (No Admin SDK Required)
 *
 * This version uses the Firebase client SDK and can be run from within the app itself.
 * No service account key needed - just authenticate as a user and run this in the browser console
 * or as a utility function in your app.
 *
 * Usage (Browser Console):
 * 1. Log into the app
 * 2. Open DevTools Console
 * 3. Copy and paste this script
 * 4. Run: loadSampleDataSimple()
 */

import { Timestamp, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../src/infrastructure/firebase';

// Sample Data (same as main script)
const SAMPLE_WALLETS = [
  {
    name: 'Personal Spending',
    spendingLimit: 800,
    color: 'purple',
    description: 'Day-to-day personal expenses',
    isDefault: true,
  },
  {
    name: 'Groceries & Household',
    spendingLimit: 600,
    color: 'green',
    description: 'Food and household essentials',
    isDefault: false,
  },
  {
    name: 'Entertainment & Dining',
    spendingLimit: 400,
    color: 'orange',
    description: 'Restaurants and fun',
    isDefault: false,
  },
  {
    name: 'Health & Wellness',
    spendingLimit: 300,
    color: 'blue',
    description: 'Gym, therapy, self-care',
    isDefault: false,
  },
  {
    name: 'Travel Fund',
    spendingLimit: 500,
    color: 'teal',
    description: 'Trips and adventures',
    isDefault: false,
  },
];

const SAMPLE_EXPENSES = [
  {
    date: '2025-01-05',
    amount: 45.0,
    description: 'Monthly Phone Bill',
    category: 'need',
    tags: ['utilities', 'phone'],
    notes: 'AT&T wireless plan',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-07',
    amount: 12.5,
    description: 'Latte & Pastry',
    category: 'rituals',
    tags: ['coffee', 'morning-ritual'],
    notes: 'Starbucks before work',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-10',
    amount: 89.99,
    description: 'New Running Shoes',
    category: 'culture',
    tags: ['fitness', 'running', 'gear'],
    notes: 'Nike Pegasus 40',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-12',
    amount: 25.0,
    description: 'Haircut',
    category: 'need',
    tags: ['grooming', 'self-care'],
    notes: 'Regular monthly trim',
    walletName: 'Personal Spending',
  },
  // Add more expenses as needed...
];

export async function loadSampleDataSimple(userId: string, accountId?: string) {
  console.log('🚀 Starting simple sample data load...');

  try {
    // 1. Create or use existing account
    let finalAccountId = accountId;
    if (!finalAccountId) {
      const accountRef = doc(collection(db, 'accounts'));
      finalAccountId = accountRef.id;

      await setDoc(accountRef, {
        userId,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Account created:', finalAccountId);
    }

    // 2. Create period
    const periodRef = doc(collection(db, `accounts/${finalAccountId}/periods`));
    const periodId = periodRef.id;

    await setDoc(periodRef, {
      accountId: finalAccountId,
      startDate: Timestamp.fromDate(new Date(2025, 0, 1)),
      endDate: Timestamp.fromDate(new Date(2025, 0, 31)),
      isClosed: false,
      recurringSpendingCopied: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Period created:', periodId);

    // 3. Create wallets
    const walletMap: Record<string, string> = {};

    for (const wallet of SAMPLE_WALLETS) {
      const walletRef = doc(
        collection(db, `accounts/${finalAccountId}/periods/${periodId}/wallets`),
      );
      const walletId = walletRef.id;

      await setDoc(walletRef, {
        accountId: finalAccountId,
        periodId,
        name: wallet.name,
        spendingLimit: wallet.spendingLimit,
        color: wallet.color,
        description: wallet.description,
        isDefault: wallet.isDefault,
        currentBalance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      walletMap[wallet.name] = walletId;
      console.log(`✅ Created wallet: ${wallet.name}`);
    }

    // 4. Create spending transactions
    let count = 0;
    for (const expense of SAMPLE_EXPENSES) {
      const walletId = walletMap[expense.walletName];
      if (!walletId) continue;

      const spendRef = doc(collection(db, `accounts/${finalAccountId}/spending`));
      const [year, month, day] = expense.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      await setDoc(spendRef, {
        accountId: finalAccountId,
        periodId,
        walletId,
        date: Timestamp.fromDate(date),
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        tags: expense.tags,
        notes: expense.notes,
        recurring: false,
        emotionalState: 'Neutral',
        satisfactionRating: 0,
        necessityRating: 0,
        personalReflections: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update wallet balance
      const walletRef = doc(
        db,
        `accounts/${finalAccountId}/periods/${periodId}/wallets/${walletId}`,
      );
      const walletDoc = await walletRef.get();
      const currentBalance = walletDoc.data()?.currentBalance || 0;

      await updateDoc(walletRef, {
        currentBalance: currentBalance + expense.amount,
        updatedAt: Timestamp.now(),
      });

      count++;
    }
    console.log(`✅ Created ${count} transactions`);

    console.log('\n🎉 Sample data loaded successfully!');
    console.log('Account ID:', finalAccountId);
    console.log('Period ID:', periodId);

    return { accountId: finalAccountId, periodId };
  } catch (error) {
    console.error('❌ Error loading sample data:', error);
    throw error;
  }
}

// For browser console usage
// biome-ignore lint/suspicious/noExplicitAny: Browser console usage requires global window type extension
(window as any).loadSampleDataSimple = loadSampleDataSimple;

export default loadSampleDataSimple;
