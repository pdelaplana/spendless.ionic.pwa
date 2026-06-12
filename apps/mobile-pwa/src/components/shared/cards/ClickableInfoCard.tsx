import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import type React from 'react';
import styled from 'styled-components';

interface ClickableInfoCardProps {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  onClick: () => void;
  backgroundColor?: string;
  iconBackground?: string;
  iconColor?: string;
  textColor?: string;
  linkColor?: string;
  badge?: React.ReactNode;
  className?: string;
}

const CardContainer = styled(GlassCard)<{
  $backgroundColor?: string;
}>`
  margin: ${designSystem.spacing.md};
  padding: ${designSystem.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-align: left;
  max-width: 100%;
  ${({ $backgroundColor }) => $backgroundColor && `background: ${$backgroundColor};`}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${designSystem.spacing.md};
`;

const IconContainer = styled.div<{
  $background?: string;
  $color?: string;
}>`
  position: relative;
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${designSystem.borderRadius.md};
  background: ${({ $background }) => $background || designSystem.colors.primary[50]};
  font-size: 1.5rem;

  ion-icon {
    font-size: 24px;
    color: ${({ $color }) => $color || designSystem.colors.primary[500]};
  }
`;

const TextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.xs};
`;

const Title = styled.h3<{ $color?: string }>`
  margin: 0;
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${({ $color }) => $color || designSystem.colors.text.primary};
`;

const Description = styled.p<{ $color?: string }>`
  margin: 0;
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${({ $color }) => $color || designSystem.colors.text.secondary};
  line-height: 1.4;
`;

const Link = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${({ $color }) => $color || designSystem.colors.primary[500]};
  font-weight: ${designSystem.typography.fontWeight.medium};
  margin-top: ${designSystem.spacing.lg};

  ion-icon {
    font-size: 1rem;
  }
`;

/**
 * Clickable information card with icon, title, description, and link
 * Used for navigation cards like Insights and AI Check-ins
 */
export const ClickableInfoCard: React.FC<ClickableInfoCardProps> = ({
  icon,
  title,
  description,
  linkText,
  onClick,
  backgroundColor,
  iconBackground,
  iconColor,
  textColor,
  linkColor,
  badge,
  className,
}) => {
  return (
    <CardContainer className={className} onClick={onClick} $backgroundColor={backgroundColor}>
      <CardContent>
        <IconContainer $background={iconBackground} $color={iconColor}>
          <IonIcon icon={icon} />
          {badge}
        </IconContainer>
        <TextContainer>
          <Title $color={textColor}>{title}</Title>
          <Description $color={textColor || designSystem.colors.text.secondary}>
            {description}
          </Description>
          <Link $color={linkColor || textColor}>
            {linkText}
            <IonIcon icon={arrowForward} />
          </Link>
        </TextContainer>
      </CardContent>
    </CardContainer>
  );
};
