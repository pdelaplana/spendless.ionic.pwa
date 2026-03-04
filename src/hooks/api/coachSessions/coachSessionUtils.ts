import {
  type ICoachMessage,
  type ICoachSession,
  createCoachMessage,
  createCoachSession,
} from '@/domain/CoachSession';
import type { IPeriod } from '@/domain/Period';
import type { ISpend } from '@/domain/Spend';
import type { IWallet } from '@/domain/Wallet';
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

// Converts ICoachMessage history to the Content format expected by the Gemini chat API
export const buildGeminiHistory = (
  messages: ICoachMessage[],
): { role: 'user' | 'model'; parts: [{ text: string }] }[] =>
  messages
    .filter((m) => m.status === 'sent')
    .map((m) => ({ role: m.role, parts: [{ text: m.content }] }));

const formatPromptDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// System prompt builder (basic version — refined in Phase 3 with real spending data)
export const buildSystemPrompt = (options: {
  includeContext: boolean;
  spends?: ISpend[];
  currency?: string;
  period?: IPeriod;
  wallets?: IWallet[];
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
  const recentSpends = [...options.spends]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 30);

  const spendLines = recentSpends.map((s) => {
    const date = s.date.toISOString().split('T')[0];
    return `- ${date}: ${s.description} (${s.category}) — ${currency} ${s.amount.toFixed(2)}`;
  });

  const total = recentSpends.reduce((sum, s) => sum + s.amount, 0);

  const sections: string[] = [base, ''];

  if (options.period) {
    const { period, wallets } = options;
    const start = formatPromptDate(period.startAt);
    const end = formatPromptDate(period.endAt);
    sections.push(`Period: "${period.name}" (${start} – ${end})`);
    sections.push('');

    const limitFormatted = period.targetSpend.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const spentFormatted = total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const pct = period.targetSpend > 0 ? Math.round((total / period.targetSpend) * 100) : 0;
    sections.push(
      `Budget: ${currency} ${spentFormatted} spent of ${currency} ${limitFormatted} limit (${pct}%)`,
    );
    sections.push('');

    if (wallets && wallets.length > 0) {
      sections.push('Wallets:');
      for (const wallet of wallets) {
        const walletSpent = recentSpends
          .filter((s) => s.walletId === wallet.id)
          .reduce((sum, s) => sum + s.amount, 0);
        const walletSpentFmt = walletSpent.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const walletLimitFmt = wallet.spendingLimit.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const walletPct =
          wallet.spendingLimit > 0 ? Math.round((walletSpent / wallet.spendingLimit) * 100) : 0;
        const overLimit = walletSpent > wallet.spendingLimit ? ' ⚠️ over limit' : '';
        sections.push(
          `- ${wallet.name}: ${currency} ${walletSpentFmt} spent / ${currency} ${walletLimitFmt} limit (${walletPct}%)${overLimit}`,
        );
      }
      sections.push('');
    }
  }

  sections.push(
    `The user's ${recentSpends.length} most recent transactions (total: ${currency} ${total.toFixed(2)}):`,
    ...spendLines,
    '',
    'Use this data to provide personalized, data-driven advice when relevant.',
  );

  return sections.join('\n');
};
