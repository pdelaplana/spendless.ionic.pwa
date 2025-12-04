import { designSystem } from '@/theme/designSystem';
import styled from 'styled-components';

interface DateSeparatorProps {
  date: string;
  className?: string;
}

const StyledDateSeparator = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${designSystem.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: ${designSystem.spacing.xl} 0 ${designSystem.spacing.md} 0;
  padding-left: ${designSystem.spacing.xs};

  &:first-child {
    margin-top: 0;
  }
`;

/**
 * Displays a date separator for grouped list items
 */
export const DateSeparator: React.FC<DateSeparatorProps> = ({ date, className }) => {
  return <StyledDateSeparator className={className}>{date}</StyledDateSeparator>;
};
