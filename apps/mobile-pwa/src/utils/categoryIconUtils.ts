import type { SpendCategory } from '@/domain/Spend';
import {
  bulbOutline,
  cafeOutline,
  cardOutline,
  giftOutline,
  heartOutline,
  homeOutline,
  libraryOutline,
  peopleOutline,
  receiptOutline,
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
        icon: receiptOutline,
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
    case 'rituals':
      return {
        icon: cafeOutline,
        bgColor: 'rgba(249, 115, 22, 0.1)', // Orange background
        iconColor: '#F97316', // Orange icon
      };
    case 'connections':
      return {
        icon: peopleOutline,
        bgColor: 'rgba(236, 72, 153, 0.1)', // Pink background
        iconColor: '#EC4899', // Pink icon
      };
    default:
      return {
        icon: cardOutline,
        bgColor: 'rgba(107, 114, 128, 0.1)', // Gray background
        iconColor: '#6B7280', // Gray icon
      };
  }
};
