import type React from 'react';
import { IonText } from '@ionic/react';
import styled from '@emotion/styled';

interface LetterIconProps {
  letter: string;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'default' | 'large';
  onClick?: () => void;
}

const IconContainer = styled.div<{
  backgroundColor: string;
  size: string;
}>`

 background-color: var(--ion-color-primary);

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${(props) => props.backgroundColor};
  width: ${(props) => {
    switch (props.size) {
      case 'small':
        return '24px';
      case 'large':
        return '40px';
      default:
        return '30px';
    }
  }};
  height: ${(props) => {
    switch (props.size) {
      case 'small':
        return '24px';
      case 'large':
        return '40px';
      default:
        return '30px';
    }
  }};
  font-size: ${(props) => {
    switch (props.size) {
      case 'small':
        return '12px';
      case 'large':
        return '20px';
      default:
        return '14px';
    }
  }};
  font-weight: 600;
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
`;

export const LetterIcon: React.FC<LetterIconProps> = ({
  letter,
  color = 'white',
  backgroundColor = 'var(--ion-color-primary)',
  size = 'default',
  onClick,
}) => {
  // Take only the first character if a longer string is provided
  const displayLetter = letter.charAt(0).toUpperCase();

  return (
    <IconContainer backgroundColor={backgroundColor} size={size} onClick={onClick}>
      <IonText style={{ color }}>{displayLetter}</IonText>
    </IconContainer>
  );
};

export default LetterIcon;
