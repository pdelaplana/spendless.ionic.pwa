/**
 * Load Sample Data into Firestore
 *
 * This script loads demo sample data into Firestore for testing and demonstration purposes.
 *
 * Usage:
 * 1. Set up Firebase Admin SDK credentials
 * 2. Run: npm run load-sample-data [userId]
 *
 * The script will create:
 * - Sample account
 * - Current period (January 2025)
 * - 5 wallets with different budgets
 * - 50+ realistic spending transactions
 * - Period goals
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { type ServiceAccount, cert, initializeApp } from 'firebase-admin/app';
import { Timestamp, getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '.secrets/serviceAccountKey_dev.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account key not found at: ${serviceAccountPath}`);
  console.error('Please download your service account key from Firebase Console:');
  console.error('Project Settings > Service Accounts > Generate New Private Key');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Sample Data Definitions

interface SampleWallet {
  name: string;
  spendingLimit: number;
  color: string;
  description: string;
  isDefault: boolean;
}

interface SampleExpense {
  date: string;
  amount: number;
  description: string;
  category: 'need' | 'want' | 'culture' | 'unexpected' | 'rituals' | 'connections';
  tags: string[];
  notes: string;
  walletName: string;
}

interface SampleGoal {
  title: string;
  description: string;
  targetAmount: number;
  categoryFocus: string;
  tags: string[];
  motivation: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'exceeded';
}

const SAMPLE_WALLETS: SampleWallet[] = [
  {
    name: 'Personal Spending',
    spendingLimit: 800,
    color: 'purple',
    description: 'Day-to-day personal expenses and lifestyle',
    isDefault: true,
  },
  {
    name: 'Groceries & Household',
    spendingLimit: 600,
    color: 'green',
    description: 'Food, cleaning supplies, and household essentials',
    isDefault: false,
  },
  {
    name: 'Entertainment & Dining',
    spendingLimit: 400,
    color: 'orange',
    description: 'Restaurants, movies, concerts, and fun activities',
    isDefault: false,
  },
  {
    name: 'Health & Wellness',
    spendingLimit: 300,
    color: 'blue',
    description: 'Gym, therapy, medications, and self-care',
    isDefault: false,
  },
  {
    name: 'Travel Fund',
    spendingLimit: 500,
    color: 'teal',
    description: 'Saving for trips, weekend getaways, and adventures',
    isDefault: false,
  },
];

const SAMPLE_EXPENSES: SampleExpense[] = [
  // Personal Spending Wallet
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
  {
    date: '2025-01-15',
    amount: 35.0,
    description: 'Book Bundle',
    category: 'culture',
    tags: ['reading', 'education', 'self-improvement'],
    notes: '3 personal development books',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-18',
    amount: 120.0,
    description: 'Therapy Session',
    category: 'culture',
    tags: ['therapy', 'mental-health'],
    notes: 'Weekly session with Dr. Smith',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-20',
    amount: 15.99,
    description: 'Netflix Subscription',
    category: 'rituals',
    tags: ['streaming', 'entertainment'],
    notes: 'Monthly auto-renewal',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-22',
    amount: 8.5,
    description: 'Morning Coffee',
    category: 'rituals',
    tags: ['coffee', 'work'],
    notes: 'Local coffee shop',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-25',
    amount: 65.0,
    description: 'New Headphones',
    category: 'want',
    tags: ['music', 'tech'],
    notes: 'Wireless earbuds upgrade',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-28',
    amount: 50.0,
    description: 'Gas for Car',
    category: 'need',
    tags: ['transportation', 'commute'],
    notes: 'Shell station',
    walletName: 'Personal Spending',
  },

  // Groceries & Household Wallet
  {
    date: '2025-01-03',
    amount: 145.3,
    description: 'Weekly Groceries',
    category: 'need',
    tags: ['groceries', 'weekly-shop'],
    notes: 'Whole Foods - meal prep',
    walletName: 'Groceries & Household',
  },
  {
    date: '2025-01-06',
    amount: 32.5,
    description: 'Cleaning Supplies',
    category: 'need',
    tags: ['household', 'cleaning'],
    notes: 'Target - detergent, paper towels',
    walletName: 'Groceries & Household',
  },
  {
    date: '2025-01-10',
    amount: 127.85,
    description: 'Weekly Groceries',
    category: 'need',
    tags: ['groceries', 'weekly-shop'],
    notes: "Trader Joe's",
    walletName: 'Groceries & Household',
  },
  {
    date: '2025-01-13',
    amount: 18.99,
    description: 'Laundry Detergent',
    category: 'need',
    tags: ['household', 'laundry'],
    notes: 'Costco bulk purchase',
    walletName: 'Groceries & Household',
  },
  {
    date: '2025-01-17',
    amount: 156.4,
    description: 'Weekly Groceries',
    category: 'need',
    tags: ['groceries', 'weekly-shop', 'organic'],
    notes: 'Farmers market + Whole Foods',
    walletName: 'Groceries & Household',
  },
  {
    date: '2025-01-20',
    amount: 24.75,
    description: 'Kitchen Supplies',
    category: 'need',
    tags: ['household', 'kitchen'],
    notes: 'New dish sponges and soap',
    walletName: 'Groceries & Household',
  },
  {
    date: '2025-01-24',
    amount: 98.2,
    description: 'Grocery Run',
    category: 'need',
    tags: ['groceries', 'quick-shop'],
    notes: 'Mid-week restock',
    walletName: 'Groceries & Household',
  },
  {
    date: '2025-01-27',
    amount: 15.5,
    description: 'Fresh Herbs & Veggies',
    category: 'need',
    tags: ['groceries', 'produce', 'healthy'],
    notes: 'Local farmers market',
    walletName: 'Groceries & Household',
  },

  // Entertainment & Dining Wallet
  {
    date: '2025-01-04',
    amount: 78.5,
    description: 'Dinner with Friends',
    category: 'connections',
    tags: ['dining', 'friends', 'italian'],
    notes: 'Amazing pasta place downtown',
    walletName: 'Entertainment & Dining',
  },
  {
    date: '2025-01-08',
    amount: 45.0,
    description: 'Concert Tickets',
    category: 'want',
    tags: ['music', 'live-show', 'concert'],
    notes: 'Local band at The Echo',
    walletName: 'Entertainment & Dining',
  },
  {
    date: '2025-01-11',
    amount: 32.0,
    description: 'Lunch Meeting',
    category: 'connections',
    tags: ['dining', 'networking', 'work'],
    notes: 'Client lunch at bistro',
    walletName: 'Entertainment & Dining',
  },
  {
    date: '2025-01-14',
    amount: 15.99,
    description: 'Movie Night',
    category: 'want',
    tags: ['movies', 'date-night'],
    notes: 'Two tickets at AMC',
    walletName: 'Entertainment & Dining',
  },
  {
    date: '2025-01-16',
    amount: 95.0,
    description: 'Anniversary Dinner',
    category: 'connections',
    tags: ['dining', 'special-occasion', 'anniversary'],
    notes: 'Celebrated 2 years together',
    walletName: 'Entertainment & Dining',
  },
  {
    date: '2025-01-19',
    amount: 28.5,
    description: 'Brunch with Sister',
    category: 'connections',
    tags: ['dining', 'family', 'brunch'],
    notes: 'Catching up over mimosas',
    walletName: 'Entertainment & Dining',
  },
  {
    date: '2025-01-23',
    amount: 18.0,
    description: 'Bar Night',
    category: 'connections',
    tags: ['drinks', 'socializing', 'friends'],
    notes: 'Happy hour with coworkers',
    walletName: 'Entertainment & Dining',
  },
  {
    date: '2025-01-26',
    amount: 42.0,
    description: 'Takeout Pizza',
    category: 'rituals',
    tags: ['dining', 'takeout', 'friday-night'],
    notes: 'Weekly Friday tradition',
    walletName: 'Entertainment & Dining',
  },

  // Health & Wellness Wallet
  {
    date: '2025-01-02',
    amount: 55.0,
    description: 'Gym Membership',
    category: 'culture',
    tags: ['fitness', 'gym', 'monthly'],
    notes: 'Planet Fitness monthly fee',
    walletName: 'Health & Wellness',
  },
  {
    date: '2025-01-05',
    amount: 125.0,
    description: 'Yoga Class Package',
    category: 'culture',
    tags: ['fitness', 'yoga', 'wellness'],
    notes: '10-class pass',
    walletName: 'Health & Wellness',
  },
  {
    date: '2025-01-09',
    amount: 35.0,
    description: 'Vitamins & Supplements',
    category: 'need',
    tags: ['health', 'supplements'],
    notes: 'Monthly vitamin D and omega-3',
    walletName: 'Health & Wellness',
  },
  {
    date: '2025-01-12',
    amount: 20.0,
    description: 'Meditation App',
    category: 'culture',
    tags: ['mental-health', 'meditation', 'mindfulness'],
    notes: 'Headspace annual subscription (monthly portion)',
    walletName: 'Health & Wellness',
  },
  {
    date: '2025-01-16',
    amount: 75.0,
    description: 'Massage Therapy',
    category: 'want',
    tags: ['self-care', 'wellness', 'relaxation'],
    notes: 'Deep tissue massage',
    walletName: 'Health & Wellness',
  },
  {
    date: '2025-01-20',
    amount: 45.0,
    description: 'Chiropractor Visit',
    category: 'need',
    tags: ['health', 'medical', 'back-pain'],
    notes: 'Monthly adjustment',
    walletName: 'Health & Wellness',
  },
  {
    date: '2025-01-24',
    amount: 30.0,
    description: 'Healthy Meal Prep',
    category: 'need',
    tags: ['food', 'health', 'meal-prep'],
    notes: 'Pre-made protein bowls',
    walletName: 'Health & Wellness',
  },
  {
    date: '2025-01-28',
    amount: 15.0,
    description: 'Protein Powder',
    category: 'culture',
    tags: ['fitness', 'nutrition', 'supplements'],
    notes: 'Post-workout shake',
    walletName: 'Health & Wellness',
  },

  // Travel Fund Wallet
  {
    date: '2025-01-06',
    amount: 150.0,
    description: 'Flight Deposit',
    category: 'culture',
    tags: ['travel', 'flights', 'summer-trip'],
    notes: 'Deposit for July Europe trip',
    walletName: 'Travel Fund',
  },
  {
    date: '2025-01-13',
    amount: 75.0,
    description: 'Travel Gear',
    category: 'culture',
    tags: ['travel', 'gear', 'backpack'],
    notes: 'New travel backpack for trip',
    walletName: 'Travel Fund',
  },
  {
    date: '2025-01-20',
    amount: 100.0,
    description: 'Hotel Reservation',
    category: 'culture',
    tags: ['travel', 'accommodation', 'summer-trip'],
    notes: 'Paris hotel deposit',
    walletName: 'Travel Fund',
  },
  {
    date: '2025-01-27',
    amount: 80.0,
    description: 'Travel Guidebooks',
    category: 'culture',
    tags: ['travel', 'planning', 'books'],
    notes: 'Rick Steves Europe guides',
    walletName: 'Travel Fund',
  },
];

const SAMPLE_GOALS: SampleGoal[] = [
  {
    title: 'Reduce Coffee Spending',
    description: 'Cut coffee shop visits from 20/month to 12/month',
    targetAmount: 100,
    categoryFocus: 'rituals',
    tags: ['coffee', 'morning-ritual'],
    motivation: 'Save $50/month = $600/year for travel fund',
    progress: 87.5,
    status: 'on-track',
  },
  {
    title: 'Prioritize Mental Health',
    description: 'Maintain weekly therapy sessions without guilt',
    targetAmount: 480,
    categoryFocus: 'culture',
    tags: ['therapy', 'mental-health'],
    motivation: 'Investing in myself is not optional',
    progress: 360,
    status: 'on-track',
  },
  {
    title: 'Stay Under Grocery Budget',
    description: 'Meal prep more, impulse buy less at grocery store',
    targetAmount: 600,
    categoryFocus: 'need',
    tags: ['groceries', 'meal-prep', 'weekly-shop'],
    motivation: 'Plan meals = save money + eat healthier',
    progress: 619.49,
    status: 'at-risk',
  },
  {
    title: 'Build Travel Fund Consistently',
    description: 'Save at least $400/month toward summer Europe trip',
    targetAmount: 400,
    categoryFocus: 'culture',
    tags: ['travel', 'summer-trip', 'savings'],
    motivation: '3-week Europe trip by July needs $4,800 total',
    progress: 405,
    status: 'exceeded',
  },
  {
    title: 'Reduce Takeout Spending',
    description: 'Cook at home 5 nights/week, limit takeout to 2x/week',
    targetAmount: 80,
    categoryFocus: 'rituals',
    tags: ['takeout', 'dining', 'cooking'],
    motivation: 'Healthier eating + save $100/month',
    progress: 42,
    status: 'on-track',
  },
];

// Helper Functions

/**
 * Generate a random date between start and end dates
 */
function getRandomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Distribute expenses evenly across the period with some randomness
 */
function generateExpenseDates(
  count: number,
  startDate: Date,
  endDate: Date,
): Date[] {
  const dates: Date[] = [];
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Create roughly evenly distributed dates with randomness
  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor((totalDays / count) * i) + Math.floor(Math.random() * (totalDays / count));
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayOffset);
    dates.push(date);
  }

  // Shuffle the dates to add more randomness
  return dates.sort(() => Math.random() - 0.5);
}

async function loadSampleData(userId: string) {
  console.log('🚀 Starting sample data load for user:', userId);

  try {
    // 1. Create Account
    console.log('\n📝 Creating account...');
    const accountRef = db.collection('accounts').doc(userId);
    const accountId = accountRef.id;

    await accountRef.set({
      name: 'Demo Account',
      description: 'Sample account with demo data',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      onboardingCompleted: true,
      onboardingCompletedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Account created:', accountId);

    // 2. Create Period (Current date - 10 days to current date + 30 days)
    console.log('\n📅 Creating period...');
    const periodRef = db.collection(`accounts/${accountId}/periods`).doc();
    const periodId = periodRef.id;

    // Calculate period dates based on current date
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 10);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 20);

    // Calculate total spending limit from wallets
    const totalWalletLimit = SAMPLE_WALLETS.reduce((sum, w) => sum + w.spendingLimit, 0);

    // Format period name with date range
    const periodName = `${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

    await periodRef.set({
      name: periodName,
      goals:
        'Build healthy spending habits and save for summer travel. Focus on meal prep to reduce grocery costs and maintain consistent travel fund contributions.',
      targetSpend: totalWalletLimit,
      targetSavings: 1000,
      startAt: Timestamp.fromDate(startDate),
      endAt: Timestamp.fromDate(endDate),
      reflection: '',
      walletSetup: SAMPLE_WALLETS.map((w) => ({
        name: w.name,
        spendingLimit: w.spendingLimit,
        isDefault: w.isDefault,
      })),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Period created:', periodId);
    console.log(`   Period range: ${startDate.toDateString()} to ${endDate.toDateString()}`);

    // 3. Create Wallets
    console.log('\n💰 Creating wallets...');
    const walletMap: Record<string, string> = {};

    for (const wallet of SAMPLE_WALLETS) {
      const walletRef = db.collection(`accounts/${accountId}/periods/${periodId}/wallets`).doc();
      const walletId = walletRef.id;

      await walletRef.set({
        accountId: accountId,
        periodId: periodId,
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
      console.log(`  ✅ Created wallet: ${wallet.name} (${walletId})`);
    }

    // 4. Create Spending Transactions
    console.log('\n💸 Creating spending transactions...');
    let expenseCount = 0;

    // Generate random dates for all expenses within the period
    const expenseDates = generateExpenseDates(SAMPLE_EXPENSES.length, startDate, endDate);

    for (let i = 0; i < SAMPLE_EXPENSES.length; i++) {
      const expense = SAMPLE_EXPENSES[i];
      const expenseDate = expenseDates[i];

      const walletId = walletMap[expense.walletName];
      if (!walletId) {
        console.warn(`  ⚠️  Wallet not found: ${expense.walletName}`);
        continue;
      }

      const spendRef = db.collection(`accounts/${accountId}/spending`).doc();

      await spendRef.set({
        accountId: accountId,
        periodId: periodId,
        walletId: walletId,
        date: Timestamp.fromDate(expenseDate),
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

      expenseCount++;

      // Update wallet balance
      const currentWallet = await db
        .doc(`accounts/${accountId}/periods/${periodId}/wallets/${walletId}`)
        .get();
      const currentBalance = currentWallet.data()?.currentBalance || 0;
      await db.doc(`accounts/${accountId}/periods/${periodId}/wallets/${walletId}`).update({
        currentBalance: currentBalance + expense.amount,
        updatedAt: Timestamp.now(),
      });
    }
    console.log(`✅ Created ${expenseCount} spending transactions`);

    // 5. Note: Period goals are no longer stored on the period document
    // The domain model expects 'goals' as a string field (description of goals)
    // SAMPLE_GOALS could be stored in a separate collection if needed
    console.log(
      '\n🎯 Period goals prepared (not stored - goals field is a string in domain model)',
    );

    // 6. Summary
    console.log('\n\n🎉 Sample data loaded successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`Account ID: ${accountId}`);
    console.log(`Period ID: ${periodId}`);
    console.log(`Wallets: ${Object.keys(walletMap).length}`);
    console.log(`Transactions: ${expenseCount}`);
    console.log(`Goals: ${SAMPLE_GOALS.length}`);
    console.log('═══════════════════════════════════════');

    // Calculate totals
    console.log('\n💰 Wallet Balances:');
    for (const [walletName, walletId] of Object.entries(walletMap)) {
      const walletDoc = await db
        .doc(`accounts/${accountId}/periods/${periodId}/wallets/${walletId}`)
        .get();
      const walletData = walletDoc.data();
      const balance = walletData?.currentBalance || 0;
      const limit = walletData?.spendingLimit || 0;
      const percentage = ((balance / limit) * 100).toFixed(1);
      const status = balance < limit * 0.8 ? '✅' : balance < limit ? '⚠️' : '❌';
      console.log(`  ${status} ${walletName}: $${balance.toFixed(2)} / $${limit} (${percentage}%)`);
    }

    console.log('\n📊 Category Breakdown:');
    const categoryTotals: Record<string, number> = {};
    for (const expense of SAMPLE_EXPENSES) {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    }
    for (const [category, total] of Object.entries(categoryTotals)) {
      console.log(`  ${category}: $${total.toFixed(2)}`);
    }

    console.log('\n🏷️  Top Tags:');
    const tagCounts: Record<string, number> = {};
    for (const expense of SAMPLE_EXPENSES) {
      for (const tag of expense.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    for (const [tag, count] of topTags) {
      console.log(`  ${tag}: ${count} transactions`);
    }

    return { accountId, periodId };
  } catch (error) {
    console.error('\n❌ Error loading sample data:', error);
    throw error;
  }
}

// Main Execution
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Usage: npm run load-sample-data [userId]');
  console.error('Example: npm run load-sample-data abc123xyz');
  process.exit(1);
}

loadSampleData(userId)
  .then(() => {
    console.log('\n✅ Done! You can now log in with your user account to see the sample data.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to load sample data:', error);
    process.exit(1);
  });
