import { GlassCard } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import styled from 'styled-components';

export const SpendListContainer = styled(GlassCard)`

`;

export const SpendListHeader = styled.h2`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  padding: 0px ${designSystem.spacing.md};
`;

export const SpendListContent = styled.div`
  width: 100%;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${designSystem.spacing.xl};
`;

export const ErrorContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.lg};
`;

export const ErrorMessage = styled.p`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.secondary};
  margin: 0 0 ${designSystem.spacing.md} 0;
`;

export const RetryButton = styled.button`
  background: ${designSystem.colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${designSystem.borderRadius.md};
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: ${designSystem.colors.primary[600]};
  }

  &:focus {
    outline: 2px solid ${designSystem.colors.primary[300]};
    outline-offset: 2px;
  }
`;

export const EmptyContainer = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl};
`;

export const EmptyMessage = styled.p`
  font-size: ${designSystem.typography.fontSize.base};
  color: ${designSystem.colors.text.secondary};
  margin: 0;
`;
