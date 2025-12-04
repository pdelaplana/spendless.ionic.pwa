# AI Checkin Feature - Technical Reference

## Overview

AI Checkin is a premium-only feature that generates personalized spending insights using Google Gemini AI. The system analyzes spending transactions, categories, tags, and historical patterns to produce actionable recommendations.

**Key Points**:
- Premium subscription required (`subscriptionTier === 'premium'`)
- User must enable the feature (`aiCheckinEnabled === true`)
- Insights are generated asynchronously via job queue
- Results stored in Firestore subcollection
- Email notification sent when complete

## How Insights Are Generated

### Automatic Generation

There are two automatic triggers for generating insights:

#### 1. Weekly Schedule (Every Monday 9:00 AM UTC)

- **Function**: `weeklyAiCheckin` (scheduled)
- **Triggers for**: All accounts with `aiCheckinEnabled === true` and active premium subscription
- **Analyzes**: Last 7 days of spending data
- **Note**: Code references `aiCheckinFrequency` field but it's not currently implemented in the database

#### 2. Period End (When Spending Period Closes)

- **Function**: `periodEndAiCheckin` (Firestore trigger)
- **Triggers when**: A period document is updated with `closedAt` timestamp or `endAt` date passes
- **Triggers for**: All accounts with `aiCheckinEnabled === true` and active premium subscription
- **Analyzes**: All spending within that period
- **Note**: Code references `aiCheckinFrequency` field but it's not currently implemented in the database

### Manual Generation

Users can manually trigger insight generation:

**Function**: `triggerAiCheckin` (HTTPS Callable)

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const triggerAiCheckin = httpsCallable(functions, 'triggerAiCheckin');

// Trigger generation
const result = await triggerAiCheckin({
  periodId?: string;                    // Optional: analyze specific period
  analysisType?: 'weekly' | 'period-end'  // Optional: defaults based on context
});

// Response
{
  success: boolean;
  message: string;
  jobId: string;  // Job queued for async processing
}
```

**Error Codes**:
- `unauthenticated`: User not logged in
- `permission-denied`: Not premium or AI Checkin disabled
- `failed-precondition`: Insufficient spending data

### Generation Process

1. User triggers generation (automatic or manual)
2. Function validates premium status and `aiCheckinEnabled`
3. Job added to `jobs/{jobId}` collection with type `'generateAiCheckin'`
4. `processJob` trigger picks up job and routes to handler
5. Handler fetches spending data and generates insights via Gemini API
6. Insights stored in `accounts/{userId}/aiInsights/{insightId}`
7. Email sent to user with formatted insights
8. Job status updated to `completed`

**Processing Time**: Typically 10-30 seconds depending on data volume

## Data Structure

### Account Configuration Fields

Location: `accounts/{accountId}` document

```typescript
interface Account {
  // ... other account fields

  // AI Checkin Configuration
  aiCheckinEnabled: boolean;
  // Whether AI Checkin is enabled for this account
  // Default: false
  // When true, user receives both weekly AND period-end insights

  lastAiCheckinAt: Timestamp | null;
  // Timestamp of last successful insight generation
  // Used to prevent duplicate generations
}
```

**Note**: The backend code references an `aiCheckinFrequency` field to allow users to choose between 'weekly', 'period-end', or 'both', but this field is not currently implemented. Currently, when `aiCheckinEnabled === true`, users receive insights at BOTH weekly intervals and period ends.

### AI Insight Document

Location: `accounts/{userId}/aiInsights/{insightId}`

```typescript
interface AiInsight {
  // ==================
  // METADATA
  // ==================
  id: string;                    // Document ID (auto-generated)
  userId: string;                // Firebase Auth user ID
  accountId: string;             // Account document ID

  // ==================
  // TIME CONTEXT
  // ==================
  periodId?: string;             // Associated period ID (for period-end analysis)
  periodName?: string;           // Period name, e.g., "January 2025"
  periodStartDate?: Timestamp;   // Period start date
  periodEndDate?: Timestamp;     // Period end date
  weekStartDate?: Timestamp;     // Week start (for weekly analysis)
  weekEndDate?: Timestamp;       // Week end (for weekly analysis)

  // ==================
  // ANALYSIS METADATA
  // ==================
  analysisType: 'weekly' | 'period-end';
  // Type of analysis performed

  totalSpendingAnalyzed: number;
  // Total spending amount analyzed (sum of all transactions)

  transactionCount: number;
  // Number of spending transactions included in analysis

  categoriesAnalyzed: string[];
  // List of category names that had spending

  tagsAnalyzed: string[];
  // List of tag names found in analyzed transactions

  // ==================
  // INSIGHTS DATA
  // ==================
  insights: AiInsightData;
  // Structured insights (see detailed structure below)

  formattedInsights: string;
  // Complete insights formatted as Markdown
  // Contains all sections combined for email/display

  // ==================
  // STATUS
  // ==================
  generatedAt: Timestamp;
  // When the insights were generated

  emailSentAt?: Timestamp;
  // When email notification was sent (if successful)

  emailStatus: 'pending' | 'sent' | 'failed';
  // Status of email notification

