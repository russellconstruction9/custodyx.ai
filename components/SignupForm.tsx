import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons';

interface SignupFormProps {
  onSignup: (email: string, password: string, displayName: string, role: string, children: string[]) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, onSwitchToLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'Mother' | 'Father' | ''>('');
  const [childrenInput, setChildrenInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!email || !password || !displayName) {
      setValidationError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Parse children names
    const children = childrenInput
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    await onSignup(email, password, displayName, role, children);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your CustodyX.AI account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join thousands of parents documenting their custody journey
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 space-y-4">
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error || validationError}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Mother' | 'Father' | '')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isLoading}
              >
                <option value="">Select your role (optional)</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
              </select>
            </div>

            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-700">
                Children Names
              </label>
              <input
                id="children"
                name="children"
                type="text"
                value={childrenInput}
                onChange={(e) => setChildrenInput(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter children's names (comma separated)"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">Optional: Enter children's names separated by commas</p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Create a password (min 6 characters)"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !password || !displayName || password !== confirmPassword}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;