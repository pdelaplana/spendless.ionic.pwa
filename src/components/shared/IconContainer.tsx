import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import type React from 'react';
import styled from 'styled-components';

const StyledIconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    !['bgColor', 'iconColor', 'size', 'marginRight', 'marginTop'].includes(prop),
})<{
  bgColor: string;
  iconColor: string;
  size?: number;
  marginRight?: string;
  marginTop?: string;
}>`
  width: ${(props) => props.size || 44}px;
  height: ${(props) => props.size || 44}px;
  border-radius: ${designSystem.borderRadius.lg};
  background: ${(props) => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${(props) => props.marginRight || designSystem.spacing.sm};
  margin-top: ${(props) => props.marginTop || '8px'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  ion-icon {
    font-size: ${(props) => (props.size ? props.size * 0.45 : 20)}px;
    color: ${(props) => props.iconColor};
  }
`;

interface IconContainerProps {
  icon: string;
  bgColor: string;
  iconColor: string;
  size?: number;
  marginRight?: string;
  marginTop?: string;
  ariaHidden?: boolean;
}

export const IconContainer: React.FC<IconContainerProps> = ({
  icon,
  bgColor,
  iconColor,
  size,
  marginRight,
  marginTop,
  ariaHidden = true,
}) => {
  return (
    <StyledIconContainer
      bgColor={bgColor}
      iconColor={iconColor}
      size={size}
      marginRight={marginRight}
      marginTop={marginTop}
    >
      <IonIcon icon={icon} aria-hidden={ariaHidden} />
    </StyledIconContainer>
  );
};
