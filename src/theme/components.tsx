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
 * Reusable glassmorphism card container with consistent styling
 */
export const GlassCard = styled.div<{
  margin?: string;
  padding?: string;
  clickable?: boolean;
}>`
  margin: ${(props) => props.margin || `${designSystem.spacing.lg} ${designSystem.spacing.md}`};
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: ${designSystem.borderRadius.md};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  padding: ${(props) => props.padding || '0'};

  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;

    &:focus {
      outline: none;
    }
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

/**
 * Clean, minimal card container with modern design principles
 * Drop-in replacement for GlassCard with simplified styling
 */
export const CleanCard = styled.div<{
  margin?: string;
  padding?: string;
  clickable?: boolean;
}>`
  margin: ${(props) => props.margin || `${designSystem.spacing.lg} ${designSystem.spacing.md}`};
  background: ${designSystem.colors.surface};
  border-radius: ${designSystem.borderRadius.lg};
  border: 1px solid ${designSystem.colors.gray[200]};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  padding: ${(props) => props.padding || '0'};

  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;

    &:focus {
      outline: 2px solid ${designSystem.colors.primary[500]};
      outline-offset: 2px;
    }
  `}

  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
    transform: translateY(-1px);
  }
`;

/**
 * Styled list container for grouped transactions with consistent spacing
 */
export const GroupedTransactionsContainer = styled(StyledIonList)`
  margin-top: ${designSystem.spacing.xl};
`;
