import * as Sentry from '@sentry/node';
import { getGeminiModel } from '../config/gemini';
import type { AiInsightData } from '../types';

/**
 * Map internal category names to user-friendly display names
 */
export function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    need: 'Essentials',
    want: 'Rewards',
    rituals: 'Rituals',
    culture: 'Growth',
    connections: 'Connections',
    unexpected: 'Unexpected',
  };

  return categoryMap[category.toLowerCase()] || category;
}

/**
 * Spending data structure for AI analysis
 */
export interface SpendingDataForAi {
  date: Date;
  amount: number;
  description: string;
  category: string;
  notes?: string;
  tags?: string[];
  recurring: boolean;
}

/**
 * Period information for context
 */
export interface PeriodInfoForAi {
  name: string;
  startDate: Date;
  endDate: Date;
  targetSpend?: number;
  targetSavings?: number;
  goals?: string;
}

/**
 * Historical data for comparison
 */
export interface HistoricalDataForAi {
  totalSpending: number;
  transactionCount: number;
  topCategories: Array<{ category: string; amount: number }>;
  topTags: Array<{ tag: string; amount: number }>;
}

/**
 * Format spending data into a structured text format for the AI prompt
 */
export function formatSpendingDataForPrompt(
  spending: SpendingDataForAi[],
  currentPeriod: PeriodInfoForAi,
  historicalData?: HistoricalDataForAi,
  currency = 'USD',
): string {
  let prompt = '# Spending Analysis Request\n\n';

  // Current period context
  prompt += `## Current Period: ${currentPeriod.name}\n`;
  prompt += `- Duration: ${currentPeriod.startDate.toLocaleDateString()} to ${currentPeriod.endDate.toLocaleDateString()}\n`;
  if (currentPeriod.targetSpend) {
    prompt += `- Budget Target: ${currency} ${currentPeriod.targetSpend.toFixed(2)}\n`;
  }
  if (currentPeriod.targetSavings) {
    prompt += `- Savings Goal: ${currency} ${currentPeriod.targetSavings.toFixed(2)}\n`;
  }
  if (currentPeriod.goals) {
    prompt += `- **Period Goal**: ${currentPeriod.goals}\n`;
    prompt += '  (Remind the user of this goal in your analysis and recommendations)\n';
  }
  prompt += '\n';

  // Summary statistics
  const totalSpending = spending.reduce((sum, s) => sum + s.amount, 0);
  const allCategories = [...new Set(spending.map((s) => s.category))];
  const allCategoriesDisplay = allCategories.map((c) => getCategoryDisplayName(c));
  const allTags = [...new Set(spending.flatMap((s) => s.tags || []))];

  prompt += '## Current Period Summary\n';
  prompt += `- Total Spending: ${currency} ${totalSpending.toFixed(2)}\n`;
  prompt += `- Number of Transactions: ${spending.length}\n`;
  prompt += `- Categories: ${allCategoriesDisplay.join(', ')}\n`;
  prompt += `- Tags Used: ${allTags.length > 0 ? allTags.join(', ') : 'None'}\n`;
  prompt += '\n';

  // Historical comparison data
  if (historicalData) {
    prompt += '## Previous Period Comparison\n';
    prompt += `- Previous Total: ${currency} ${historicalData.totalSpending.toFixed(2)}\n`;
    prompt += `- Previous Transactions: ${historicalData.transactionCount}\n`;
    const changePct =
      ((totalSpending - historicalData.totalSpending) / historicalData.totalSpending) * 100;
    prompt += `- Change: ${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%\n`;
    prompt += '\n';
  }

  // Detailed transactions (grouped by category)
  prompt += '## Detailed Transactions\n';
  prompt +=
    '(Categories are mapped as: need=Essentials, want=Rewards, rituals=Rituals, culture=Growth, connections=Connections, unexpected=Unexpected)\n\n';
  const byCategory = spending.reduce(
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
    const categoryTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
    const displayName = getCategoryDisplayName(category);
    prompt += `### ${displayName} (${currency} ${categoryTotal.toFixed(2)})\n`;
    for (const t of transactions) {
      const tagStr = t.tags && t.tags.length > 0 ? ` [${t.tags.join(', ')}]` : '';
      const recurringStr = t.recurring ? ' (Recurring)' : '';
      prompt += `- ${t.date.toLocaleDateString()}: ${currency} ${t.amount.toFixed(2)} - ${t.description}${tagStr}${recurringStr}\n`;
      if (t.notes) {
        prompt += `  Notes: ${t.notes}\n`;
      }
    }
    prompt += '\n';
  }

  return prompt;
}

