import { designSystem } from '@/theme/designSystem';
import React from 'react';
import styled from 'styled-components';

const StepContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${designSystem.spacing.md} 0;
  margin-bottom: ${designSystem.spacing.lg};
`;

const StepWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
`;

const StepCircle = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${designSystem.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  transition: all 0.2s ease;

  ${({ $isCompleted }) =>
    $isCompleted &&
    `
    background-color: ${designSystem.colors.primary[500]};
    color: ${designSystem.colors.text.inverse};
    border: 2px solid ${designSystem.colors.primary[500]};
  `}

  ${({ $isActive, $isCompleted }) =>
    $isActive &&
    !$isCompleted &&
    `
    background-color: ${designSystem.colors.primary[50]};
    color: ${designSystem.colors.primary[600]};
    border: 2px solid ${designSystem.colors.primary[500]};
  `}

  ${({ $isActive, $isCompleted }) =>
    !$isActive &&
    !$isCompleted &&
    `
    background-color: ${designSystem.colors.gray[100]};
    color: ${designSystem.colors.text.secondary};
    border: 2px solid ${designSystem.colors.gray[300]};
  `}
`;

const StepConnector = styled.div<{ $isCompleted: boolean }>`
  width: 40px;
  height: 2px;
  transition: background-color 0.2s ease;

  ${({ $isCompleted }) =>
    $isCompleted
      ? `background-color: ${designSystem.colors.primary[500]};`
      : `background-color: ${designSystem.colors.gray[300]};`}
`;

const StepLabel = styled.div<{ $isActive: boolean }>`
  font-size: ${designSystem.typography.fontSize.sm};
  font-weight: ${designSystem.typography.fontWeight.medium};
  color: ${({ $isActive }) =>
    $isActive ? designSystem.colors.text.primary : designSystem.colors.text.secondary};
  margin-top: ${designSystem.spacing.xs};
  text-align: center;
  min-width: 80px;
`;

const StepGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
  className,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <StepContainer className={className}>
      <StepWrapper>
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const showConnector = index < steps.length - 1;
          const label = stepLabels[index];

          return (
            <React.Fragment key={step}>
              <StepGroup>
                <StepCircle $isActive={isActive} $isCompleted={isCompleted}>
                  {isCompleted ? '✓' : step}
                </StepCircle>
                {label && <StepLabel $isActive={isActive || isCompleted}>{label}</StepLabel>}
              </StepGroup>
              {showConnector && <StepConnector $isCompleted={isCompleted} />}
            </React.Fragment>
          );
        })}
      </StepWrapper>
    </StepContainer>
  );
};

export default StepIndicator;
