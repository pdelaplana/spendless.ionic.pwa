import admin from 'firebase-admin';
import type { PeriodInfoForAi, SpendingDataForAi } from './aiInsights';

/**
 * Get the current active period for a user
 */
export async function getCurrentActivePeriod(userId: string): Promise<{
  periodId: string;
  periodData: PeriodInfoForAi;
} | null> {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();

  // Find the current period (one that hasn't been closed and includes current date)
  const periodsSnapshot = await db
    .collection('accounts')
    .doc(userId)
    .collection('periods')
    .where('startAt', '<=', now)
    .where('endAt', '>=', now)
    .limit(1)
    .get();

  if (periodsSnapshot.empty) {
    return null;
  }

  const periodDoc = periodsSnapshot.docs[0];
  const period = periodDoc.data();

  return {
    periodId: periodDoc.id,
    periodData: {
      name: period.name || 'Current Period',
      startDate: period.startAt.toDate(),
      endDate: period.endAt.toDate(),
      targetSpend: period.targetSpend,
      targetSavings: period.targetSavings,
      goals: period.goals,
    },
  };
}

/**
 * Get spending data for a specific period
 */
export async function getSpendingDataForPeriod(
  userId: string,
  periodId: string,
  limit?: number,
): Promise<SpendingDataForAi[]> {
  const db = admin.firestore();

  let query = db
    .collection('accounts')
    .doc(userId)
    .collection('spending')
    .where('periodId', '==', periodId)
    .orderBy('date', 'desc');

  if (limit) {
    query = query.limit(limit);
  }

  const spendingSnapshot = await query.get();

  if (spendingSnapshot.empty) {
    return [];
  }

  return spendingSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      date: data.date.toDate(),
      amount: data.amount || 0,
      description: data.description || '',
      category: data.category || 'unexpected',
      notes: data.notes,
      tags: data.tags || [],
      recurring: data.recurring || false,
    };
  });
}

/**
 * Calculate category breakdown from spending data
 */
export function calculateCategoryBreakdown(
  spendingData: SpendingDataForAi[],
): Array<{ category: string; amount: number; count: number }> {
  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const spending of spendingData) {
    const existing = categoryMap.get(spending.category) || { amount: 0, count: 0 };
    categoryMap.set(spending.category, {
      amount: existing.amount + spending.amount,
      count: existing.count + 1,
    });
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
}

/**
 * Calculate tag analysis from spending data
 */
export function calculateTagAnalysis(
  spendingData: SpendingDataForAi[],
): Array<{ tag: string; amount: number; count: number }> {
  const tagMap = new Map<string, { amount: number; count: number }>();

  for (const spending of spendingData) {
    if (spending.tags && spending.tags.length > 0) {
      for (const tag of spending.tags) {
        const existing = tagMap.get(tag) || { amount: 0, count: 0 };
        tagMap.set(tag, {
          amount: existing.amount + spending.amount,
          count: existing.count + 1,
        });
      }
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, data]) => ({
      tag,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
}

/**
 * Check if message contains specific keywords
 */
export function containsKeywords(message: string, keywords: string[]): boolean {
  const lowerMessage = message.toLowerCase();
  return keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()));
}

/**
 * Smart context selection based on user message
 * Returns what data to include in the prompt
 */
export function selectContextForMessage(message: string): {
  includeRecentSpending: boolean;
  includeCategoryBreakdown: boolean;
  includeTagAnalysis: boolean;
  spendingLimit?: number; // How many recent transactions to include
} {
  const lowerMessage = message.toLowerCase();

  // Keywords for different context types
  const spendingKeywords = [
    'spent',
    'spending',
    'bought',
    'purchased',
    'transaction',
    'recent',
    'today',
    'yesterday',
    'this week',
    'last week',
    'how much',
  ];

  const categoryKeywords = [
    'category',
    'categories',
    'essentials',
    'rewards',
    'rituals',
    'growth',
    'culture',
    'connections',
    'unexpected',
    'need',
    'want',
  ];

  const tagKeywords = ['tag', 'tagged', 'tags'];

  const includeRecentSpending = containsKeywords(lowerMessage, spendingKeywords);
  const includeCategoryBreakdown = containsKeywords(lowerMessage, categoryKeywords);
  const includeTagAnalysis = containsKeywords(lowerMessage, tagKeywords);

  // Determine how many transactions to include
  let spendingLimit: number | undefined;
  if (includeRecentSpending) {
    if (lowerMessage.includes('all') || lowerMessage.includes('everything')) {
      spendingLimit = undefined; // Include all
    } else if (lowerMessage.includes('recent') || lowerMessage.includes('last')) {
      spendingLimit = 20; // Recent transactions
    } else {
      spendingLimit = 50; // Default for spending queries
    }
  }

  return {
    includeRecentSpending,
    includeCategoryBreakdown,
    includeTagAnalysis,
    spendingLimit,
  };
}

/**
 * Estimate token count for a string (rough approximation)
 * ~4 characters per token on average
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
