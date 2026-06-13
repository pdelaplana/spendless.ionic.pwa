/**
 * Platform detection utilities for PWA installation prompts
 */

/**
 * Detects if the current device is running iOS
 * Checks both iPhone, iPad, and iPod devices
 */
export function isIOS(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Detects if the current device is running Android
 */
export function isAndroid(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

/**
 * Detects if the app is currently running in standalone mode
 * Works on both iOS and Android PWAs
 */
export function isInStandaloneMode(): boolean {
  // Check display-mode media query (works on most browsers)
  const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // Check iOS-specific standalone property
  // iOS Safari adds a 'standalone' property to navigator
  const isIOSStandalone =
    'standalone' in window.navigator &&
    (window.navigator as { standalone?: boolean }).standalone === true;

  return isDisplayModeStandalone || isIOSStandalone;
}

/**
 * Determines if the iOS install prompt should be shown
 * Returns true only when:
 * - Device is iOS
 * - App is NOT in standalone mode (not installed)
 */
export function shouldShowIOSInstallPrompt(): boolean {
  return isIOS() && !isInStandaloneMode();
}
