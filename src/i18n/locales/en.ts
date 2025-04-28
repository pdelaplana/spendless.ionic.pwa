export default {
  translation: {
    appName: 'Miodful Spending Tracker',
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
        signinFailed: 'Sign in failed. Please check your credentials or contact support.',
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
        want: 'Wants',
        culture: 'Culture & Entertainment',
        unexpected: 'Unexpected Expenses',
      },
      deleteSpend: 'Delete Spending',
      deleteSpendMessage: 'Are you sure you want to delete this spending?',
      futureSpending: 'Scheduled Spending',
      noSpending: 'No spending recorded for this period',
      noSpendingDescription: 'You can add spending by clicking the button below.',
      viewingClosedPeriodMessage:
        'You are viewing a previous spending period. Close to return current period.',
      loadMore: 'Load More',
    },
    periods: {
      title: 'Spending Periods',
      description: '{{startDate}} to {{endDate}}',
      noPeriods: 'No spending periods found.',
    },
    meta: {
      title: '{{title}} - {{appName}}',
      defaultTitle: '{{appName}} - A mindful spending tracker',
    },
  },
};