/**
 * Build the complete AI prompt for generating insights
 */
export function buildAiPrompt(
  formattedData: string,
  analysisType: 'weekly' | 'period-end' = 'weekly',
  userName = 'there',
): string {
  const comparisonContext = analysisType === 'weekly' ? 'previous week' : 'previous period';

  return `${formattedData}

# Analysis Task

You are a financial advisor analyzing a user's spending data. Please provide a comprehensive analysis in the following structured format:

## 0. KEY TAKEAWAY (REQUIRED)
This is the MOST IMPORTANT part of your analysis. Write a personal text message from a financial coach to the user. This should be:
- 2-3 sentences in casual, conversational tone
- Written like a text message or instant message you'd send to a friend
- Start with a varied casual greeting using the user's first name: "${userName}"
  * Examples: "Hey, ${userName}.", "Hi ${userName}!", "${userName}, great work!", "Nice job, ${userName}!"
- The single most critical or noteworthy observation from the entire analysis
- Action-oriented and specific (include actual amounts, categories, or percentages)
- Supportive, encouraging, and motivational
- Celebrate wins or frame challenges as opportunities

Examples of GOOD key takeaways:
- "Hey, ${userName}. One key thing I noticed this week is that you spent $240 on dining out. Let's try to keep this to a minimum - cooking at home could save you $100 weekly!"
- "${userName}, great work on lessening your Rewards spending by 25%! Let's maintain this rate and you'll hit your savings goal by next month."
- "Hi ${userName}! Your Essentials are looking solid, but weekend spending jumped to $180. Planning ahead for weekends could cut that in half."
- "Nice job, ${userName}! You stayed under budget in 4 out of 5 categories. The one area to watch is Connections - it's up 30% from last period."

Examples of BAD messages (avoid these):
- "You spent a lot this week." (not specific, not conversational, no name)
- "Try to spend less money." (too generic, not encouraging)
- "Your spending was about average." (not insightful, no action, boring)
- "Good job!" (too short, no specific feedback)

Format your response as:
**Key Takeaway:** [Your 2-3 sentence conversational message here]

## 1. SPENDING PATTERNS & TRENDS
Provide a summary of overall spending patterns and identify 2-4 key trends. Look for:
- Spending trajectory (increasing, decreasing, stable)
- Day-of-week or time-based patterns
- Unusual or one-time large purchases
- Recurring vs. non-recurring spending distribution

Format your response as:
**Summary:** [One sentence overall pattern summary]
**Trends:**
- [Trend 1]
- [Trend 2]
- [Trend 3]
**Unusual Spending (if any):**
- [Unusual item 1]
- [Unusual item 2]

## 2. CATEGORY BREAKDOWN
Analyze spending by category. IMPORTANT: Use the friendly category names (Essentials, Rewards, Rituals, Growth, Connections, Unexpected) in your analysis, NOT the internal category codes. Identify top 3-5 categories and assess budget performance.

Format your response as:
**Top Categories:**
- [Friendly Category Name]: $[amount] ([percentage]% of total)
- [Friendly Category Name]: $[amount] ([percentage]% of total)
- [Friendly Category Name]: $[amount] ([percentage]% of total)
**Budget Performance:** [Assessment of spending vs budget targets. If a period goal was provided, reference how spending aligns with that goal]

## 3. TAG ANALYSIS
Analyze spending patterns based on user-defined tags (if any tags present in data).

Format your response as:
**Top Tags:**
- [Tag 1]: $[amount] ([count] transactions, [percentage]% of total)
- [Tag 2]: $[amount] ([count] transactions, [percentage]% of total)
**Tag Trends (vs ${comparisonContext} if data available):**
- [Tag]: [increasing/decreasing/stable] by [X]%
**Tag Correlations (tags that frequently appear together):**
- [Tag 1] + [Tag 2]: [count] transactions, $[amount]
**Tag-Based Budget Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

## 4. ${analysisType === 'weekly' ? 'WEEK-OVER-WEEK' : 'PERIOD'} COMPARISON (if historical data provided)
Compare current ${analysisType === 'weekly' ? 'week' : 'period'} to ${comparisonContext}. Highlight improvements and concerns.

Format your response as:
**Summary:** [Overall comparison in one sentence]
**Improvements:**
- [Improvement 1]
- [Improvement 2]
**Concerns:**
- [Concern 1]
- [Concern 2]

## 5. ACTIONABLE RECOMMENDATIONS
Provide 3-5 specific, actionable recommendations to improve spending habits. If a period goal was provided, tailor recommendations to help the user achieve that goal.

Format your response as:
**Recommendations:**
1. [Specific action the user can take, relating to their period goal if provided]
2. [Specific action the user can take]
3. [Specific action the user can take]
4. [Specific action the user can take]
5. [Specific action the user can take]

IMPORTANT:
- Use friendly category names (Essentials, Rewards, Rituals, Growth, Connections, Unexpected) in your recommendations
- If a period goal was provided, explicitly reference it and suggest actions aligned with achieving that goal
- Be specific and reference actual amounts, categories, and tags from the data
- Keep insights concise and actionable
- Use the exact currency symbol provided in the data
- If no tags are present, omit the Tag Analysis section
- If no historical data is provided, omit the ${analysisType === 'weekly' ? 'Week-over-Week' : 'Period'} Comparison section
- Focus on being helpful and encouraging, not judgmental`;
}

