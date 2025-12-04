import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import styled from 'styled-components';

export const AiCheckinCardContainer = styled(GlassCard)`
  margin: ${designSystem.spacing.md};
  padding: ${designSystem.spacing.md};
  background: ${designSystem.colors.primary[500]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

export const AiCheckinCardContent = styled.div`
  display: flex;
  align-items: top;
  gap: ${designSystem.spacing.md};
`;

export const AiCheckinIconContainer = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${designSystem.borderRadius.md};
  background: ${designSystem.colors.brand.primary};
  font-size: 1.5rem;
  color: ${designSystem.colors.text.inverse};
`;

export const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: ${designSystem.colors.danger};
  border-radius: 50%;
  border: 2px solid ${designSystem.colors.backgroundPrimary};
`;

export const AiCheckinTextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.xs};
`;

export const Title = styled.h3`
  margin: 0;
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: 600;
  color: ${designSystem.colors.text.inverse};
`;

export const Description = styled.p`
  margin: 0;
  font-size: ${designSystem.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.85);
`;

export const Link = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.inverse};
  font-weight: 500;
  margin-top: ${designSystem.spacing.xs};

  ion-icon {
    font-size: 1rem;
  }
`;
