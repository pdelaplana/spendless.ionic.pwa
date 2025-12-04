import { type IAiInsight, createAiInsight } from '@/domain/AiInsight';
import { type DocumentData, Timestamp } from 'firebase/firestore';

export const ACCOUNTS_COLLECTION = 'accounts';
export const AI_INSIGHTS_SUBCOLLECTION = 'aiInsights';
export const PAGE_SIZE = 10;

// Mapper functions to handle Firestore data conversion
export const mapToFirestore = (insight: IAiInsight): DocumentData => ({
  userId: insight.userId,
  accountId: insight.accountId,
  periodId: insight.periodId,
  periodName: insight.periodName,
  periodStartDate: insight.periodStartDate ? Timestamp.fromDate(insight.periodStartDate) : null,
  periodEndDate: insight.periodEndDate ? Timestamp.fromDate(insight.periodEndDate) : null,
  weekStartDate: insight.weekStartDate ? Timestamp.fromDate(insight.weekStartDate) : null,
  weekEndDate: insight.weekEndDate ? Timestamp.fromDate(insight.weekEndDate) : null,
  analysisType: insight.analysisType,
  totalSpendingAnalyzed: Number(insight.totalSpendingAnalyzed),
  transactionCount: Number(insight.transactionCount),
  categoriesAnalyzed: insight.categoriesAnalyzed || [],
  tagsAnalyzed: insight.tagsAnalyzed || [],
  keyTakeaway: insight.keyTakeaway,
  insights: insight.insights,
  formattedInsights: insight.formattedInsights,
  generatedAt: Timestamp.fromDate(insight.generatedAt),
  emailSentAt: insight.emailSentAt ? Timestamp.fromDate(insight.emailSentAt) : null,
  emailStatus: insight.emailStatus,
  aiModel: insight.aiModel,
  tokensUsed: insight.tokensUsed,
});

export const mapFromFirestore = (id: string, data: DocumentData): IAiInsight => {
  const insight = createAiInsight({
    userId: data.userId,
    accountId: data.accountId,
    periodId: data.periodId,
    periodName: data.periodName,
    periodStartDate: data.periodStartDate?.toDate(),
    periodEndDate: data.periodEndDate?.toDate(),
    weekStartDate: data.weekStartDate?.toDate(),
    weekEndDate: data.weekEndDate?.toDate(),
    analysisType: data.analysisType,
    totalSpendingAnalyzed: Number(data.totalSpendingAnalyzed),
    transactionCount: Number(data.transactionCount),
    categoriesAnalyzed: data.categoriesAnalyzed || [],
    tagsAnalyzed: data.tagsAnalyzed || [],
    keyTakeaway: data.keyTakeaway,
    insights: data.insights,
    formattedInsights: data.formattedInsights || '',
    generatedAt: data.generatedAt?.toDate() || new Date(),
    emailSentAt: data.emailSentAt?.toDate(),
    emailStatus: data.emailStatus || 'pending',
    aiModel: data.aiModel || '',
    tokensUsed: data.tokensUsed,
  });

  return {
    ...insight,
    id,
  };
};
