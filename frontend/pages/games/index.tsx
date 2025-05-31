import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

export default function Games() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Games Library</h1>
        <p className="text-gray-600">
          Browse our collection of BoardGameArena games and find your next favorite!
        </p>
        {/* Game list will be implemented in future tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 italic">Game list coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
} 