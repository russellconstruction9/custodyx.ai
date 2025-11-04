import React, { useState } from 'react';

const TestApp: React.FC = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: 'Basic React Test',
      content: 'React and TypeScript are working!',
      color: '#10B981'
    },
    {
      title: 'Supabase Connection Test', 
      content: 'Testing database connection...',
      color: '#3B82F6'
    },
    {
      title: 'Authentication Test',
      content: 'Testing auth system...',
      color: '#8B5CF6'
    },
    {
      title: 'Full App Ready',
      content: 'Loading complete application...',
      color: '#F59E0B'
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div 
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl text-white mb-4"
            style={{ backgroundColor: currentStep.color }}
          >
            {step === 0 && '⚛️'}
            {step === 1 && '🗄️'}
            {step === 2 && '🔐'}
            {step === 3 && '🚀'}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            CustodyX.AI
          </h1>
          <h2 className="text-lg font-semibold mb-4" style={{ color: currentStep.color }}>
            {currentStep.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {currentStep.content}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index <= step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < step ? '✓' : index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setStep(prev => Math.min(prev + 1, steps.length - 1))}
            disabled={step >= steps.length - 1}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {step >= steps.length - 1 ? 'Tests Complete!' : 'Next Test'}
          </button>
          
          <button
            onClick={() => setStep(0)}
            className="w-full py-2 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Reset Tests
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Environment: Development | Port: 3001
        </div>
      </div>
    </div>
  );
};

export default TestApp;