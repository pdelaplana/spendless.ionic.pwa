/**
 * Spendless Brand Voice & Messaging Guidelines
 *
 * Based on the brand identity system, this file defines the personality,
 * tone, and messaging patterns that should be used throughout the application.
 */

export const brandVoice = {
  /**
   * Brand Personality Traits
   * These characteristics should be reflected in all user-facing communications
   */
  personality: [
    'encouraging', // Supportive, not judgmental about spending habits
    'clear', // Simple, jargon-free financial guidance
    'empowering', // Puts users in control of their financial journey
    'trustworthy', // Reliable, secure, transparent about data
    'optimistic', // Focused on progress and positive outcomes
  ],

  /**
   * Positive Tone Examples
   * Use these patterns for success messages and positive feedback
   */
  toneExamples: {
    positive: [
      "You're $25 under budget this week! Keep up the great progress.",
      'Small steps lead to big financial wins.',
      'Great job staying on track with your spending goals!',
      "You've saved $150 this month - that's fantastic progress!",
      'Your mindful spending habits are really paying off.',
    ],

    guidance: [
      "Let's set a spending threshold that works for your lifestyle.",
      'Consider adjusting your budget to better match your needs.',
      "Here's a personalized tip to help you save more this month.",
      "Your spending pattern shows you're doing great with essentials.",
      'Try setting a small goal to build momentum.',
    ],

    encouragement: [
      'Every dollar saved is progress toward your goals.',
      "Building better financial habits takes time - you're doing well.",
      'Your awareness of spending patterns is the first step to success.',
      'Focus on progress, not perfection.',
      'You have the power to make positive financial changes.',
    ],
  },

  /**
   * Tones to Avoid
   * These examples show what NOT to do - they're judgmental, complex, or fear-based
   */
  avoid: [
    "You've overspent again. This is concerning.",
    'Failure to control spending will result in financial ruin.',
    'Optimize your financial portfolio using our advanced algorithms.',
    "You're terrible with money management.",
    'Your spending habits are destructive.',
    'Implement sophisticated budgeting methodologies.',
    'Execute strategic financial optimization protocols.',
  ],

  /**
   * Message Categories
   * Different types of messages and their appropriate tone
   */
  messageCategories: {
    onboarding: {
      tone: 'welcoming and encouraging',
      examples: [
        "Welcome to Spendless! Let's build better spending habits together.",
        "Ready to take control of your financial wellness? Let's start with the basics.",
        "Your journey to mindful spending begins now. We're here to help every step of the way.",
      ],
    },

    progress: {
      tone: 'celebrating and motivating',
      examples: [
        "You've stayed within your budget for 3 days straight!",
        'Your spending awareness has improved 40% this month.',
        "Look how far you've come - 2 weeks of mindful spending!",
      ],
    },

    challenges: {
      tone: 'supportive and solution-focused',
      examples: [
        "Overspending happens. Let's learn from this and adjust your goals.",
        'Your spending was higher this week. What changes would feel manageable?',
        'Every setback is an opportunity to refine your approach.',
      ],
    },

    education: {
      tone: 'clear and helpful',
      examples: [
        'Tip: Setting smaller, achievable goals helps build lasting habits.',
        'Did you know? Tracking spending for just one week can increase awareness by 60%.',
        'Research shows that mindful spending reduces financial stress.',
      ],
    },

    errors: {
      tone: 'helpful and reassuring',
      examples: [
        "Something went wrong, but your data is safe. Let's try that again.",
        "We couldn't complete that action. No worries - your progress is saved.",
        "Technical hiccup! Your information is secure and we're working on it.",
      ],
    },
  },

  /**
   * Formatting Guidelines
   */
  formatting: {
    headlines: {
      style: 'Clear and benefit-focused',
      examples: [
        'Take Control of Your Spending',
        'Build Better Financial Habits',
        'Your Path to Financial Wellness',
      ],
      avoid: [
        'Advanced Financial Management Solutions',
        'Optimize Your Monetary Allocation Strategies',
        'Stop Wasting Money Immediately',
      ],
    },

    buttons: {
      style: 'Action-oriented and positive',
      examples: ['Get Started', 'Set My Goals', 'Track My Progress', 'Continue Journey'],
      avoid: ['Execute Financial Plan', 'Implement Budget Protocol', "Don't Overspend"],
    },

    notifications: {
      style: 'Timely and encouraging',
      examples: [
        'Great choice on that mindful purchase!',
        "You're 80% within your weekly goal.",
        'Time for a quick spending check-in.',
      ],
      avoid: [
        'Budget violation detected.',
        'Spending threshold exceeded - take immediate action.',
        'Financial discipline required.',
      ],
    },
  },

  /**
   * Inclusive Language Guidelines
   */
  inclusivity: {
    principles: [
      'Use "you" and "your" to make it personal',
      'Avoid financial jargon and complex terminology',
      'Acknowledge different financial situations without judgment',
      'Use gender-neutral language throughout',
      'Focus on progress rather than perfection',
    ],

    examples: {
      inclusive: [
        'Your financial journey is unique to you.',
        "Every person's relationship with money is different.",
        'Find an approach that works for your lifestyle.',
      ],
      avoid: [
        'Everyone should be able to save 20% of their income.',
        'Smart people always track their expenses.',
        'Successful individuals never overspend.',
      ],
    },
  },
} as const;

/**
 * Helper function to get examples for a specific message category
 */
export const getMessageExamples = (category: keyof typeof brandVoice.messageCategories) => {
  return brandVoice.messageCategories[category];
};

/**
 * Helper function to check if a message aligns with brand voice
 */
export const isAlignedWithBrandVoice = (message: string): boolean => {
  const messageLower = message.toLowerCase();

  // Check for words/phrases to avoid
  const avoidWords = [
    'failure',
    'terrible',
    'destructive',
    'concerning',
    'violation',
    'execute',
    'implement',
    'optimize',
    'protocol',
    'algorithm',
  ];

  const hasNegativeWords = avoidWords.some((word) => messageLower.includes(word));

  if (hasNegativeWords) {
    return false;
  }

  // Check for positive indicators
  const positiveIndicators = [
    'progress',
    'great',
    'well done',
    'keep up',
    'you can',
    'lets',
    'together',
    'journey',
    'growing',
    'improving',
    'mindful',
  ];

  const hasPositiveIndicators = positiveIndicators.some((word) => messageLower.includes(word));

  return hasPositiveIndicators;
};

export default brandVoice;
