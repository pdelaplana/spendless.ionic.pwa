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
        want: 'Desires',
        culture: 'Growth',
        unexpected: 'Surprises',
      },
      deleteSpend: 'Delete Spending',
      deleteSpendMessage: 'Are you sure you want to delete this spending?',
      futureSpending: 'Scheduled Spending',
      noSpending: 'No spending recorded for this period',
      noSpendingDescription: 'You can add spending by clicking the button below.',
      viewingClosedPeriodMessage:
        'You are viewing a previous spending period. Close to return current period.',
      loadMore: 'Load More',
      noPeriodSelected: 'No period selected',
      tapToCreatePeriod: 'Tap to create a new period',
      activePeriod: 'Active',
      closedPeriod: 'Closed',
      switchPeriod: 'Switch period',
      currentPeriod: 'Current period',
      to: 'to',
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
    },
    meta: {
      title: '{{title}} - {{appName}}',
      defaultTitle: '{{appName}} - A mindful spending tracker',
    },
  },
};
