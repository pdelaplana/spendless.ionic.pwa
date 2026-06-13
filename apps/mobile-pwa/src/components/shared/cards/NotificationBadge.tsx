import { designSystem } from '@/theme/designSystem';
import styled from 'styled-components';

interface NotificationBadgeProps {
  size?: number;
  top?: string;
  right?: string;
  className?: string;
}

const Badge = styled.div<{
  $size: number;
  $top: string;
  $right: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  right: ${({ $right }) => $right};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: ${designSystem.colors.danger};
  border-radius: 50%;
  border: 2px solid ${designSystem.colors.backgroundPrimary};
`;

/**
 * Notification badge dot indicator
 * Typically positioned absolutely on top of an icon or avatar
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 12,
  top = '-4px',
  right = '-4px',
  className,
}) => {
  return <Badge className={className} $size={size} $top={top} $right={right} />;
};
