export type AnalysisType = 'weekly' | 'period-end';
export type EmailStatus = 'pending' | 'sent' | 'failed';
export type TrendType = 'increasing' | 'decreasing' | 'stable';
export type BudgetStatus = 'under' | 'over' | 'on-track';

export interface IPatterns {
  readonly summary?: string;
  readonly trends?: string[];
  readonly unusualSpending?: string[];
  // Legacy fields (kept for backward compatibility)
  readonly overallTrend?: TrendType;
  readonly dayOfWeekPatterns?: string[];
  readonly unusualPurchases?: string[];
  readonly recurringVsNonRecurring?: string;
}

export interface ICategoryInsight {
  readonly category: string;
  readonly amount: number;
  readonly percentage: number;
  readonly budgetStatus?: BudgetStatus;
}

export interface ICategories {
  readonly topCategories: readonly ICategoryInsight[];
  readonly budgetPerformance?: string;
}

export interface ITagInsight {
  readonly tag: string;
  readonly amount: number;
  readonly trend?: TrendType;
}

export interface ITagCorrelation {
  readonly tags: readonly string[];
  readonly totalSpending: number;
  readonly frequency: number;
}

export interface ITagTrend {
  readonly tag: string;
  readonly trend: string;
}

export interface ITags {
  readonly topTags: readonly ITagInsight[];
  readonly tagCorrelations?: readonly ITagCorrelation[];
  readonly budgetRecommendations?: readonly string[];
  readonly tagTrends?: readonly ITagTrend[];
  // Legacy field (kept for backward compatibility)
  readonly recommendations?: readonly string[];
}

export interface IComparison {
  readonly summary?: string;
  readonly previousPeriodSpending?: number;
  readonly changePercentage?: number;
  readonly improvements?: readonly string[];
  readonly concerns?: readonly string[];
}

export interface IAiInsightData {
  readonly patterns: IPatterns;
  readonly categories: ICategories;
  readonly tags?: ITags;
  readonly recommendations: readonly string[];
  readonly comparison?: IComparison;
}

export interface IAiInsight {
  readonly id?: string;
  readonly userId: string;
  readonly accountId: string;

  // Time context
  readonly periodId?: string;
  readonly periodName?: string;
  readonly periodStartDate?: Date;
  readonly periodEndDate?: Date;
  readonly weekStartDate?: Date;
  readonly weekEndDate?: Date;

  // Analysis metadata
  readonly analysisType: AnalysisType;
  readonly totalSpendingAnalyzed: number;
  readonly transactionCount: number;
  readonly categoriesAnalyzed: readonly string[];
  readonly tagsAnalyzed: readonly string[];

  // Key takeaway
  readonly keyTakeaway?: string;

  // Structured insights
  readonly insights: IAiInsightData;
  readonly formattedInsights: string; // Markdown (backup only, not used in UI)

  // Status
  readonly generatedAt: Date;
  readonly emailSentAt?: Date;
  readonly emailStatus: EmailStatus;

  // AI metadata
  readonly aiModel: string;
  readonly tokensUsed?: number;
}

export type CreateAiInsightDTO = Omit<IAiInsight, 'id'>;

export const createAiInsight = (data: Partial<CreateAiInsightDTO>): IAiInsight => ({
  userId: data.userId ?? '',
  accountId: data.accountId ?? '',
  periodId: data.periodId,
  periodName: data.periodName,
  periodStartDate: data.periodStartDate,
  periodEndDate: data.periodEndDate,
  weekStartDate: data.weekStartDate,
  weekEndDate: data.weekEndDate,
  analysisType: data.analysisType ?? 'weekly',
  totalSpendingAnalyzed: Number(data.totalSpendingAnalyzed ?? 0),
  transactionCount: Number(data.transactionCount ?? 0),
  categoriesAnalyzed: data.categoriesAnalyzed ?? [],
  tagsAnalyzed: data.tagsAnalyzed ?? [],
  keyTakeaway: data.keyTakeaway,
  insights: data.insights ?? {
    patterns: {},
    categories: {
      topCategories: [],
    },
    recommendations: [],
  },
  formattedInsights: data.formattedInsights ?? '',
  generatedAt: data.generatedAt ?? new Date(),
  emailSentAt: data.emailSentAt,
  emailStatus: data.emailStatus ?? 'pending',
  aiModel: data.aiModel ?? '',
  tokensUsed: data.tokensUsed,
});

export const createEmptyAiInsight = (): IAiInsight => createAiInsight({});
