import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon } from '@ionic/react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: string;
  endIcon?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

const StyledButton = styled(IonButton)<{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
}>`
  --border-radius: ${designSystem.borderRadius.md};
  --padding-start: ${(props) => {
    switch (props.size) {
      case 'sm':
        return designSystem.spacing.md;
      case 'lg':
        return designSystem.spacing.xl;
      default:
        return designSystem.spacing.lg;
    }
  }};
  --padding-end: var(--padding-start);
  --padding-top: ${(props) => {
    switch (props.size) {
      case 'sm':
        return '8px';
      case 'lg':
        return '16px';
      default:
        return '12px';
    }
  }};
  --padding-bottom: var(--padding-top);
  
  font-size: ${(props) => {
    switch (props.size) {
      case 'sm':
        return designSystem.typography.fontSize.sm;
      case 'lg':
        return designSystem.typography.fontSize.lg;
      default:
        return designSystem.typography.fontSize.base;
    }
  }};
  
  font-weight: ${designSystem.typography.fontWeight.medium};
  min-height: ${(props) => {
    switch (props.size) {
      case 'sm':
        return '36px';
      case 'lg':
        return '52px';
      default:
        return '44px';
    }
  }};
  
  margin: ${designSystem.spacing.xs} 0;
  
  ${(props) =>
    props.fullWidth &&
    `
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  `}
  
  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          --background: ${designSystem.colors.primary[500]};
          --background-hover: ${designSystem.colors.primary[600]};
          --background-activated: ${designSystem.colors.primary[700]};
          --color: ${designSystem.colors.text.inverse};
          --box-shadow: ${designSystem.shadows.sm};
          
          &:hover {
            --box-shadow: ${designSystem.shadows.md};
          }
        `;
      case 'secondary':
        return `
          --background: ${designSystem.colors.gray[100]};
          --background-hover: ${designSystem.colors.gray[200]};
          --background-activated: ${designSystem.colors.gray[300]};
          --color: ${designSystem.colors.text.primary};
          --box-shadow: ${designSystem.shadows.sm};
        `;
      case 'outline':
        return `
          --background: transparent;
          --background-hover: ${designSystem.colors.primary[50]};
          --background-activated: ${designSystem.colors.primary[100]};
          --color: ${designSystem.colors.primary[500]};
          --border-width: 1px;
          --border-color: ${designSystem.colors.primary[500]};
          --border-style: solid;
        `;
      case 'ghost':
        return `
          --background: transparent;
          --background-hover: ${designSystem.colors.gray[100]};
          --background-activated: ${designSystem.colors.gray[200]};
          --color: ${designSystem.colors.text.primary};
          --box-shadow: none;
        `;
      default:
        return '';
    }
  }}
  
  transition: all 0.2s ease;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${designSystem.spacing.sm};
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  className,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      fill='solid'
      className={className}
    >
      <ButtonContent>
        {loading && <LoadingSpinner />}
        {!loading && startIcon && <IonIcon icon={startIcon} />}
        {children}
        {!loading && endIcon && <IonIcon icon={endIcon} />}
      </ButtonContent>
    </StyledButton>
  );
};

// Specialized button for Zip-style FAB (Floating Action Button)
interface FABProps {
  icon: string;
  onClick: () => void;
  color?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  className?: string;
}

const StyledFAB = styled(IonButton)<{
  size: 'md' | 'lg';
}>`
  --border-radius: 50%;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  
  width: ${(props) => (props.size === 'lg' ? '64px' : '56px')};
  height: ${(props) => (props.size === 'lg' ? '64px' : '56px')};
  
  --background: ${designSystem.colors.primary[500]};
  --background-hover: ${designSystem.colors.primary[600]};
  --background-activated: ${designSystem.colors.primary[700]};
  --color: ${designSystem.colors.text.inverse};
  --box-shadow: ${designSystem.shadows.lg};
  
  ion-icon {
    font-size: ${(props) => (props.size === 'lg' ? '28px' : '24px')};
  }
  
  &:hover {
    --box-shadow: ${designSystem.shadows.xl};
    transform: translateY(-2px);
  }
  
  transition: all 0.2s ease;
`;

export const FAB: React.FC<FABProps> = ({ icon, onClick, size = 'md', className }) => {
  return (
    <StyledFAB size={size} onClick={onClick} fill='solid' className={className}>
      <IonIcon icon={icon} />
    </StyledFAB>
  );
};

// Button Group for Zip-style action collections
interface ButtonGroupProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StyledButtonGroup = styled.div<{
  direction: 'horizontal' | 'vertical';
  spacing: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  flex-direction: ${(props) => (props.direction === 'vertical' ? 'column' : 'row')};
  gap: ${(props) => {
    switch (props.spacing) {
      case 'sm':
        return designSystem.spacing.sm;
      case 'lg':
        return designSystem.spacing.lg;
      default:
        return designSystem.spacing.md;
    }
  }};
  
  ${(props) =>
    props.direction === 'horizontal' &&
    `
    & > * {
      flex: 1;
    }
  `}
`;

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  direction = 'horizontal',
  spacing = 'md',
  className,
}) => {
  return (
    <StyledButtonGroup direction={direction} spacing={spacing} className={className}>
      {children}
    </StyledButtonGroup>
  );
};
