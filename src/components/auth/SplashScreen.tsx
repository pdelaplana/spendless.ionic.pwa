import { SpendlessLogo } from '@/components/brand';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface SplashScreenProps {
  /**
   * Callback fired when splash screen is ready to be dismissed
   * (after minimum display time has elapsed)
   */
  onReady?: () => void;

  /**
   * Minimum time (in ms) to display the splash screen
   * @default 1500
   */
  minDisplayTime?: number;
}

// Keyframe animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Styled components
const SplashContainer = styled.div<{ isExiting: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ion-color-light, #fafafa);
  z-index: 9999;
  animation: ${(props) => (props.isExiting ? fadeOut : fadeIn)}
    ${(props) => (props.isExiting ? '400ms' : '600ms')} ease-out forwards;
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 32px);
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: 300ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Tagline = styled.p`
  margin-top: var(--spacing-lg, 24px);
  font-size: var(--font-size-base, 16px);
  color: var(--color-gray-600, #52525b);
  font-weight: var(--font-weight-medium, 500);
  text-align: center;
  opacity: 0;
  animation: ${fadeIn} 600ms ease-out 800ms forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: ${fadeIn} 300ms ease-out forwards;
  }
`;

/**
 * SplashScreen component displays a branded loading screen during app initialization
 *
 * Features:
 * - Displays Spendless logo with smooth fade-in animation
 * - Gentle pulsing animation during loading
 * - Ensures minimum display time for consistent UX
 * - Smooth fade-out transition when ready
 * - Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * const [splashComplete, setSplashComplete] = useState(false);
 *
 * if (isLoading && !splashComplete) {
 *   return <SplashScreen onReady={() => setSplashComplete(true)} />;
 * }
 * ```
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onReady, minDisplayTime = 1500 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Set up timer for minimum display time
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  useEffect(() => {
    // When minimum time has elapsed, start exit animation
    if (minTimeElapsed) {
      const exitDelay = setTimeout(() => {
        setIsExiting(true);
      }, 100); // Small delay before starting exit

      return () => clearTimeout(exitDelay);
    }
  }, [minTimeElapsed]);

  useEffect(() => {
    // After exit animation completes, notify parent
    if (isExiting) {
      const exitAnimationDuration = 400; // Match fadeOut duration
      const completeTimer = setTimeout(() => {
        onReady?.();
      }, exitAnimationDuration);

      return () => clearTimeout(completeTimer);
    }
  }, [isExiting, onReady]);

  return (
    <SplashContainer isExiting={isExiting} aria-label='Loading Spendless'>
      <LogoWrapper>
        <SpendlessLogo variant='primary' size='xl' />
        <Tagline>Mindful spending tracker</Tagline>
      </LogoWrapper>
    </SplashContainer>
  );
};

export default SplashScreen;