  // ==================
  // AI METADATA
  // ==================
  aiModel: string;
  // AI model used, e.g., "gemini-1.5-pro"

  tokensUsed?: number;
  // Number of tokens consumed by API call (for tracking)
}
```

### AI Insight Data Structure

```typescript
interface AiInsightData {
  // ==================
  // SPENDING PATTERNS
  // ==================
  spendingPatterns: {
    overallTrend: 'increasing' | 'decreasing' | 'stable';
    // Overall spending trajectory compared to previous period/week

    dayOfWeekPatterns?: string[];
    // Observations about which days have most spending
    // e.g., ["Most spending occurs on weekends", "Friday has highest average"]

    unusualPurchases?: string[];
    // One-time large or unusual transactions detected
    // e.g., ["Large electronics purchase on Jan 15th"]

    recurringVsNonRecurring?: string;
    // Description of recurring vs one-time spending distribution
    // e.g., "60% recurring, 40% one-time purchases"
  };

  // ==================
  // CATEGORY BREAKDOWN
  // ==================
  categoryBreakdown: {
    topCategories: Array<{
      category: string;           // Category name
      amount: number;             // Total spent in category
      percentage: number;         // Percentage of total spending
      budgetStatus?: 'under' | 'over' | 'on-track';
      // Budget status if user has budget set for this category
    }>;
    // Sorted by amount (highest first)
    // Typically includes top 5-10 categories
  };

  // ==================
  // TAG ANALYSIS (optional)
  // ==================
  tagAnalysis?: {
    topTags: Array<{
      tag: string;                // Tag name
      amount: number;             // Total spending with this tag
      trend?: 'increasing' | 'decreasing' | 'stable';
      // Trend compared to previous period (if available)
    }>;
    // Sorted by amount (highest first)

    tagCorrelations?: string[];
    // Tags that frequently appear together
    // e.g., ["'dining' and 'entertainment' often occur together"]

    recommendations?: string[];
    // Suggestions based on tag usage
    // e.g., ["Consider budgeting separately for 'vacation' tagged items"]
  };
  // Only present if user has tagged transactions

  // ==================
  // PERIOD COMPARISON (optional)
  // ==================
  periodComparison?: {
    previousPeriodSpending?: number;
    // Total spending in previous period/week

    changePercentage?: number;
    // Percentage change (positive = increased, negative = decreased)

    improvements?: string[];
    // Positive changes identified
    // e.g., ["Dining spending decreased by 20%"]

    concerns?: string[];
    // Negative changes or warnings
    // e.g., ["Shopping spending increased by 45%"]
  };
  // Only present if there's a previous period to compare against

  // ==================
  // RECOMMENDATIONS
  // ==================
  actionableRecommendations: string[];
  // List of specific, personalized suggestions
  // Always present, typically 3-7 recommendations
  // e.g.,
  // - "Set a monthly budget for 'Dining Out' category"
  // - "Consider meal planning to reduce grocery costs"
  // - "Your transportation costs are trending up - review routes"
}
```

## Querying AI Insights

### Fetch Latest Insights (Real-time)

```typescript
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const userId = auth.currentUser.uid;
const insightsRef = collection(db, `accounts/${userId}/aiInsights`);

// Get most recent insights
const q = query(
  insightsRef,
  orderBy('generatedAt', 'desc'),
  limit(10)
);

// Real-time listener
const unsubscribe = onSnapshot(q, (snapshot) => {
  const insights = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as AiInsight[];

  console.log('Latest insights:', insights);
});

// Clean up listener when done
// unsubscribe();
```

### Fetch Single Insight

```typescript
import { doc, getDoc } from 'firebase/firestore';

const userId = auth.currentUser.uid;
const insightId = 'abc123';

const insightRef = doc(db, `accounts/${userId}/aiInsights/${insightId}`);
const snapshot = await getDoc(insightRef);

if (snapshot.exists()) {
  const insight = { id: snapshot.id, ...snapshot.data() } as AiInsight;
  console.log('Insight:', insight);
}
```

### Fetch Insights for Specific Period

```typescript
import { where } from 'firebase/firestore';

const periodId = 'period123';

const q = query(
  insightsRef,
  where('periodId', '==', periodId),
  orderBy('generatedAt', 'desc')
);

const snapshot = await getDocs(q);
const periodInsights = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
})) as AiInsight[];
```

### Fetch Insights by Type

```typescript
// Get only weekly insights
const weeklyQuery = query(
  insightsRef,
  where('analysisType', '==', 'weekly'),
  orderBy('generatedAt', 'desc'),
  limit(5)
);

// Get only period-end insights
const periodEndQuery = query(
  insightsRef,
  where('analysisType', '==', 'period-end'),
  orderBy('generatedAt', 'desc'),
  limit(5)
);
```

### Pagination

```typescript
import { startAfter } from 'firebase/firestore';

// First page
const firstPageQuery = query(
  insightsRef,
  orderBy('generatedAt', 'desc'),
  limit(10)
);

