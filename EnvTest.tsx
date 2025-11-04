import React from 'react';

const EnvTest: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const appUrl = import.meta.env.VITE_APP_URL;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Environment Variables Test</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Supabase Configuration</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">URL:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                  {supabaseUrl || '❌ Not set'}
                </code>
                {supabaseUrl ? <span className="ml-2 text-green-600">✅</span> : <span className="ml-2 text-red-600">❌</span>}
              </div>
              <div>
                <span className="font-medium text-gray-600">Anon Key:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                  {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ Not set'}
                </code>
                {supabaseKey ? <span className="ml-2 text-green-600">✅</span> : <span className="ml-2 text-red-600">❌</span>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">App Configuration</h2>
            <div>
              <span className="font-medium text-gray-600">App URL:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                {appUrl || 'Not set'}
              </code>
              {appUrl ? <span className="ml-2 text-green-600">✅</span> : <span className="ml-2 text-yellow-600">⚠️</span>}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Status Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className={`p-4 rounded ${supabaseUrl && supabaseKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="text-2xl mb-2">
                  {supabaseUrl && supabaseKey ? '✅' : '❌'}
                </div>
                <div className="font-medium">Supabase</div>
              </div>
              <div className="p-4 rounded bg-yellow-100 text-yellow-800">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="font-medium">Gemini API</div>
                <div className="text-sm">Not configured</div>
              </div>
              <div className="p-4 rounded bg-yellow-100 text-yellow-800">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="font-medium">Stripe</div>
                <div className="text-sm">Not configured</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvTest;