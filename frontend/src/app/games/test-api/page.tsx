'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [counter, setCounter] = useState(0);
  const [message, setMessage] = useState('Initial state');

  // Test 1: Simple useEffect to see if it runs at all
  useEffect(() => {
    console.log('🔧 Basic useEffect running');
    setMessage('useEffect executed!');
    setCounter(1);
  }, []);

  // Test 2: useEffect with timer to see if async works
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ Timer useEffect running');
      setMessage('Timer useEffect executed!');
      setCounter(2);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">JavaScript Execution Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <p><strong>Counter:</strong> {counter}</p>
          <p><strong>Message:</strong> {message}</p>
        </div>

        <div className="p-4 bg-blue-50 border rounded">
          <p><strong>Expected behavior:</strong></p>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>Counter should change from 0 → 1 → 2</li>
            <li>Message should change: "Initial state" → "useEffect executed!" → "Timer useEffect executed!"</li>
            <li>Console should show logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 