const firstPageSnapshot = await getDocs(firstPageQuery);
const firstPageInsights = firstPageSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// Next page
const lastDoc = firstPageSnapshot.docs[firstPageSnapshot.docs.length - 1];
const nextPageQuery = query(
  insightsRef,
  orderBy('generatedAt', 'desc'),
  startAfter(lastDoc),
  limit(10)
);
```

## Understanding the Data

### Timestamp Fields

All timestamp fields are Firestore `Timestamp` objects. Convert to JavaScript Date:

```typescript
import { Timestamp } from 'firebase/firestore';

const insight: AiInsight = { /* ... */ };

// Convert to Date
const generatedDate = insight.generatedAt.toDate();

// Format for display
const formattedDate = generatedDate.toLocaleDateString();
const formattedDateTime = generatedDate.toLocaleString();
```

### Analysis Type Context

- **`'weekly'`**:
  - `weekStartDate` and `weekEndDate` will be present
  - `periodId`, `periodName`, `periodStartDate`, `periodEndDate` will be absent
  - Analyzes last 7 days of spending

- **`'period-end'`**:
  - `periodId`, `periodName`, `periodStartDate`, `periodEndDate` will be present
  - `weekStartDate` and `weekEndDate` will be absent
  - Analyzes entire spending period

### Optional Fields

Some fields may be absent depending on data availability:

- `tagAnalysis`: Only present if user has tagged transactions
- `periodComparison`: Only present if there's historical data to compare
- `budgetStatus` in categories: Only present if user has budgets set
- `trend` in tags: Only present if there's historical data

Always check for existence before accessing:

```typescript
if (insight.insights.tagAnalysis) {
  // Tag analysis available
  const topTags = insight.insights.tagAnalysis.topTags;
}

if (insight.insights.periodComparison) {
  // Comparison data available
  const change = insight.insights.periodComparison.changePercentage;
}
```

### Formatted Insights

The `formattedInsights` field contains a complete, human-readable version in Markdown format:

```typescript
const insight: AiInsight = { /* ... */ };

// This contains the full insights formatted as markdown
console.log(insight.formattedInsights);

// Example output:
// # Spending Insights for Week of Jan 15 - Jan 21
//
// ## Overview
// Total Spending: $1,234.56
// Transactions: 42
//
// ## Spending Patterns
// - Overall trend: Increasing
// - Most spending occurs on weekends
// ...
```

You can render this directly with a markdown renderer or parse the structured `insights` object for custom rendering.

## Access Control

### Premium Subscription Check

```typescript
// Check if user can access AI Checkin
const canAccessAiCheckin = (account: Account): boolean => {
  return account.subscriptionTier === 'premium' &&
         account.stripeSubscriptionStatus === 'active';
};
```

### Feature Enabled Check

```typescript
// Check if AI Checkin is enabled
const isAiCheckinEnabled = (account: Account): boolean => {
  return account.aiCheckinEnabled === true;
};
```

### Full Validation

```typescript
const canGenerateInsights = (account: Account): boolean => {
  return canAccessAiCheckin(account) && isAiCheckinEnabled(account);
};
```

When calling `triggerAiCheckin()`, the backend validates these conditions and returns appropriate errors if not met.

**Current Behavior**: When `aiCheckinEnabled === true`, users automatically receive insights at:
- **Weekly**: Every Monday at 9:00 AM UTC
- **Period-end**: When their spending period closes

There is currently no way to choose only one trigger type - enabling the feature enables both.

## Common Data Patterns

### Check for New Insights

```typescript
// Compare last check time with latest insight
const hasNewInsights = (
  lastCheckTime: Date,
  latestInsight: AiInsight
): boolean => {
  return latestInsight.generatedAt.toDate() > lastCheckTime;
};
```

### Get Date Range Display

```typescript
const getDateRangeDisplay = (insight: AiInsight): string => {
  if (insight.analysisType === 'weekly') {
    const start = insight.weekStartDate!.toDate().toLocaleDateString();
    const end = insight.weekEndDate!.toDate().toLocaleDateString();
    return `${start} - ${end}`;
  } else {
    return insight.periodName || 'Unknown Period';
  }
};
```

### Calculate Spending Change

```typescript
const getSpendingChange = (insight: AiInsight): string | null => {
  const comparison = insight.insights.periodComparison;
  if (!comparison?.changePercentage) return null;

  const change = comparison.changePercentage;
  const direction = change > 0 ? 'increased' : 'decreased';
  return `Spending ${direction} by ${Math.abs(change).toFixed(1)}%`;
};
```

## Email Notifications

When insights are generated, an email is automatically sent to the user:

- **Template**: `templates/emails/ai-checkin.md`
- **Content**: Contains the `formattedInsights` converted to HTML
- **Tracking**: `emailStatus` and `emailSentAt` fields track delivery

Users receive insights via email even if they don't open the app.

## Notes

- Insights are generated asynchronously - there may be a 10-30 second delay between triggering and completion
- Listen to Firestore for real-time updates rather than polling
- The `jobId` returned from `triggerAiCheckin()` can be used to track job status in `jobs/{jobId}` collection, but typically it's easier to listen for new documents in the `aiInsights` subcollection
- Historical insights are never deleted - they accumulate over time
- Each insight is immutable once created - updates create new documents
