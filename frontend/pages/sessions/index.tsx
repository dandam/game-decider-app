import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

export default function Sessions() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Game Sessions</h1>
        <p className="text-gray-600">
          Manage your game sessions and track your gaming history.
        </p>
        {/* Sessions list will be implemented in future tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 italic">Session management coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
} 