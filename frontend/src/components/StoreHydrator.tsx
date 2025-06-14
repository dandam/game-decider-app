'use client';

import { useEffect, useState } from 'react';
import { hydrateStore, getHydrationStatus } from '@/lib/store';

interface StoreHydratorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that handles store hydration on the client side.
 * Prevents SSR mismatches by ensuring hydration happens after mount.
 */
export function StoreHydrator({ children, fallback }: StoreHydratorProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    console.log('🔄 StoreHydrator: useEffect triggered');
    console.log('🔄 Window available:', typeof window !== 'undefined');
    console.log('🔄 Current hydration status:', getHydrationStatus());
    
    // Only hydrate on the client side
    if (typeof window !== 'undefined') {
      if (!getHydrationStatus()) {
        console.log('🔄 StoreHydrator: Starting hydration...');
        hydrateStore();
        console.log('✅ StoreHydrator: Hydration completed, setting state');
        setIsHydrated(true);
      } else {
        // Already hydrated
        console.log('✅ StoreHydrator: Already hydrated, setting state');
        setIsHydrated(true);
      }
    } else {
      console.log('❌ StoreHydrator: Window not available, staying in loading state');
    }
  }, []);

  // Show fallback during hydration
  if (!isHydrated) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Initializing application...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
} 