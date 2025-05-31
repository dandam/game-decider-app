import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

export default function Profile() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600">
          Manage your preferences and view your gaming statistics.
        </p>
        {/* Profile content will be implemented in future tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 italic">Profile management coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
} 