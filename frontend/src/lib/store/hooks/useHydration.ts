/**
 * Hydration hook for handling SSR compatibility with Zustand store.
 * Ensures proper client-side hydration without SSR mismatches.
 */

import { useEffect, useState } from 'react';
import { hydrateStore } from '../index';

/**
 * Hook to handle store hydration on the client side.
 * This prevents SSR hydration mismatches by ensuring the store
 * is only hydrated after the component mounts.
 * 
 * @returns Object with hydration status
 */
export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // Hydrate the store with persisted data
        hydrateStore();
      } catch (error) {
        console.warn('Hydration failed:', error);
      } finally {
        setIsHydrated(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return { isHydrated };
};

/**
 * Hook that returns a stable reference to indicate if we're on the client.
 * Useful for conditional rendering that depends on client-side features.
 * 
 * @returns True if running on client side
 */
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}; 