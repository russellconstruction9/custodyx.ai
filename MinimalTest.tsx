import React from 'react';

const MinimalTest: React.FC = () => {
  const [test, setTest] = React.useState('Hello World');
  
  console.log('MinimalTest rendering...');
  console.log('Environment variables:', {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    allEnvVars: import.meta.env
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Minimal Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">React State Test</h2>
          <p className="text-gray-600 mb-4">State value: {test}</p>
          <button 
            onClick={() => setTest('State works!')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test useState
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Supabase URL:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                {import.meta.env.VITE_SUPABASE_URL || '❌ Not found'}
              </code>
            </div>
            <div>
              <span className="font-medium">Supabase Key:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Not found'}
              </code>
            </div>
            <div>
              <span className="font-medium">Mode:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                {import.meta.env.MODE || 'unknown'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalTest;