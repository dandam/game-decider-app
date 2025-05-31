import React from 'react';
import MainLayout from '../components/layout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Game Night Concierge
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Let's help you find the perfect game for your next game night!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Browse Games</h2>
            <p className="text-gray-600">Explore our curated collection of BoardGameArena games.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Start a Session</h2>
            <p className="text-gray-600">Create a new game session and invite your friends.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Track Progress</h2>
            <p className="text-gray-600">Keep track of your games, wins, and favorite strategies.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 