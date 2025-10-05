import { businessOutline, cardOutline, cashOutline, walletOutline } from 'ionicons/icons';

export interface WalletIconConfig {
  icon: string;
  bgColor: string;
  iconColor: string;
}

/**
 * Returns the icon configuration for a wallet based on its name
 * Used consistently across wallet components to display context-appropriate icons
 */
export const getWalletIcon = (walletName: string): WalletIconConfig => {
  const lowerName = walletName.toLowerCase();

  // Bank or financial institution - use business icon
  const bankKeywords = [
    'bank',
    'chase',
    'wells fargo',
    'bofa',
    'bank of america',
    'citi',
    'citibank',
    'hsbc',
    'barclays',
    'santander',
    'capital one',
    'ally',
    'usaa',
    'pnc',
    'truist',
    'td bank',
    'bmo',
    'scotiabank',
    'rbc',
  ];
  if (bankKeywords.some((keyword) => lowerName.includes(keyword))) {
    return {
      icon: businessOutline,
      bgColor: 'rgba(107, 114, 128, 0.1)', // Gray background
      iconColor: '#6B7280', // Gray icon
    };
  }

  // Credit card or card - use card icon
  const cardKeywords = ['card', 'credit', 'debit', 'visa', 'mastercard', 'amex', 'discover'];
  if (cardKeywords.some((keyword) => lowerName.includes(keyword))) {
    return {
      icon: cardOutline,
      bgColor: 'rgba(107, 114, 128, 0.1)', // Gray background
      iconColor: '#6B7280', // Gray icon
    };
  }

  // Cash - use cash icon
  const cashKeywords = ['cash', 'money', 'bills', 'coins'];
  if (cashKeywords.some((keyword) => lowerName.includes(keyword))) {
    return {
      icon: cashOutline,
      bgColor: 'rgba(107, 114, 128, 0.1)', // Gray background
      iconColor: '#6B7280', // Gray icon
    };
  }

  // Default - use wallet icon
  return {
    icon: walletOutline,
    bgColor: 'rgba(107, 114, 128, 0.1)', // Gray background
    iconColor: '#6B7280', // Gray icon
  };
};
