import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import styled from 'styled-components';

export const InsightsCardContainer = styled(GlassCard)`
  padding: ${designSystem.spacing.lg} ${designSystem.spacing.md};
`;

export const InsightsCardContent = styled.div`
  display: flex;
  align-items: top;
  gap: ${designSystem.spacing.md};
`;

export const InsightsIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${designSystem.borderRadius.md};
  background: ${designSystem.colors.primary[50]};
  flex-shrink: 0;

  ion-icon {
    font-size: 24px;
    color: ${designSystem.colors.primary[500]};
  }
`;

export const InsightsTextContainer = styled.div`
  flex: 1;
`;

export const InsightsTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.base};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin: 0 0 ${designSystem.spacing.xs} 0;
`;

export const InsightsDescription = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  margin: 0 0 ${designSystem.spacing.md} 0;
  line-height: 1.4;
`;

export const InsightsLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${designSystem.colors.primary[500]};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${designSystem.colors.primary[600]};
  }

  &:focus {
    outline: 2px solid ${designSystem.colors.primary[300]};
    outline-offset: 2px;
    border-radius: ${designSystem.borderRadius.sm};
  }

  ion-icon {
    font-size: 16px;
  }
`;
