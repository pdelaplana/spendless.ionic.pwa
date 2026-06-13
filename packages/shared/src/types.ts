export type SubscriptionTier = 'essentials' | 'premium';

export type StripeSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

// Stripe Function contract types
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

// AI Chat contract types
export type AiChatNotificationType = 'milestone' | 'budget-warning' | 'period-ending';

export interface AiChatNotification {
  id: string;
  userId: string;
  accountId: string;
  periodId: string;
  periodName: string;
  content: string;
  checkInType: AiChatNotificationType;
  createdAt: { seconds: number; nanoseconds: number } | unknown; // Compatible with both Firestore Timestamp & simple objects
  readAt?: { seconds: number; nanoseconds: number } | unknown;
  isRead: boolean;
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
