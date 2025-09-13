import { StyledIonList } from '@/styles/IonList.styled';
import styled from 'styled-components';
import { designSystem } from './designSystem';

/**
 * Modern gradient background component used across spending pages
 */
export const GradientBackground = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${designSystem.colors.surface} 0%,
    ${designSystem.colors.gray[50]} 50%,
    ${designSystem.colors.primary[50]} 100%
  );
  width: 100%;
`;

/**
 * Modern card container with glassmorphism effects for transaction lists
 */
export const TransactionsContainer = styled.div`
  margin: ${designSystem.spacing.lg} 0;
  padding: 0 ${designSystem.spacing.md};

  > div {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: ${designSystem.borderRadius.xl};
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.2s ease-in-out;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    }
  }
`;

/**
 * Styled list container for grouped transactions with consistent spacing
 */
export const GroupedTransactionsContainer = styled(StyledIonList)`
  margin-top: ${designSystem.spacing.xl};
`;
