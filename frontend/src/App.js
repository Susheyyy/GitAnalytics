import React from 'react';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <h1 className="text-xl font-black text-blue-600 max-w-6xl mx-auto italic">GIT.ANALYTICS</h1>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;