import type { SpendCategory } from '@/domain/Spend';
import { IonIcon } from '@ionic/react';
import {
  beerOutline,
  cashOutline,
  globe,
  libraryOutline,
  thunderstormOutline,
} from 'ionicons/icons';

interface SpendIconProps {
  category: SpendCategory;
}

export const SpendIcon: React.FC<SpendIconProps> = ({ category }) => {
  const renderIcon = (category: string) => {
    switch (category) {
      case 'need':
        return cashOutline;
      case 'want':
        return beerOutline;
      case 'culture':
        return libraryOutline;
      case 'unexpected':
        return thunderstormOutline;
      default:
        return globe;
    }
  };
  return <IonIcon icon={renderIcon(category)} slot='start' />;
};
