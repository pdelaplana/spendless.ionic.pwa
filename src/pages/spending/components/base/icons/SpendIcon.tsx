import { IconContainer } from '@/components/shared';
import type { SpendCategory } from '@/domain/Spend';
import { getCategoryIcon } from '@/utils';

interface SpendIconProps {
  category: SpendCategory;
}

export const SpendIcon: React.FC<SpendIconProps> = ({ category }) => {
  const { icon, bgColor, iconColor } = getCategoryIcon(category);

  return <IconContainer icon={icon} bgColor={bgColor} iconColor={iconColor} marginRight='3px' />;
};
