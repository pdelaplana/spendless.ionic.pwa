import { IconContainer } from '@/components/shared';
import type { ISpend } from '@/domain/Spend';
import { getSpendIcon } from '@/utils/spendIconUtils';

interface SpendIconProps {
  spend: ISpend;
}

export const SpendIcon: React.FC<SpendIconProps> = ({ spend }) => {
  const { icon, bgColor, iconColor } = getSpendIcon(spend);

  return <IconContainer icon={icon} bgColor={bgColor} iconColor={iconColor} marginRight='3px' />;
};
