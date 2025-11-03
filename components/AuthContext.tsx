import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'Mother' | 'Father' | '';
  children: string[];
  subscriptionTier: 'Free' | 'Plus' | 'Pro';
  tokensUsed: number;
  tokensResetDate: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: string, children: string[]) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const savedUser = localStorage.getItem('custodyx_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const userData: AuthUser = data.user;
      setUser(userData);
      localStorage.setItem('custodyx_user', JSON.stringify(userData));
      localStorage.setItem('custodyx_token', data.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: string, 
    children: string[]
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          displayName,
          role,
          children,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const userData: AuthUser = data.user;
      setUser(userData);
      localStorage.setItem('custodyx_user', JSON.stringify(userData));
      localStorage.setItem('custodyx_token', data.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint to invalidate server-side session
      await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('custodyx_token')}`,
        },
        body: JSON.stringify({
          action: 'logout',
        }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      localStorage.removeItem('custodyx_user');
      localStorage.removeItem('custodyx_token');
      setIsLoading(false);
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('custodyx_user', JSON.stringify(updatedUser));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};