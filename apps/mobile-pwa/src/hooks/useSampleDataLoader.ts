/**
 * Hook for loading sample data during user onboarding
 *
 * This hook provides a way to populate a new user's account with realistic demo data
 * including wallets, spending transactions, and period goals.
 */

import type { SpendCategory } from '@/domain/Spend';
import { db } from '@/infrastructure/firebase';
import { Timestamp, collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';

interface SampleWallet {
  name: string;
  spendingLimit: number;
  color: string;
  description: string;
  isDefault: boolean;
}

interface SampleExpense {
  date: string; // YYYY-MM-DD format
  amount: number;
  description: string;
  category: SpendCategory;
  tags: string[];
  notes: string;
  walletName: string;
}

const SAMPLE_WALLETS: SampleWallet[] = [
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
    name: 'Entertainment',
    spendingLimit: 400,
    color: 'orange',
    description: 'Fun and leisure activities',
    isDefault: false,
  },
];

const SAMPLE_EXPENSES: SampleExpense[] = [
  // Personal Spending
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
    description: 'Morning Coffee',
    category: 'rituals',
    tags: ['coffee', 'morning-ritual'],
    notes: 'Starbucks before work',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-10',
    amount: 89.99,
    description: 'Running Shoes',
    category: 'culture',
    tags: ['fitness', 'gear'],
    notes: 'Nike Pegasus 40',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-12',
    amount: 25.0,
    description: 'Haircut',
    category: 'need',
    tags: ['grooming'],
    notes: 'Regular trim',
    walletName: 'Personal Spending',
  },
  {
    date: '2025-01-15',
    amount: 35.0,
    description: 'Books',
    category: 'culture',
    tags: ['reading', 'education'],
    notes: 'Personal development',
    walletName: 'Personal Spending',
  },

  // Groceries
  {
    date: '2025-01-03',
    amount: 145.3,
    description: 'Weekly Groceries',
    category: 'need',
    tags: ['groceries', 'weekly-shop'],
    notes: 'Whole Foods',
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
    date: '2025-01-17',
    amount: 156.4,
    description: 'Weekly Groceries',
    category: 'need',
    tags: ['groceries', 'organic'],
    notes: 'Farmers market',
    walletName: 'Groceries & Household',
  },

  // Entertainment
  {
    date: '2025-01-04',
    amount: 78.5,
    description: 'Dinner with Friends',
    category: 'connections',
    tags: ['dining', 'friends'],
    notes: 'Italian restaurant',
    walletName: 'Entertainment',
  },
  {
    date: '2025-01-08',
    amount: 45.0,
    description: 'Concert Tickets',
    category: 'want',
    tags: ['music', 'concert'],
    notes: 'Local band',
    walletName: 'Entertainment',
  },
  {
    date: '2025-01-14',
    amount: 15.99,
    description: 'Movie Night',
    category: 'want',
    tags: ['movies', 'date-night'],
    notes: 'AMC theater',
    walletName: 'Entertainment',
  },
  {
    date: '2025-01-19',
    amount: 28.5,
    description: 'Brunch',
    category: 'connections',
    tags: ['dining', 'family'],
    notes: 'Sunday brunch',
    walletName: 'Entertainment',
  },
];

interface LoadSampleDataParams {
  accountId: string;
  periodId: string;
}

export function useSampleDataLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: '',
  });

  const loadSampleData = useCallback(async ({ accountId, periodId }: LoadSampleDataParams) => {
    setIsLoading(true);
    setError(null);

    const totalSteps = SAMPLE_WALLETS.length + SAMPLE_EXPENSES.length + 1;
    let currentStep = 0;

    const updateProgress = (message: string) => {
      currentStep++;
      setProgress({ current: currentStep, total: totalSteps, message });
    };

    try {
      updateProgress('Creating wallets...');

      // Step 1: Create wallets
      const walletMap: Record<string, string> = {};

      for (const wallet of SAMPLE_WALLETS) {
        const walletRef = doc(collection(db, `accounts/${accountId}/periods/${periodId}/wallets`));
        const walletId = walletRef.id;

        await setDoc(walletRef, {
          accountId,
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
        updateProgress(`Created wallet: ${wallet.name}`);
      }

      // Step 2: Create spending transactions
      for (const expense of SAMPLE_EXPENSES) {
        const walletId = walletMap[expense.walletName];
        if (!walletId) {
          console.warn(`Wallet not found: ${expense.walletName}`);
          continue;
        }

        const spendRef = doc(collection(db, `accounts/${accountId}/spending`));
        const [year, month, day] = expense.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        await setDoc(spendRef, {
          accountId,
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
        const walletRef = doc(db, `accounts/${accountId}/periods/${periodId}/wallets/${walletId}`);
        const walletSnap = await getDocs(
          collection(db, `accounts/${accountId}/periods/${periodId}/wallets`),
        );
        const currentWallet = walletSnap.docs.find((d) => d.id === walletId);
        const currentBalance = currentWallet?.data()?.currentBalance || 0;

        await updateDoc(walletRef, {
          currentBalance: currentBalance + expense.amount,
          updatedAt: Timestamp.now(),
        });

        updateProgress(`Added transaction: ${expense.description}`);
      }

      updateProgress('Sample data loaded successfully!');

      return {
        success: true,
        walletsCreated: Object.keys(walletMap).length,
        transactionsCreated: SAMPLE_EXPENSES.length,
        walletIds: walletMap,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load sample data');
      setError(error);
      console.error('Error loading sample data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loadSampleData,
    isLoading,
    error,
    progress,
  };
}