/**
 * Parse AI response into structured format
 * This is a simplified parser - in production you might want more robust parsing
 */
export function parseAiResponse(aiResponse: string, _currency = 'USD'): AiInsightData {
  // Extract sections using regex patterns
  const extractSection = (text: string, sectionName: string): string => {
    const regex = new RegExp(`##\\s*\\d+\\.\\s*${sectionName}[\\s\\S]*?(?=##\\s*\\d+\\.|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0] : '';
  };

  const extractListItems = (text: string, marker: string): string[] => {
    const lines = text.split('\n');
    const items: string[] = [];
    let inSection = false;

    for (const line of lines) {
      if (line.includes(`**${marker}**`) || line.includes(`**${marker}:`)) {
        inSection = true;
        continue;
      }
      if (line.trim().startsWith('**') && inSection) {
        inSection = false;
      }
      if (inSection && (line.trim().startsWith('-') || line.trim().match(/^\d+\./))) {
        items.push(line.trim().replace(/^[-\d.]\s*/, ''));
      }
    }

    return items;
  };

  const extractSummary = (text: string, marker: string): string => {
    const regex = new RegExp(`\\*\\*${marker}:\\*\\*\\s*(.+?)(?=\\n|\\*\\*|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  // Parse key takeaway section (FIRST)
  const keyTakeawaySection = extractSection(aiResponse, 'KEY TAKEAWAY');
  const keyTakeaway = extractSummary(keyTakeawaySection, 'Key Takeaway');

  // Parse patterns section
  const patternsSection = extractSection(aiResponse, 'SPENDING PATTERNS');
  const patternsSummary = extractSummary(patternsSection, 'Summary');
  const trends = extractListItems(patternsSection, 'Trends');
  const unusualSpending = extractListItems(patternsSection, 'Unusual Spending');

  // Parse categories section
  const categoriesSection = extractSection(aiResponse, 'CATEGORY BREAKDOWN');
  const topCategoriesText = extractListItems(categoriesSection, 'Top Categories');
  const budgetPerformance = extractSummary(categoriesSection, 'Budget Performance');

  const topCategories = topCategoriesText.map((item) => {
    // Parse format: "Category: $amount (XX% of total)"
    const match = item.match(/(.+?):\s*\$?([\d,.]+)\s*\((\d+)%/);
    if (match) {
      return {
        category: match[1].trim(),
        amount: Number.parseFloat(match[2].replace(/,/g, '')),
        percentage: Number.parseInt(match[3], 10),
      };
    }
    return { category: item, amount: 0, percentage: 0 };
  });

  // Parse tags section
  const tagsSection = extractSection(aiResponse, 'TAG ANALYSIS');
  const topTagsText = extractListItems(tagsSection, 'Top Tags');
  const tagTrendsText = extractListItems(tagsSection, 'Tag Trends');
  const tagCorrelationsText = extractListItems(tagsSection, 'Tag Correlations');
  const tagRecommendations = extractListItems(tagsSection, 'Tag-Based Budget Recommendations');

  const topTags = topTagsText.map((item) => {
    // Parse format: "Tag: $amount (X transactions, XX% of total)"
    const match = item.match(/(.+?):\s*\$?([\d,.]+)\s*\((\d+)\s*transactions?,\s*(\d+)%/);
    if (match) {
      return {
        tag: match[1].trim(),
        totalSpending: Number.parseFloat(match[2].replace(/,/g, '')),
        transactionCount: Number.parseInt(match[3], 10),
        percentage: Number.parseInt(match[4], 10),
      };
    }
    return { tag: item, totalSpending: 0, transactionCount: 0, percentage: 0 };
  });

  const tagTrends = tagTrendsText.map((item) => {
    // Parse format: "Tag: increasing/decreasing/stable by X%"
    const match = item.match(/(.+?):\s*(increasing|decreasing|stable)\s*by\s*([-\d.]+)%/i);
    if (match) {
      return {
        tag: match[1].trim(),
        trend: match[2].toLowerCase() as 'increasing' | 'decreasing' | 'stable',
        changePercentage: Number.parseFloat(match[3]),
      };
    }
    return { tag: item, trend: 'stable' as const, changePercentage: 0 };
  });

  const tagCorrelations = tagCorrelationsText.map((item) => {
    // Parse format: "Tag1 + Tag2: X transactions, $amount"
    const match = item.match(/(.+?):\s*(\d+)\s*transactions?,\s*\$?([\d,.]+)/);
    if (match) {
      const tags = match[1].split('+').map((t) => t.trim());
      return {
        tags,
        frequency: Number.parseInt(match[2], 10),
        totalSpending: Number.parseFloat(match[3].replace(/,/g, '')),
      };
    }
    return { tags: [item], frequency: 0, totalSpending: 0 };
  });

  // Parse comparison section
  const comparisonSection = extractSection(aiResponse, 'PERIOD COMPARISON');
  const comparisonSummary = extractSummary(comparisonSection, 'Summary');
  const improvements = extractListItems(comparisonSection, 'Improvements');
  const concerns = extractListItems(comparisonSection, 'Concerns');

  // Parse recommendations
  const recommendationsSection = extractSection(aiResponse, 'ACTIONABLE RECOMMENDATIONS');
  const recommendations = extractListItems(recommendationsSection, 'Recommendations');

  return {
    keyTakeaway: keyTakeaway || 'Hey! Keep up the great work tracking your spending!',
    patterns: {
      summary: patternsSummary || 'Spending analysis completed',
      trends: trends.length > 0 ? trends : ['No significant trends identified'],
      unusualSpending: unusualSpending.length > 0 ? unusualSpending : [],
    },
    categories: {
      topCategories,
      budgetPerformance: budgetPerformance || '',
    },
    comparison: {
      summary: comparisonSummary || 'No comparison data available',
      improvements: improvements.length > 0 ? improvements : [],
      concerns: concerns.length > 0 ? concerns : [],
    },
    tags: {
      topTags,
      tagTrends: tagTrends.length > 0 ? tagTrends : [],
      tagCorrelations: tagCorrelations.length > 0 ? tagCorrelations : [],
      budgetRecommendations: tagRecommendations.length > 0 ? tagRecommendations : [],
    },
    recommendations:
      recommendations.length > 0 ? recommendations : ['Continue tracking your spending regularly'],
  };
}

/**
 * Generate formatted markdown version of insights for email
 */
export function formatInsightsAsMarkdown(
  insights: AiInsightData,
  _periodName: string,
  currency = 'USD',
  analysisType: 'weekly' | 'period-end' = 'weekly',
): string {
  let markdown = '';

  // Patterns section
  markdown += '## 📊 Spending Patterns & Trends\n\n';
  markdown += `${insights.patterns.summary}\n\n`;
  markdown += '**Key Trends:**\n';
  for (const trend of insights.patterns.trends) {
    markdown += `- ${trend}\n`;
  }
  if (insights.patterns.unusualSpending && insights.patterns.unusualSpending.length > 0) {
    markdown += '\n**Unusual Spending:**\n';
    for (const item of insights.patterns.unusualSpending) {
      markdown += `- ${item}\n`;
    }
  }
  markdown += '\n';

  // Categories section
  markdown += '## 💭 Category Breakdown\n\n';
  markdown += '**Top Categories:**\n';
  for (const cat of insights.categories.topCategories) {
    markdown += `- **${cat.category}** \n`;
  }
  if (insights.categories.budgetPerformance) {
    markdown += `\n**Budget Performance:** ${insights.categories.budgetPerformance}\n`;
  }
  markdown += '\n';

  // Tags section (if present)
  if (insights.tags.topTags.length > 0) {
    markdown += '## 🏷️ Tag Analysis\n\n';
    markdown += '**Top Tags:**\n';
    for (const tag of insights.tags.topTags) {
      markdown += `- **${tag.tag}** \n`;
    }

    if (insights.tags.tagTrends && insights.tags.tagTrends.length > 0) {
      markdown += '\n**Tag Trends:**\n';
      for (const trend of insights.tags.tagTrends) {
        const arrow =
          trend.trend === 'increasing' ? '📈' : trend.trend === 'decreasing' ? '📉' : '➡️';
        markdown += `- ${arrow} **${trend.tag}**: ${trend.trend} by ${Math.abs(trend.changePercentage).toFixed(1)}%\n`;
      }
    }

    if (insights.tags.tagCorrelations && insights.tags.tagCorrelations.length > 0) {
      markdown += '\n**Tag Correlations:**\n';
      for (const corr of insights.tags.tagCorrelations) {
        markdown += `- ${corr.tags.join(' + ')}: ${corr.frequency} transactions, ${currency} ${corr.totalSpending.toFixed(2)}\n`;
      }
    }

    if (insights.tags.budgetRecommendations && insights.tags.budgetRecommendations.length > 0) {
      markdown += '\n**Tag-Based Recommendations:**\n';
      for (const rec of insights.tags.budgetRecommendations) {
        markdown += `- ${rec}\n`;
      }
    }
    markdown += '\n';
  }

  // Comparison section (if present)
  if (insights.comparison) {
    const comparisonTitle =
      analysisType === 'weekly' ? 'Week-over-Week Comparison' : 'Period Comparison';
    markdown += `## 📈 ${comparisonTitle}\n\n`;
    markdown += `${insights.comparison.summary}\n\n`;
    if (insights.comparison.improvements && insights.comparison.improvements.length > 0) {
      markdown += '**✅ Improvements:**\n';
      for (const imp of insights.comparison.improvements) {
        markdown += `- ${imp}\n`;
      }
      markdown += '\n';
    }
    if (insights.comparison.concerns && insights.comparison.concerns.length > 0) {
      markdown += '**⚠️ Areas to Watch:**\n';
      for (const concern of insights.comparison.concerns) {
        markdown += `- ${concern}\n`;
      }
      markdown += '\n';
    }
  }

  // Recommendations section
  markdown += '## 💡 Actionable Recommendations\n\n';
  for (let i = 0; i < insights.recommendations.length; i++) {
    markdown += `${i + 1}. ${insights.recommendations[i]}\n`;
  }

  return markdown;
}

/**
 * Main function to generate AI insights using Gemini
 */
export async function generateAiInsights(
  spending: SpendingDataForAi[],
  currentPeriod: PeriodInfoForAi,
  historicalData?: HistoricalDataForAi,
  currency = 'USD',
  analysisType: 'weekly' | 'period-end' = 'weekly',
  userName = 'there',
): Promise<{
  insights: AiInsightData;
  formattedInsights: string;
  keyTakeaway: string;
  tokensUsed?: number;
}> {
  return Sentry.startSpan({ name: 'generateAiInsights', op: 'ai.generation' }, async () => {
    try {
      // Format data for prompt
      const formattedData = formatSpendingDataForPrompt(
        spending,
        currentPeriod,
        historicalData,
        currency,
      );

      // Build complete prompt with user name
      const prompt = buildAiPrompt(formattedData, analysisType, userName);

      // Get Gemini model (uses gemini-1.5-pro-latest by default)
      const model = getGeminiModel();

      // Generate content
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse response
      const insights = parseAiResponse(text, currency);

      // Extract key takeaway (it's in insights.keyTakeaway)
      const keyTakeaway = insights.keyTakeaway;

      // Generate formatted markdown (WITHOUT key takeaway - it's stored separately)
      const formattedInsights = formatInsightsAsMarkdown(
        insights,
        currentPeriod.name,
        currency,
        analysisType,
      );

      // Get token usage if available
      const tokensUsed = response.usageMetadata?.totalTokenCount;

      return {
        insights,
        formattedInsights,
        keyTakeaway,
        tokensUsed,
      };
    } catch (error) {
      Sentry.captureException(error);
      throw new Error(`Failed to generate AI insights: ${error}`);
    }
  });
}
