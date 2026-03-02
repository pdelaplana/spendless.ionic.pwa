import {
  type ICoachMessage,
  type ICoachSession,
  createCoachMessage,
  createCoachSession,
} from '@/domain/CoachSession';
import type { ISpend } from '@/domain/Spend';
import { type DocumentData, Timestamp } from 'firebase/firestore';

export const ACCOUNTS_COLLECTION = 'accounts';
export const COACH_SESSIONS_SUBCOLLECTION = 'coachSessions';
export const MESSAGES_SUBCOLLECTION = 'messages';
export const USER_PROFILE_EXTENSIONS_COLLECTION = 'userProfileExtensions';
export const FREE_MESSAGES_DEFAULT = 5;
export const PAGE_SIZE = 20;

// Session mappers
export const sessionToFirestore = (session: ICoachSession): DocumentData => ({
  accountId: session.accountId,
  userId: session.userId,
  title: session.title,
  messageCount: session.messageCount,
  createdAt: Timestamp.fromDate(session.createdAt),
  updatedAt: Timestamp.fromDate(session.updatedAt),
  archivedAt: session.archivedAt ? Timestamp.fromDate(session.archivedAt) : null,
});

export const sessionFromFirestore = (id: string, data: DocumentData): ICoachSession => ({
  ...createCoachSession({
    accountId: data.accountId,
    userId: data.userId,
    title: data.title,
    messageCount: data.messageCount ?? 0,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    archivedAt: data.archivedAt?.toDate() ?? undefined,
  }),
  id,
});

// Message mappers
export const messageToFirestore = (message: ICoachMessage): DocumentData => ({
  sessionId: message.sessionId,
  role: message.role,
  content: message.content,
  status: message.status,
  createdAt: Timestamp.fromDate(message.createdAt),
});

export const messageFromFirestore = (id: string, data: DocumentData): ICoachMessage => ({
  ...createCoachMessage({
    sessionId: data.sessionId,
    role: data.role,
    content: data.content,
    status: data.status ?? 'sent',
    createdAt: data.createdAt?.toDate() ?? new Date(),
  }),
  id,
});

// System prompt builder (basic version — refined in Phase 3 with real spending data)
export const buildSystemPrompt = (options: {
  includeContext: boolean;
  spends?: ISpend[];
  currency?: string;
}): string => {
  const base = [
    'You are a non-judgmental AI Financial Coach helping users understand and improve their spending habits.',
    'Be concise, empathetic, and practical. Focus on actionable insights.',
    'Never shame the user. Frame everything constructively.',
  ].join(' ');

  if (!options.includeContext || !options.spends?.length) {
    return `${base}\n\nNo spending context has been shared for this session.`;
  }

  const currency = options.currency ?? 'USD';
  const recentSpends = options.spends.slice(0, 30);

  const spendLines = recentSpends.map((s) => {
    const date = s.date.toISOString().split('T')[0];
    return `- ${date}: ${s.description} (${s.category}) — ${currency} ${s.amount.toFixed(2)}`;
  });

  const total = recentSpends.reduce((sum, s) => sum + s.amount, 0);

  return [
    base,
    '',
    `The user's ${recentSpends.length} most recent transactions (total: ${currency} ${total.toFixed(2)}):`,
    ...spendLines,
    '',
    'Use this data to provide personalized, data-driven advice when relevant.',
  ].join('\n');
};
