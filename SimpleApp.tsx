import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          CustodyX.AI - Testing
        </h1>
        <p className="text-gray-600">
          Application is loading successfully!
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800 text-sm">
            ✅ React is working<br/>
            ✅ Tailwind CSS is working<br/>
            ✅ TypeScript is working
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;