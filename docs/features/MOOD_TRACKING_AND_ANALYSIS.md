# Mood Tracking and Analysis Feature

## Overview
The Mood Tracking and Analysis feature is designed to help users understand the emotional drivers behind their spending habits. By capturing the user's emotional state at the time of purchase and providing reflective visualizations, the app encourages more mindful financial decisions.

---

## User Experience

### 1. Emotional Awareness in Transactions
When adding or editing a transaction, users are presented with a new **Emotional Awareness** section. This section encourages a brief moment of reflection:
- **Mood Selection**: Users can select from six emotional states: Happy (😊), Stressed (😰), Tired (😴), Sad (😔), Angry (😡), and Neutral (😐).
- **1-Tap Context Suggestions**: Based on the selected mood, a list of suggested contextual phrases (e.g., "Socializing", "Treating myself", "Stress relief") appears. Tapping these chips instantly appends the text to the transaction's notes.
- **Custom Contexts**: Users can add their own personal phrases by tapping the "+" icon. These phrases are saved to their account and reappear whenever the same mood is selected in the future.

### 2. Mood Analysis Dashboard
A dedicated dashboard provides deep insights into how emotions correlate with spending:
- **Interactive Pie Chart**: A high-level view of spending totals per mood.
- **Drill-Down Capability**: Users can tap any mood segment (e.g., "Positive") to see a breakdown of the specific contexts (e.g., "Grateful" vs "Excited") that drove those costs.
- **Visual Feedback**: The chart uses a brand-aligned color system (Blue for Positive, Orange/Red for Negative, Gray for Neutral) and includes smooth animations for a premium feel.

### 3. Smart Insights
The **Mood Insights Card** automatically highlights key patterns:
- **Primary Spending Driver**: Identifies the mood responsible for the highest total spend.
- **Impulse Alerts**: Warns users if a high percentage of their spending is linked to negative emotions like stress or anger.
- **Averages**: Compares average purchase amounts across different moods.

---

## Technical Architecture

### Data Models
The feature introduces changes to both the `Spend` and `Account` domains:

#### `ISpend`
Added `emotionalContext` to store the selected phrases for a specific transaction.
```typescript
interface ISpend {
  // ...
  emotionalState?: string;     // e.g., 'happy'
  emotionalContext?: string[]; // e.g., ['Socializing', 'Grateful']
  // ...
}
```

#### `IAccount`
Added `customEmotionalContexts` to store user-defined phrases per mood.
```typescript
interface IAccount {
  // ...
  customEmotionalContexts?: Record<string, string[]>;
  // ...
}
```

### Component Hierarchy
- `MoodAnalysisPage`: Main layout container with loading states and navigation.
  - `MoodSpendingChart`: Interactive Chart.js (Pie) implementation with custom drill-down state.
  - `MoodInsightsCard`: Logic-heavy component that calculates totals, averages, and alerts from the spending array.
- `EmotionalAwarenessSection`: Form component used in `SpendModal`.
  - Manages the synchronization between context chips and the `notes` field.

### Feature Logic
- **Notes Sync**: When a context chip is toggled, it is added/removed from the `emotionalContext` array *and* appended to/removed from the `notes` textarea using a regex-based replacement to maintain note formatting.
- **Aggregation**: The `MoodSpendingChart` uses `useMemo` to aggregate spending data into mood-based totals, filtering out future/scheduled items to ensure historical accuracy.
- **Drill-Down**: Managed via a local `selectedMood` state. When set, the chart dataset swaps from mood-based totals to context-based totals for that specific mood.

---

## Training and Education

### Key Messaging for Users
- "Stop spending on autopilot. Understand the 'why' behind the 'buy'."
- "Personalize your experience: Add your own reasons and see them reflected in your weekly trends."
- "Visual clarity: See exactly how much stress is costing you."

### Release Highlights
- **Mindful Logging**: Added mood selectors and quick-tap reasons to the spend modal.
- **Enhanced Analysis**: New "Mood Analysis" view available under Insights.
- **Customization**: Your personal reasons are now saved and suggested automatically.

---

## Future Improvements
- **Trend Comparison**: Compare mood-based spending over different months.
- **Correlation with Categories**: See if certain categories (e.g., "Food & Drink") are more susceptible to emotional spending.
- **Proactive Notifications**: Insight alerts pushed to the home screen when negative-emotion spending reaches a specific threshold.
