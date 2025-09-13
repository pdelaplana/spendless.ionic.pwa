import type { SpendCategory } from '@/domain/Spend';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import {
  basketOutline,
  cardOutline,
  colorPaletteOutline,
  sparklesOutline,
  walletOutline,
} from 'ionicons/icons';
import styled from 'styled-components';

const IconContainer = styled.div<{ bgColor: string; iconColor: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${designSystem.borderRadius.lg};
  background: ${(props) => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${designSystem.spacing.sm};
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  ion-icon {
    font-size: 20px;
    color: ${(props) => props.iconColor};
  }
`;

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

  return (
    <IconContainer bgColor={bgColor} iconColor={iconColor}>
      <IonIcon icon={icon} />
    </IconContainer>
  );
};
