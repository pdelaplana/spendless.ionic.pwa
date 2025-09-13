import { BRAND_COLORS } from '@/theme/designSystem';
import type React from 'react';
import styled from 'styled-components';

export interface SpendlessIconProps {
  /**
   * Size of the icon in pixels
   * If not provided, defaults to 40px
   */
  size?: number;

  /**
   * Color variant
   * - brand: Purple background with white "S"
   * - reverse: White background with purple "S"
   * - outline: Transparent background with purple "S" and border
   */
  variant?: 'brand' | 'reverse' | 'outline';

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Click handler for the icon
   */
  onClick?: () => void;

  /**
   * Whether the icon should be interactive (shows hover effects)
   */
  interactive?: boolean;

  /**
   * Custom border radius (defaults to 12px for brand consistency)
   */
  borderRadius?: number;
}

const IconContainer = styled.div<{
  size: number;
  variant: 'brand' | 'reverse' | 'outline';
  interactive: boolean;
  borderRadius: number;
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: ${(props) => props.borderRadius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
  font-size: ${(props) => Math.round(props.size * 0.5)}px;
  cursor: ${(props) => (props.interactive ? 'pointer' : 'default')};
  transition: all 0.2s ease;

  ${(props) => {
    switch (props.variant) {
      case 'reverse':
        return `
          background: #ffffff;
          color: ${BRAND_COLORS.purple};
          border: 1px solid #e4e4e7;
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${BRAND_COLORS.purple};
          border: 2px solid ${BRAND_COLORS.purple};
        `;
      default:
        return `
          background: ${BRAND_COLORS.purple};
          color: #ffffff;
          border: none;
        `;
    }
  }}

  &:hover {
    ${(props) =>
      props.interactive &&
      `
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(139, 95, 191, 0.25);

      ${
        props.variant === 'outline'
          ? `
        background: ${BRAND_COLORS.purple};
        color: #ffffff;
      `
          : ''
      }
    `}
  }

  &:active {
    ${(props) =>
      props.interactive &&
      `
      transform: translateY(0);
    `}
  }
`;

/**
 * SpendlessIcon component displays the Spendless "S" icon mark
 * Perfect for favicons, app icons, loading states, and compact spaces
 *
 * @example
 * ```tsx
 * // Default brand icon
 * <SpendlessIcon size={40} />
 *
 * // Interactive icon with click handler
 * <SpendlessIcon size={48} interactive onClick={handleIconClick} />
 *
 * // Reverse icon for dark backgrounds
 * <SpendlessIcon size={32} variant="reverse" />
 *
 * // Outline variant
 * <SpendlessIcon size={56} variant="outline" />
 *
 * // Custom size and border radius
 * <SpendlessIcon size={24} borderRadius={6} />
 * ```
 */
export const SpendlessIcon: React.FC<SpendlessIconProps> = ({
  size = 40,
  variant = 'brand',
  className,
  onClick,
  interactive = false,
  borderRadius = 12,
}) => {
  return (
    <IconContainer
      size={size}
      variant={variant}
      interactive={interactive}
      borderRadius={borderRadius}
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label='Spendless'
    >
      S
    </IconContainer>
  );
};

export default SpendlessIcon;
