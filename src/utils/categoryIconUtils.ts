import type { SpendCategory } from '@/domain/Spend';
import {
  alertOutline,
  bulbOutline,
  cardOutline,
  giftOutline,
  libraryOutline,
  umbrellaOutline,
} from 'ionicons/icons';

export interface CategoryIconConfig {
  icon: string;
  bgColor: string;
  iconColor: string;
}

/**
 * Returns the icon configuration for a spend category
 * Used consistently across CategorySection and SpendIcon components
 */
export const getCategoryIcon = (category: SpendCategory): CategoryIconConfig => {
  switch (category) {
    case 'need':
      return {
        icon: bulbOutline,
        bgColor: 'rgba(59, 130, 246, 0.1)', // Blue background
        iconColor: '#3B82F6', // Blue icon
      };
    case 'want':
      return {
        icon: giftOutline,
        bgColor: 'rgba(168, 85, 247, 0.1)', // Purple background
        iconColor: '#A855F7', // Purple icon
      };
    case 'culture':
      return {
        icon: libraryOutline,
        bgColor: 'rgba(34, 197, 94, 0.1)', // Green background
        iconColor: '#22C55E', // Green icon
      };
    case 'unexpected':
      return {
        icon: umbrellaOutline,
        bgColor: 'rgba(239, 68, 68, 0.1)', // Red background
        iconColor: '#EF4444', // Red icon
      };
    default:
      return {
        icon: cardOutline,
        bgColor: 'rgba(107, 114, 128, 0.1)', // Gray background
        iconColor: '#6B7280', // Gray icon
      };
  }
};
