import styled from '@emotion/styled';
import { IonButton, IonIcon } from '@ionic/react';
import type { ReactNode } from 'react';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export interface ButtonOption {
  key: string;
  label: string;
  icon?: string;
  onClick?: () => void;
}

interface HorizontalButtonGroupProps {
  options: ButtonOption[];
  selectedKey?: string;
  fill?: 'clear' | 'outline' | 'solid';
  color?: string;
  size?: 'small' | 'default' | 'large';
}

export const HorizontalButtonGroup: React.FC<HorizontalButtonGroupProps> = ({
  options,
  selectedKey,
  fill = 'outline',
  color = 'primary',
  size = 'default',
}) => {
  return (
    <ButtonContainer>
      {options.map((option) => (
        <IonButton
          key={option.key}
          fill={option.key === selectedKey ? 'solid' : fill}
          color={color}
          size={size}
          onClick={option.onClick}
        >
          {option.icon && <IonIcon icon={option.icon} slot='start' />}
          {option.label}
        </IonButton>
      ))}
    </ButtonContainer>
  );
};
