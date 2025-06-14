'use client';

import { useEffect } from 'react';

export function HydrationErrorLogger() {
  useEffect(() => {
    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.group('🚨 Unhandled Error');
      console.error('Message:', event.message);
      console.error('Filename:', event.filename);
      console.error('Line:', event.lineno);
      console.error('Column:', event.colno);
      console.error('Error object:', event.error);
      console.groupEnd();
    };

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.group('🚨 Unhandled Promise Rejection');
      console.error('Reason:', event.reason);
      console.error('Promise:', event.promise);
      console.groupEnd();
    };

    // Capture React hydration errors specifically
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('hydrat') || 
          message.includes('getServerSnapshot') || 
          message.includes('Maximum update depth') ||
          message.includes('useSyncExternalStore')) {
        console.group('🚨 HYDRATION ERROR DETECTED');
        console.error('Full message:', message);
        console.error('Arguments:', args);
        console.trace('Stack trace:');
        console.groupEnd();
      }
      
      originalConsoleError.apply(console, args);
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Log initial state
    console.log('🔍 HydrationErrorLogger initialized');
    console.log('🌐 Environment:', process.env.NODE_ENV);
    console.log('🖥️  User Agent:', navigator.userAgent);
    console.log('📍 Current URL:', window.location.href);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, []);

  return null; // This component doesn't render anything
} 