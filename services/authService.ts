import { StackClientApp, StackServerApp } from '@stackframe/stack';

// Initialize Stack Auth for client-side
export const stackClientApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
});

// Initialize Stack Auth for server-side  
export const stackServerApp = new StackServerApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
});

// Stack Auth utilities for React components
export const useStackAuth = () => {
  const user = stackClientApp.useUser();
  
  return {
    user,
    isAuthenticated: !!user,
    signIn: () => stackClientApp.redirectToSignIn(),
    signOut: () => user?.signOut(),
    signUp: () => stackClientApp.redirectToSignUp(),
  };
};

// Simple auth state management for non-React contexts
export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

// Mock auth for development - replace with real Stack Auth integration
let currentUser: AuthUser | null = null;

export const getCurrentUser = (): AuthUser | null => {
  return currentUser;
};

export const setCurrentUser = (user: AuthUser | null) => {
  currentUser = user;
};

export const isAuthenticated = (): boolean => {
  return currentUser !== null;
};

// Simple authentication functions for the current app structure
export const signIn = async (email: string, password: string): Promise<AuthUser | null> => {
  // For now, create a mock user - replace with actual Stack Auth
  const user: AuthUser = {
    id: `user_${Date.now()}`,
    email: email,
    displayName: email.split('@')[0]
  };
  setCurrentUser(user);
  return user;
};

export const signOut = async (): Promise<void> => {
  setCurrentUser(null);
};

export const signUp = async (email: string, password: string, displayName?: string): Promise<AuthUser | null> => {
  // For now, create a mock user - replace with actual Stack Auth
  const user: AuthUser = {
    id: `user_${Date.now()}`,
    email: email,
    displayName: displayName || email.split('@')[0]
  };
  setCurrentUser(user);
  return user;
};