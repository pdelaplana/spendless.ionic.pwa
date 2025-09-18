import { IconContainer } from '@/components/shared';
import type { SpendCategory } from '@/domain/Spend';
import {
  basketOutline,
  cardOutline,
  colorPaletteOutline,
  sparklesOutline,
  walletOutline,
} from 'ionicons/icons';

interface SpendIconProps {
  category: SpendCategory;
}

export const SpendIcon: React.FC<SpendIconProps> = ({ category }) => {
  const getIconConfig = (category: string) => {
    switch (category) {
      case 'need':
        return {
          icon: walletOutline,
          bgColor: 'rgba(59, 130, 246, 0.1)', // Blue background
          iconColor: '#3B82F6', // Blue icon
        };
      case 'want':
        return {
          icon: basketOutline,
          bgColor: 'rgba(168, 85, 247, 0.1)', // Purple background
          iconColor: '#A855F7', // Purple icon
        };
      case 'culture':
        return {
          icon: colorPaletteOutline,
          bgColor: 'rgba(34, 197, 94, 0.1)', // Green background
          iconColor: '#22C55E', // Green icon
        };
      case 'unexpected':
        return {
          icon: sparklesOutline,
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

  const { icon, bgColor, iconColor } = getIconConfig(category);

  return <IconContainer icon={icon} bgColor={bgColor} iconColor={iconColor} />;
};
