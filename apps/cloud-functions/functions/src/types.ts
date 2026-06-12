import type { Timestamp } from 'firebase-admin/firestore';

export type JobType =
  | 'exportData'
  | 'deleteAccount'
  | 'generateAiCheckin'
  | 'anotherJobType'
  | 'anotherJobType2';

export type Job = {
  userId: string;
  userEmail: string;
  jobType: JobType;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: number;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
  errors: string[];
  attempts: number;
  // Optional task-specific fields
  periodId?: string; // For generateAiCheckin with period-end analysis
  analysisType?: 'weekly' | 'period-end'; // For generateAiCheckin
  date?: string; // For generateAiCheckin with weekly analysis (ISO string)
};

// Stripe-related types

export type SubscriptionTier = 'essentials' | 'premium';

export type StripeSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Account {
  id: string;
  userId: string;
  name: string;
  currency: string;
  subscriptionTier: SubscriptionTier;
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Stripe-related fields
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: StripeSubscriptionStatus;
  stripeCancelAtPeriodEnd?: boolean; // Whether subscription is scheduled to cancel at period end
  subscriptionCancelled?: boolean; // Whether subscription has been cancelled (scheduled or immediate)
  stripeSubscriptionLastEvent?: number; // Unix timestamp of last processed subscription event (for ordering)
  stripeSubscriptionPaid?: boolean;
  stripeSubscriptionPayment?: number; // Amount paid in last successful payment (in cents)
  stripeSubscriptionPaymentFailedAt?: Timestamp | null;
  // AI Checkin feature fields
  aiCheckinEnabled?: boolean; // Whether AI Checkin feature is enabled (enables both weekly and period-end)
  lastAiCheckinAt?: Timestamp | null; // Last time AI checkin was generated
  // AI Chat feature fields
  aiChatEnabled?: boolean; // Whether AI Chat feature is enabled (enables both chat and notifications)
}

// Stripe function input/output types

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CreateCustomerPortalSessionRequest {
  returnUrl?: string;
}

export interface CreateCustomerPortalSessionResponse {
  url: string;
}

// Stripe webhook event types
export type StripeWebhookEventType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed';

// Extended Stripe types for properties not in current type definitions
export interface StripeInvoiceExtended {
  subscription: string | null;
}

// Processed webhook event tracking for idempotency
export interface ProcessedWebhookEvent {
  eventId: string;
  eventType: string;
  processedAt: Timestamp;
}

// AI Checkin types

export type AiCheckinAnalysisType = 'weekly' | 'period-end';
export type EmailStatus = 'pending' | 'sent' | 'failed';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface TopCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface TopTag {
  tag: string;
  totalSpending: number;
  transactionCount: number;
  percentage: number;
}

export interface TagTrend {
  tag: string;
  trend: TrendDirection;
  changePercentage: number;
}

export interface TagCorrelation {
  tags: string[];
  frequency: number;
  totalSpending: number;
}

export interface AiInsightData {
  keyTakeaway: string; // Personal text message from financial coach
  patterns: {
    summary: string;
    trends: string[];
    unusualSpending?: string[];
  };
  categories: {
    topCategories: TopCategory[];
    budgetPerformance?: string;
  };
  comparison?: {
    summary: string;
    improvements?: string[];
    concerns?: string[];
  };
  tags: {
    topTags: TopTag[];
    tagTrends?: TagTrend[];
    tagCorrelations?: TagCorrelation[];
    budgetRecommendations?: string[];
  };
  recommendations: string[];
}

export interface AiInsight {
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
  analysisType: AiCheckinAnalysisType;
  totalSpendingAnalyzed: number;
  transactionCount: number;
  categoriesAnalyzed: string[];
  tagsAnalyzed: string[];

  // Structured insights
  insights: AiInsightData;

  // Formatted version (for email and simple display)
  formattedInsights: string;

  // Key takeaway (for messaging/notification system)
  keyTakeaway: string;

  // Status tracking
  generatedAt: Timestamp;
  emailSentAt?: Timestamp;
  emailStatus: EmailStatus;

  // AI metadata (for tracking/debugging)
  aiModel: string;
  tokensUsed?: number;
}

// AI Chat types

export type AiChatNotificationType = 'milestone' | 'budget-warning' | 'period-ending';

export interface AiChatNotification {
  id: string;
  userId: string;
  accountId: string;
  periodId: string;
  periodName: string;

  // Message content
  content: string;
  checkInType: AiChatNotificationType;

  // Metadata
  createdAt: Timestamp;
  readAt?: Timestamp;
  isRead: boolean;

  // AI tracking
  tokensUsed: number;
  aiModel: string;
}

export interface AiChatSessionMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  message: string;
  periodId?: string;
  sessionHistory?: AiChatSessionMessage[];
}

export interface AiChatResponse {
  response: string;
  tokensUsed: number;
}

export interface GetAiChatNotificationsRequest {
  limit?: number;
}

export interface GetAiChatNotificationsResponse {
  notifications: AiChatNotification[];
}

export interface RateLimit {
  userId: string;
  hourlyCount: number;
  dailyCount: number;
  lastHourReset: Timestamp;
  lastDayReset: Timestamp;
}
