import { BRAND_COLORS } from '@/theme/designSystem';
import type React from 'react';
import styled from 'styled-components';

export interface SpendlessLogoProps {
  /**
   * Logo variant to display
   * - primary: "S[p]endless" with purple accent on "p"
   * - reverse: White version for dark backgrounds
   * - horizontal: Icon + "Spendless" text side by side
   */
  variant?: 'primary' | 'reverse' | 'horizontal';

  /**
   * Size of the logo
   * - small: 1.2rem (19px)
   * - medium: 2rem (32px)
   * - large: 3rem (48px)
   * - xl: 4rem (64px)
   */
  size?: 'small' | 'medium' | 'large' | 'xl';

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Click handler for logo
   */
  onClick?: () => void;

  /**
   * Whether the logo should be interactive (shows hover effects)
   */
  interactive?: boolean;
}

const LogoContainer = styled.div<{
  size: SpendlessLogoProps['size'];
  interactive: boolean;
}>`
  display: inline-flex;
  align-items: center;
  cursor: ${(props) => (props.interactive ? 'pointer' : 'default')};
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: ${(props) => (props.interactive ? 0.8 : 1)};
  }
`;

const PrimaryLogo = styled.div<{ size: string; isReverse: boolean }>`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
  font-weight: 900;
  font-size: ${(props) => props.size};
  letter-spacing: -2px;
  color: ${(props) => (props.isReverse ? '#ffffff' : BRAND_COLORS.textPrimary)};
  display: flex;
  align-items: center;
`;

const LogoAccent = styled.span<{ isReverse: boolean }>`
  background: ${(props) => (props.isReverse ? '#ffffff' : BRAND_COLORS.purple)};
  color: ${(props) => (props.isReverse ? BRAND_COLORS.purple : '#ffffff')};
  padding: 0.1em 0.12em;
  border-radius: 6px;
  margin: 0 1px;
`;

const HorizontalContainer = styled.div<{ size: string; isReverse: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => {
    switch (props.size) {
      case '1.2rem':
        return '0.5rem';
      case '2rem':
        return '0.75rem';
      case '3rem':
        return '1rem';
      case '4rem':
        return '1.25rem';
      default:
        return '1rem';
    }
  }};
`;

const LogoIcon = styled.div<{ size: string; isReverse: boolean }>`
  width: ${(props) => {
    switch (props.size) {
      case '1.2rem':
        return '30px';
      case '2rem':
        return '40px';
      case '3rem':
        return '60px';
      case '4rem':
        return '80px';
      default:
        return '60px';
    }
  }};
  height: ${(props) => {
    switch (props.size) {
      case '1.2rem':
        return '30px';
      case '2rem':
        return '40px';
      case '3rem':
        return '60px';
      case '4rem':
        return '80px';
      default:
        return '60px';
    }
  }};
  background: ${(props) => (props.isReverse ? '#ffffff' : BRAND_COLORS.purple)};
  color: ${(props) => (props.isReverse ? BRAND_COLORS.purple : '#ffffff')};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: ${(props) => {
    switch (props.size) {
      case '1.2rem':
        return '1rem';
      case '2rem':
        return '1.5rem';
      case '3rem':
        return '2rem';
      case '4rem':
        return '3rem';
      default:
        return '2rem';
    }
  }};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
`;

const HorizontalText = styled.span<{ size: string; isReverse: boolean }>`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
  font-weight: 900;
  font-size: ${(props) => {
    switch (props.size) {
      case '1.2rem':
        return '1.2rem';
      case '2rem':
        return '1.8rem';
      case '3rem':
        return '2.5rem';
      case '4rem':
        return '3.2rem';
      default:
        return '2.5rem';
    }
  }};
  color: ${(props) => (props.isReverse ? '#ffffff' : BRAND_COLORS.textPrimary)};
  letter-spacing: -1px;
`;

/**
 * SpendlessLogo component displays the Spendless brand logo in various formats
 *
 * @example
 * ```tsx
 * // Primary logo for auth pages
 * <SpendlessLogo variant="primary" size="large" />
 *
 * // Horizontal logo for headers
 * <SpendlessLogo variant="horizontal" size="medium" interactive onClick={handleLogoClick} />
 *
 * // Reverse logo for dark backgrounds
 * <SpendlessLogo variant="reverse" size="medium" />
 * ```
 */
export const SpendlessLogo: React.FC<SpendlessLogoProps> = ({
  variant = 'primary',
  size = 'medium',
  className,
  onClick,
  interactive = false,
}) => {
  const isReverse = variant === 'reverse';

  const sizeMap = {
    small: '1.2rem',
    medium: '2rem',
    large: '3rem',
    xl: '4rem',
  };

  const fontSize = sizeMap[size];

  const renderLogo = () => {
    switch (variant) {
      case 'horizontal':
        return (
          <HorizontalContainer size={fontSize} isReverse={isReverse}>
            <LogoIcon size={fontSize} isReverse={isReverse}>
              S
            </LogoIcon>
            <HorizontalText size={fontSize} isReverse={isReverse}>
              Spendless
            </HorizontalText>
          </HorizontalContainer>
        );

      case 'primary':
      case 'reverse':
      default:
        return (
          <PrimaryLogo size={fontSize} isReverse={isReverse}>
            <span>S</span>
            <LogoAccent isReverse={isReverse}>p</LogoAccent>
            <span>endless</span>
          </PrimaryLogo>
        );
    }
  };

  return (
    <LogoContainer
      size={size}
      interactive={interactive}
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
    >
      {renderLogo()}
    </LogoContainer>
  );
};

export default SpendlessLogo;
