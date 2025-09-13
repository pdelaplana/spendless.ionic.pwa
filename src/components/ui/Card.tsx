import { designSystem } from '@/theme/designSystem';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const StyledCard = styled.div<{
  variant: 'default' | 'elevated' | 'outlined';
  padding: 'sm' | 'md' | 'lg';
  clickable: boolean;
}>`
  background: ${designSystem.colors.surface};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${(props) => {
    switch (props.padding) {
      case 'sm':
        return designSystem.spacing.md;
      case 'md':
        return designSystem.spacing.lg;
      case 'lg':
        return designSystem.spacing.xl;
      default:
        return designSystem.spacing.lg;
    }
  }};
  
  ${(props) => {
    switch (props.variant) {
      case 'elevated':
        return `
          box-shadow: ${designSystem.shadows.lg};
          border: none;
        `;
      case 'outlined':
        return `
          border: 1px solid ${designSystem.colors.gray[200]};
          box-shadow: none;
        `;
      default:
        return `
          box-shadow: ${designSystem.shadows.md};
          border: none;
        `;
    }
  }}
  
  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: ${designSystem.shadows.lg};
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: ${designSystem.shadows.md};
    }
  `}
  
  margin: ${designSystem.spacing.md} 0;
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  className,
  onClick,
}) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      clickable={!!onClick}
      className={className}
      onClick={onClick}
    >
      {children}
    </StyledCard>
  );
};

// Specialized Card Components for Zip-style layouts

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

const MetricCardContainer = styled(Card)`
  text-align: center;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${designSystem.spacing.sm};
`;

const MetricTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.text.secondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div`
  font-size: ${designSystem.typography.fontSize['2xl']};
  font-weight: ${designSystem.typography.fontWeight.bold};
  color: ${designSystem.colors.text.primary};
  margin: 0;
`;

const MetricSubtitle = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  margin: 0;
`;

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  onClick,
}) => {
  return (
    <MetricCardContainer onClick={onClick} variant='elevated'>
      {icon}
      <MetricTitle>{title}</MetricTitle>
      <MetricValue>{value}</MetricValue>
      {subtitle && <MetricSubtitle>{subtitle}</MetricSubtitle>}
    </MetricCardContainer>
  );
};

// Action Card for Zip-style button groups
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const ActionCardContainer = styled(Card)<{ variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${(props) =>
    props.variant === 'primary' &&
    `
    background: linear-gradient(135deg, ${designSystem.colors.primary[500]} 0%, ${designSystem.colors.primary[600]} 100%);
    color: ${designSystem.colors.text.inverse};
    
    &:hover {
      background: linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.primary[700]} 100%);
    }
  `}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${designSystem.shadows.lg};
  }
`;

const ActionIcon = styled.div<{ variant: 'primary' | 'secondary' }>`
  width: 44px;
  height: 44px;
  border-radius: ${designSystem.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  
  ${(props) =>
    props.variant === 'primary'
      ? `background: rgba(255, 255, 255, 0.2);`
      : `background: ${designSystem.colors.primary[50]}; color: ${designSystem.colors.primary[500]};`}
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h4<{ variant: 'primary' | 'secondary' }>`
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  margin: 0 0 4px 0;
  color: ${(props) =>
    props.variant === 'primary'
      ? designSystem.colors.text.inverse
      : designSystem.colors.text.primary};
`;

const ActionSubtitle = styled.p<{ variant: 'primary' | 'secondary' }>`
  font-size: ${designSystem.typography.fontSize.sm};
  margin: 0;
  color: ${(props) =>
    props.variant === 'primary' ? 'rgba(255, 255, 255, 0.8)' : designSystem.colors.text.secondary};
`;

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  subtitle,
  onClick,
  variant = 'secondary',
}) => {
  return (
    <ActionCardContainer variant={variant} onClick={onClick} padding='md'>
      <ActionIcon variant={variant}>{icon}</ActionIcon>
      <ActionContent>
        <ActionTitle variant={variant}>{title}</ActionTitle>
        {subtitle && <ActionSubtitle variant={variant}>{subtitle}</ActionSubtitle>}
      </ActionContent>
    </ActionCardContainer>
  );
};
