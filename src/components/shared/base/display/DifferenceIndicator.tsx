import { IonIcon } from '@ionic/react';
import { arrowDown, arrowUp } from 'ionicons/icons';
import type React from 'react';
import styled from 'styled-components';

const StyledDifferenceIndicator = styled.span<{ increase: boolean }>`
  font-size: 14px;
  color: ${(props) => (props.increase ? 'var(--ion-color-danger)' : 'var(--ion-color-success)')};
  display: inline-flex;
  align-items: center;
`;

interface DifferenceIndicatorProps {
  increase: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const DifferenceIndicator: React.FC<DifferenceIndicatorProps> = ({
  increase,
  className,
  size = 'medium',
}) => {
  const iconSize = size === 'small' ? '12px' : size === 'large' ? '18px' : '14px';

  return (
    <StyledDifferenceIndicator
      increase={increase}
      className={className}
      style={{ fontSize: iconSize }}
    >
      <IonIcon icon={increase ? arrowUp : arrowDown} style={{ fontSize: iconSize }} />
    </StyledDifferenceIndicator>
  );
};

export default DifferenceIndicator;
