import { designSystem } from '@/theme/designSystem';
import { IonIcon } from '@ionic/react';
import styled from 'styled-components';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const Container = styled.div`
  text-align: center;
  padding: ${designSystem.spacing.xl} ${designSystem.spacing.lg};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: ${designSystem.colors.gray[400]};
  margin-bottom: ${designSystem.spacing.md};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${designSystem.spacing.sm} 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${designSystem.colors.textPrimary};
`;

const EmptyDescription = styled.p`
  margin: 0 0 ${designSystem.spacing.md} 0;
  font-size: 0.95rem;
  color: ${designSystem.colors.textSecondary};
`;

/**
 * Displays an empty state with icon, title, description, and optional action
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <Container className={className}>
      {icon && (
        <EmptyIcon>
          <IonIcon icon={icon} />
        </EmptyIcon>
      )}
      <EmptyTitle>{title}</EmptyTitle>
      {description && <EmptyDescription>{description}</EmptyDescription>}
      {action}
    </Container>
  );
};
