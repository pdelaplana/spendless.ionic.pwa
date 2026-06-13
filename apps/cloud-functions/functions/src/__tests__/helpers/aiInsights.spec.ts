import { parseAiResponse } from '../../helpers/aiInsights';

describe('parseAiResponse - Key Takeaway', () => {
  it('should extract key takeaway from AI response', () => {
    const mockResponse = `
## 0. KEY TAKEAWAY
**Key Takeaway:** Hey, John. One thing I noticed is you spent $240 on dining. Let's keep this to a minimum!

## 1. SPENDING PATTERNS & TRENDS
**Summary:** Spending was stable
**Trends:**
- Trend 1
    `;

    const result = parseAiResponse(mockResponse, 'USD');
    expect(result.keyTakeaway).toContain('Hey, John');
    expect(result.keyTakeaway).toContain('$240');
  });

  it('should provide fallback if key takeaway is missing', () => {
    const mockResponse = '## 1. SPENDING PATTERNS & TRENDS\n**Summary:** Spending was stable';

    const result = parseAiResponse(mockResponse, 'USD');
    expect(result.keyTakeaway).toBe('Hey! Keep up the great work tracking your spending!');
  });

  it('should handle key takeaway with conversational tone', () => {
    const mockResponse = `
## 0. KEY TAKEAWAY
**Key Takeaway:** Patrick, great work on lessening your spending on merchandise! Let's maintain this rate of spending.

## 1. SPENDING PATTERNS & TRENDS
**Summary:** Spending was stable
    `;

    const result = parseAiResponse(mockResponse, 'USD');
    expect(result.keyTakeaway).toContain('Patrick');
    expect(result.keyTakeaway).toContain('great work');
    expect(result.keyTakeaway).toContain('maintain');
  });

  it('should handle multi-sentence key takeaways', () => {
    const mockResponse = `
## 0. KEY TAKEAWAY
**Key Takeaway:** Hi Sarah! Your Essentials are looking solid. The one area to watch is weekend spending - it jumped to $180 this week.

## 1. SPENDING PATTERNS & TRENDS
**Summary:** Spending was stable
    `;

    const result = parseAiResponse(mockResponse, 'USD');
    expect(result.keyTakeaway).toContain('Hi Sarah!');
    expect(result.keyTakeaway).toContain('$180');
  });

  it('should handle key takeaway with special characters', () => {
    const mockResponse = `
## 0. KEY TAKEAWAY
**Key Takeaway:** You're crushing it! 💪 Cut $120 from dining to save 20%.

## 1. SPENDING PATTERNS & TRENDS
**Summary:** Spending was stable
    `;

    const result = parseAiResponse(mockResponse, 'USD');
    expect(result.keyTakeaway).toContain("You're");
    expect(result.keyTakeaway).toContain('$120');
  });

  it('should place keyTakeaway as first field in result', () => {
    const mockResponse = `
## 0. KEY TAKEAWAY
**Key Takeaway:** Great job tracking!

## 1. SPENDING PATTERNS & TRENDS
**Summary:** Stable
**Trends:**
- Test trend

## 2. CATEGORY BREAKDOWN
**Top Categories:**
- Essentials: $100 (50% of total)

## 3. ACTIONABLE RECOMMENDATIONS
**Recommendations:**
1. Keep tracking
    `;

    const result = parseAiResponse(mockResponse, 'USD');
    const keys = Object.keys(result);
    expect(keys[0]).toBe('keyTakeaway');
    expect(result.keyTakeaway).toBe('Great job tracking!');
  });
});
