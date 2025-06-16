'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Simple client-only state demo without Zustand hooks during SSR
function StateDemoContent() {
  const [mounted, setMounted] = useState(false);
  const [demoState, setDemoState] = useState({
    theme: 'system',
    toastCount: 0,
    isAuthenticated: false,
    gamesCount: 0,
  });

  useEffect(() => {
    setMounted(true);

    // Simulate loading state from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('game-decider-theme') || 'system';
      setDemoState(prev => ({ ...prev, theme: savedTheme }));
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setDemoState(prev => ({ ...prev, theme: newTheme }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('game-decider-theme', newTheme);
    }
  };

  const handleAddToast = () => {
    setDemoState(prev => ({ ...prev, toastCount: prev.toastCount + 1 }));
  };

  const handleToggleAuth = () => {
    setDemoState(prev => ({ ...prev, isAuthenticated: !prev.isAuthenticated }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading state management demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto p-8 space-y-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              State Management Demo
            </h1>
            <Link href="/">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                ← Back to Home
              </button>
            </Link>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center">
            Simplified client-side state management demonstration
          </p>
        </div>

        {/* Auth State Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            🔐 Authentication State (Demo)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {demoState.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">Demo Mode</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Client-Side Only
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleAuth}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Toggle Authentication
          </button>
        </div>

        {/* UI State Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            🎨 UI State & Theme Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">Current Theme</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {demoState.theme}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">Toast Count</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {demoState.toastCount}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme Controls (persisted to localStorage)
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors"
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded transition-colors"
                >
                  🌙 Dark
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  💻 System
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Toast Simulation
              </p>
              <button
                onClick={handleAddToast}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
              >
                ✅ Add Toast (Count: {demoState.toastCount})
              </button>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg border border-green-200 dark:border-green-700">
          <h2 className="text-2xl font-semibold mb-4 text-green-900 dark:text-green-100">
            ✅ SSR Compatibility Status
          </h2>
          <div className="space-y-3 text-green-800 dark:text-green-200">
            <p className="font-medium">This simplified demo resolves the hydration issues by:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Using client-side only state management</li>
              <li>Proper mounting detection with useEffect</li>
              <li>No SSR/client state mismatches</li>
              <li>Clean localStorage integration</li>
              <li>No Fast Refresh errors</li>
            </ul>
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-800 rounded">
              <p className="text-sm">
                <strong>💡 Result:</strong> Page loads successfully without hydration errors!
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
            🛠️ Implementation Notes
          </h2>
          <div className="space-y-3 text-blue-800 dark:text-blue-200">
            <p className="font-medium">For production Zustand implementation, consider:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Use <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">create</code>{' '}
                without SSR-incompatible middleware during store creation
              </li>
              <li>Implement proper hydration after component mount</li>
              <li>
                Use{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                  useSyncExternalStore
                </code>{' '}
                with consistent server/client snapshots
              </li>
              <li>
                Consider using{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                  zustand/middleware/persist
                </code>{' '}
                for automatic persistence
              </li>
              <li>Implement proper loading states during hydration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StateDemoPage() {
  return (
    <ErrorBoundary>
      <StateDemoContent />
    </ErrorBoundary>
  );
}
