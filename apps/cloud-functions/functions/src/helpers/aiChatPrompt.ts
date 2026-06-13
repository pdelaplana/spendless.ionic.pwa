import type { AiChatNotificationType, AiChatSessionMessage } from '../types';
import type { PeriodInfoForAi, SpendingDataForAi } from './aiInsights';
import { formatSpendingDataForPrompt, getCategoryDisplayName } from './aiInsights';

/**
 * System prompt for the AI Chat financial coach persona
 */
export const AI_CHAT_SYSTEM_PROMPT = `You are a friendly, supportive AI financial coach helping users manage their spending with the Spendless app.

**Personality:**
- Conversational, warm, and encouraging (like a supportive friend)
- Use the user's first name naturally
- Celebrate wins, frame challenges as opportunities
- Concise but thorough (2-4 sentences for simple questions)
- Never use emojis unless explicitly asked

**Knowledge:**
- Access to user's spending data, categories, tags, notes
- Current period goals and budgets
- Spending patterns and trends
- Personalized insights based on actual data

**Categories:**
- Essentials (need): Basic necessities
- Rewards (want): Discretionary purchases
- Rituals: Regular habits
- Growth (culture): Learning, development
- Connections: Social spending, gifts
- Unexpected: Unplanned expenses

**Guidelines:**
- ALWAYS reference specific data (amounts, categories, dates) when available
- If no data, acknowledge and ask clarifying questions
- Never make up data
- Be helpful and empowering, not judgmental
- Keep responses focused and actionable`;

/**
 * Build the complete AI chat prompt with session context and spending data
 */
