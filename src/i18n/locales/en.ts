import { auth } from '@/infrastructure/firebase';

export default {
  translation: {
    appName: 'Mindful Spending Tracker',
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      toast: {
        info: 'Information',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
      },
      errors: {
        default: 'An error occurred. Please try again later.',
        signinFailed: 'Sign in failed. Please check your credentials or contact support.',
      },
    },
    server: {
      errors: {
        auth: {
          'auth/expired-action-code':
            'The password reset code has expired. Please request a new one.',
          'auth/invalid-action-code':
            'The password reset code is invalid. Please request a new one.',
          'auth/user-disabled': 'This user account has been disabled.',
          'auth/user-not-found': 'User account not found.',
          'auth/weak-password': 'The password is too weak. Please use a stronger password.',
          'auth/email-already-in-use': 'This email is already in use. Please use a different one.',
          'auth/popup-blocked':
            'Popup was blocked by your browser. Please allow popups for this site.',
          'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
          'auth/cancelled-popup-request': 'Only one sign-in popup can be open at a time.',
          'auth/account-exists-with-different-credential':
            'An account already exists with the same email address but different sign-in method.',
        },
      },
    },
    auth: {
      signout: {
        title: 'Sign out',
        message: 'Are you sure you want to sign out?',
      },
    },
    spending: {
      categories: {
        need: 'Essentials',
        want: 'Rewards',
        rituals: 'Rituals',
        culture: 'Growth',
        connections: 'Connections',
        unexpected: 'Unexpected',
      },
      deleteSpend: 'Delete Spending',
      deleteSpendMessage: 'Are you sure you want to delete this spending?',
      futureSpending: 'Scheduled Spending',
      noSpending: 'No spending recorded for this period',
      noSpendingDescription: 'You can add spending by clicking the button below.',
      viewingClosedPeriodMessage:
        'You are viewing a previous spending period. Close to return current period.',
      loadMore: 'Load More',
      loadingMore: 'Loading more...',
      newSpend: 'New Spend',
      addFirstSpend: 'Add Your First Spending',
      noPeriodSelected: 'No period selected',
      tapToCreatePeriod: 'Tap to create a new period',
      activePeriod: 'Active',
      closedPeriod: 'Closed',
      switchPeriod: 'Switch period',
      currentPeriod: 'Current period',
      to: 'to',
      periodClosed: 'Period closed',
      lastDay: 'Last day',
      dayRemaining: '{{count}} day remaining',
      daysRemaining: '{{count}} days remaining',
      spendPerDay: 'Available per day',
      actions: {
        title: 'Period Actions',
        startNewPeriod: 'Start New Period',
        editPeriod: 'Edit Current Period',
      },
      modal: {
        details: {
          title: 'Spending Details',
        },
        mindfulSection: {
          title: 'Mindful Moment',
        },
      },
    },
    periods: {
      title: 'Spending Periods',
      description: '{{startDate}} to {{endDate}}',
      noPeriods: 'No spending periods found.',
      currentPeriod: 'Current Period',
      pastPeriods: 'Past Periods',
      noCurrentPeriod: 'No active period',
      noPastPeriods: 'No past periods found.',
      empty: {
        description: 'Start tracking your spending by creating your first period.',
      },
    },
    wallet: {
      noWalletSelected: 'No wallet selected',
      selectWalletToViewSpending: 'Please select a wallet to view spending details.',
      noSpendingInWallet: 'No spending in this wallet',
      noSpendingInWalletDescription:
        'Start tracking expenses in {{walletName}} by adding your first spending entry.',
      backToSpending: 'Back to Spending',
      editWallet: 'Edit Wallet',
    },
    insights: {
      title: 'Insights',
      description: 'Explore your spending to see key insights and trends',

      // Premium section header
      premiumInsights: 'Premium Insights',
      standardInsights: 'Standard Insights',

      spendVsBudget: {
        title: 'Spend vs Budget',
        subtitle: 'Track your spending against budgets across periods',
      },

      aiCheckinCard: {
        title: 'Check In with Your Financial Coach',
        description: 'Get personalized AI insights on your spending',
        viewInsights: 'Checkin Now',
      },

      aiInsights: {
        title: 'Details',
        checkinsTitle: 'Check Ins',
        subtitle: 'Personalized AI-powered spending insights',
        premiumRequired: 'Premium Feature',

        // Actions
        generateNew: 'Generate New Insight',
        generating: 'Generating insights...',
        generatingMessage: 'This may take 10-30 seconds',
        enableFeature: 'Enable Intelligent Spending',
        disableFeature: 'Disable Intelligent Spending',
        lastGenerated: 'Last generated {{date}}',

        // Status
        featureStatus: 'AI Checkin Status',
        enabled: 'Enabled',
        disabled: 'Disabled',

        // Filter types
        all: 'All',
        weekly: 'Weekly',
        periodEnd: 'Period End',

        // Empty states
        noInsights: 'No insights yet',
        noInsightsDescription: 'Generate your first insight or enable automatic insights',
        featureDisabled: 'AI Checkin is disabled',
        featureDisabledDescription: 'Enable AI Checkin to receive weekly and period-end insights',
        insufficientData: 'Not enough data',
        insufficientDataDescription: 'Add more spending transactions to generate insights',

        // Settings
        featureExplanation:
          'When enabled, you will receive AI-generated insights weekly (every Monday) and at the end of each spending period.',
        confirmDisable: 'Are you sure you want to disable AI Checkin?',

        // Detail sections
        overview: 'Overview',
        totalSpending: 'Total Spending Analyzed',
        transactionCount: 'Transactions',
        categoriesAnalyzed: 'Categories',
        patterns: 'Spending Patterns',
        summary: 'Summary',
        spendingPatterns: 'Spending Patterns',
        overallTrend: 'Overall Trend',
        recurringSpending: 'Recurring Spending',
        dayPatterns: 'Day of Week Patterns',
        unusualPurchases: 'Unusual Purchases',
        categories: 'Categories',
        categoryBreakdown: 'Category Breakdown',
        topCategories: 'Top Categories',
        tags: 'Tags',
        tagAnalysis: 'Tag Analysis',
        topTags: 'Top Tags',
        tagCorrelations: 'Tag Correlations',
        tagRecommendations: 'Tag Recommendations',
        comparison: 'Period Comparison',
        periodComparison: 'Period Comparison',
        previousPeriod: 'Previous Period',
        currentPeriod: 'Current Period',
        changePercentage: 'Change',
        improvements: 'Improvements',
        concerns: 'Concerns',
        recommendations: 'Actionable Recommendations',
        metadata: 'Analysis Metadata',
        categoriesAnalyzedList: 'Categories Analyzed',
        tagsAnalyzedList: 'Tags Analyzed',
        aiModel: 'AI Model',
        tokensUsed: 'Tokens Used',
        emailStatus: 'Email Status',

        // Trends
        increasing: 'Increasing',
        decreasing: 'Decreasing',
        stable: 'Stable',

        // Feature description (free users)
        featureDescriptionTitle: 'AI-Powered Spending Insights',
        featureDescriptionSubtitle: 'Get personalized insights with Google Gemini AI',
        benefitsList: {
          personalizedAnalysis: 'Personalized spending analysis',
          weeklyInsights: 'Weekly and period-end insights',
          recommendations: 'AI-powered recommendations',
          categoryBreakdown: 'Category and tag breakdowns',
          historicalTracking: 'Historical insight tracking',
        },
        upgradeNow: 'Upgrade to Premium',

        // Errors
        generationFailed: 'Failed to generate insights',
        rateLimited: 'Wait {{minutes}} minutes before generating again',
        fetchFailed: 'Failed to load insights',
      },
    },
    meta: {
      title: '{{title}} - {{appName}}',
      defaultTitle: '{{appName}} - A mindful spending tracker',
    },
    subscription: {
      // Tier names
      essentialsTier: 'Spendless Essentials',
      premiumTier: 'Spendless Premium',

      // Descriptions
      essentialsDescription: 'Free plan with 30 day history',

      // Premium benefits
      premiumBenefitsTitle: 'Premium Benefits',
      benefits: {
        unlimitedHistory: 'Unlimited spending history',
        aiInsights: 'AI-powered spending insights with Google Gemini',
        unlimitedWallets: 'Unlimited wallets',
        advancedAnalytics: 'Advanced analytics and insights',
      },

      // Upgrade buttons
      upgradeMonthly: 'Upgrade Monthly ($8.99/mo)',
      upgradeAnnual: 'Upgrade Annual ($74.99/yr)',
      upgradeAnnualSave: 'Upgrade Annual (Save 30%)',

      // Management
      manageSubscription: 'Manage Subscription',

      // Expiration
      expiresOn: 'Expires on {{date}}',
      renewsOn: 'Renews on {{date}}',
      subscriptionEndsOn: 'Subscription ends on {{date}}',

      // Errors
      configurationError: 'Stripe configuration error. Please contact support.',
      upgradeError: 'Failed to create checkout session. Please try again.',
      portalError: 'Failed to open subscription portal. Please try again.',

      // Success page
      success: {
        title: 'Payment Successful',
        heading: 'Welcome to Premium!',
        subtitle: 'Your subscription is now active',
        whatHappensNext: 'What happens next?',
        confirmationMessage:
          'Your payment was successful and your premium subscription is now active.',
        benefit1: 'Unlimited spending history',
        benefit2: 'Unlimited wallets',
        benefit3: 'Advanced analytics and insights',
        benefit4: 'Priority support',
        note: 'Note:',
        activationNote:
          'Your account has been upgraded automatically. You can start enjoying premium features right away.',
        manageTitle: 'Manage Your Subscription',
        manageDescription:
          'You can manage your subscription, update payment methods, or view invoices in Settings.',
        goToSettings: 'Go to Settings',
        returnToApp: 'Return to App',
        thankYou: 'Thank you for supporting Spendless!',
      },

      // Cancel page
      cancel: {
        title: 'Subscription Canceled',
        heading: 'Subscription Not Completed',
        subtitle: 'No charges were made',
        message: 'You canceled the subscription process. No payment was taken.',
        noCharge: 'No Charge Made',
        noChargeMessage:
          'You canceled the subscription process. No payment was taken and your card was not charged.',
        whyUpgrade: 'Why Upgrade to Premium?',
        premiumBenefits:
          'Spendless Premium unlocks powerful features to help you manage your spending better:',
        benefit1: '📊 Unlimited spending history - Track as far back as you want',
        benefit2: '💼 Unlimited wallets - Organize multiple payment methods',
        benefit3: '📈 Advanced analytics and insights',
        readyToUpgrade: 'Ready to upgrade?',
        whatNow: 'What would you like to do?',
        tryAgain: 'Try Again',
        returnToApp: 'Return to App',
        questions: 'Have questions about Premium?',
        contactSupport: 'Contact us at support@getspendless.com',
        stillInterested:
          'Still interested in premium features? You can upgrade anytime from Settings.',
      },
    },
    pwa: {
      ios: {
        title: 'Install Spendless',
        description: 'Add to your home screen for quick access and a better experience.',
        step1: 'Tap the Share button',
        step2: "Scroll and tap 'Add to Home Screen'",
        dismiss: 'Not Now',
      },
    },
  },
};
