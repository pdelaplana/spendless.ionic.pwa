import { useEffect, useState } from 'react';

export interface PwaUpdateInfo {
  updateAvailable: boolean;
  updateApplied: boolean;
  registration: ServiceWorkerRegistration | null;
  updateServiceWorker: () => void;
  skipWaiting: () => void;
}

/**
 * Hook for handling PWA updates using the VitePWA plugin
 *
 * @returns An object with:
 * - updateAvailable: boolean indicating if an update is available
 * - updateApplied: boolean indicating if an update has been applied
 * - registration: service worker registration object
 * - updateServiceWorker: function to trigger update process
 * - skipWaiting: function to immediately apply the update
 */
export function usePwaUpdate(): PwaUpdateInfo {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateApplied, setUpdateApplied] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Listen for PWA update events from VitePWA
    const handleOfflineReady = () => {
      console.log('PWA: App ready to work offline');
    };

    const handleNeedRefresh = () => {
      console.log('PWA: New version available');
      setUpdateAvailable(true);
    };

    const handleUpdateAvailable = (event: Event) => {
      console.log('PWA: Update available', event);
      setUpdateAvailable(true);
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.registration) {
        setRegistration(customEvent.detail.registration);
      }
    };

    const handleUpdateActivated = () => {
      console.log('PWA: Update activated');
      setUpdateApplied(true);
      setUpdateAvailable(false);
    };

    // VitePWA custom events
    window.addEventListener('vite-pwa:offline-ready', handleOfflineReady);
    window.addEventListener('vite-pwa:need-refresh', handleNeedRefresh);

    // Workbox events
    window.addEventListener('workbox-update-available', handleUpdateAvailable);
    window.addEventListener('workbox-update-activated', handleUpdateActivated);

    // Check for existing registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setRegistration(reg);

          // Check if there's an update waiting
          if (reg.waiting) {
            setUpdateAvailable(true);
          }

          // Listen for updates on this registration
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  setUpdateAvailable(true);
                }
              });
            }
          });
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service worker has been updated and is now controlling the page
        setUpdateApplied(true);
        setUpdateAvailable(false);

        // Optionally reload the page to ensure fresh content
        if (window.confirm('App has been updated. Reload to see the latest version?')) {
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener('vite-pwa:offline-ready', handleOfflineReady);
      window.removeEventListener('vite-pwa:need-refresh', handleNeedRefresh);
      window.removeEventListener('workbox-update-available', handleUpdateAvailable);
      window.removeEventListener('workbox-update-activated', handleUpdateActivated);
    };
  }, []);

  const updateServiceWorker = () => {
    if (!registration || !registration.waiting) {
      console.warn('No service worker update available');
      return;
    }

    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  const skipWaiting = () => {
    updateServiceWorker();
  };

  return {
    updateAvailable,
    updateApplied,
    registration,
    updateServiceWorker,
    skipWaiting,
  };
}