export function buildAiChatPrompt(
  userMessage: string,
  userName: string,
  currentPeriod: PeriodInfoForAi,
  sessionHistory: AiChatSessionMessage[],
  spendingData?: SpendingDataForAi[],
  categoryBreakdown?: Array<{ category: string; amount: number; count: number }>,
  tagAnalysis?: Array<{ tag: string; amount: number; count: number }>,
  currency = 'USD',
): string {
  let prompt = `${AI_CHAT_SYSTEM_PROMPT}\n\n`;

  // User context
  prompt += `**User:** ${userName}\n\n`;

  // Current period context
  prompt += `## Current Period: ${currentPeriod.name}\n`;
  prompt += `- Duration: ${currentPeriod.startDate.toLocaleDateString()} to ${currentPeriod.endDate.toLocaleDateString()}\n`;

  const now = new Date();
  const daysRemaining = Math.ceil(
    (currentPeriod.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  prompt += `- Days Remaining: ${daysRemaining}\n`;

  if (currentPeriod.targetSpend) {
    prompt += `- Budget Target: ${currency} ${currentPeriod.targetSpend.toFixed(2)}\n`;
  }
  if (currentPeriod.targetSavings) {
    prompt += `- Savings Goal: ${currency} ${currentPeriod.targetSavings.toFixed(2)}\n`;
  }
  if (currentPeriod.goals) {
    prompt += `- **Period Goal**: "${currentPeriod.goals}"\n`;
  }
  prompt += '\n';

  // Include spending summary if available
  if (spendingData && spendingData.length > 0) {
    const totalSpending = spendingData.reduce((sum, s) => sum + s.amount, 0);
    prompt += '## Current Spending Summary\n';
    prompt += `- Total Spending: ${currency} ${totalSpending.toFixed(2)}\n`;
    prompt += `- Number of Transactions: ${spendingData.length}\n`;

    if (currentPeriod.targetSpend) {
      const percentSpent = (totalSpending / currentPeriod.targetSpend) * 100;
      prompt += `- Budget Used: ${percentSpent.toFixed(1)}%\n`;
    }
    prompt += '\n';
  }

  // Include category breakdown if available
  if (categoryBreakdown && categoryBreakdown.length > 0) {
    prompt += '## Spending by Category\n';
    for (const cat of categoryBreakdown.slice(0, 5)) {
      const displayName = getCategoryDisplayName(cat.category);
      prompt += `- ${displayName}: ${currency} ${cat.amount.toFixed(2)} (${cat.count} transactions)\n`;
    }
    prompt += '\n';
  }

  // Include tag analysis if available
  if (tagAnalysis && tagAnalysis.length > 0) {
    prompt += '## Top Tags\n';
    for (const tag of tagAnalysis.slice(0, 5)) {
      prompt += `- ${tag.tag}: ${currency} ${tag.amount.toFixed(2)} (${tag.count} transactions)\n`;
    }
    prompt += '\n';
  }

  // Include detailed spending data if provided (for specific questions)
  if (spendingData && spendingData.length > 0) {
    prompt += '## Recent Transactions\n';
    // Group by category
    const byCategory = spendingData.reduce(
      (acc, s) => {
        if (!acc[s.category]) {
          acc[s.category] = [];
        }
        acc[s.category].push(s);
        return acc;
      },
      {} as Record<string, SpendingDataForAi[]>,
    );

    for (const [category, transactions] of Object.entries(byCategory)) {
      const displayName = getCategoryDisplayName(category);
      prompt += `### ${displayName}\n`;
      for (const t of transactions.slice(0, 10)) {
        // Limit to 10 per category
        const tagStr = t.tags && t.tags.length > 0 ? ` [${t.tags.join(', ')}]` : '';
        const recurringStr = t.recurring ? ' (Recurring)' : '';
        prompt += `- ${t.date.toLocaleDateString()}: ${currency} ${t.amount.toFixed(2)} - ${t.description}${tagStr}${recurringStr}\n`;
        if (t.notes) {
          prompt += `  Notes: ${t.notes}\n`;
        }
      }
    }
    prompt += '\n';
  }

  // Conversation history for context
  if (sessionHistory.length > 0) {
    prompt += '## Conversation History\n';
    for (const msg of sessionHistory) {
      const label = msg.role === 'user' ? 'User' : 'Coach';
      prompt += `${label}: ${msg.content}\n`;
    }
    prompt += '\n';
  }

  // Current user message
  prompt += '## Current Question\n';
  prompt += `User: ${userMessage}\n\n`;

  // Instructions
  prompt +=
    'Respond as the AI financial coach. Be specific, reference actual data, and keep it conversational (2-4 sentences for simple questions). If you need more information, ask clarifying questions.';

  return prompt;
}

/**
 * Build prompt for generating proactive notifications
 */
export function buildNotificationPrompt(
  userName: string,
  notificationType: AiChatNotificationType,
  currentPeriod: PeriodInfoForAi,
  spendingData: SpendingDataForAi[],
  categoryBreakdown: Array<{ category: string; amount: number; count: number }>,
  currency = 'USD',
): string {
  let prompt = `${AI_CHAT_SYSTEM_PROMPT}\n\n`;

  // User context
  prompt += `**User:** ${userName}\n\n`;

  // Period context
  const formattedContext = formatSpendingDataForPrompt(
    spendingData,
    currentPeriod,
    undefined,
    currency,
  );
  prompt += `${formattedContext}\n\n`;

  // Category breakdown
  prompt += '## Category Summary\n';
  for (const cat of categoryBreakdown) {
    const displayName = getCategoryDisplayName(cat.category);
    prompt += `- ${displayName}: ${currency} ${cat.amount.toFixed(2)} (${cat.count} transactions)\n`;
  }
  prompt += '\n';

  // Task based on notification type
  prompt += '## Task\n';
  switch (notificationType) {
    case 'milestone':
      prompt += `Write a friendly 2-3 sentence mid-period check-in message for ${userName}.\n`;
      prompt += `Acknowledge they're halfway through their period, share 1-2 specific observations from the data, and encourage staying on track.\n`;
      break;

    case 'budget-warning':
      prompt += `Write a supportive 2-3 sentence budget warning message for ${userName}.\n`;
      prompt += `Alert them they've used 75%+ of their budget, stay positive, mention specific categories if relevant, and suggest mindfulness for remaining days.\n`;
      break;

    case 'period-ending':
      prompt += `Write a 2-3 sentence period ending reminder for ${userName}.\n`;
      prompt += `Note there are 3 days or less left in the period, celebrate if they're on track or encourage mindful spending if not, and hint that a full AI Checkin is coming soon.\n`;
      break;
  }

  prompt +=
    '\nIMPORTANT: Write ONLY the notification message content. Do NOT include headers, labels, or any formatting. Just the 2-3 sentence message itself.';

  return prompt;
}
