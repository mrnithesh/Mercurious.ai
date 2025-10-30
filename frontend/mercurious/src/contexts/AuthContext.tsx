'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  onAuthStateChange, 
  UserData,
  getCurrentUserToken,
  AuthError,
  signInWithGoogle,
  resetPassword
} from '@/lib/firebase/auth';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
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
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag
    setIsClient(true);
    
    // Only set up auth listener on client side
    if (typeof window !== 'undefined') {
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user);
        setInitialized(true);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Server-side: set initialized but keep loading true
      setInitialized(true);
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string) => {
    if (!isClient) throw new Error('Authentication not available on server');
    
    try {
      setError(null);
      setLoading(true);
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isClient) throw new Error('Authentication not available on server');
    
    try {
      setError(null);
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    if (!isClient) throw new Error('Authentication not available on server');
    
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      // Don't show error for popup-closed-by-user
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in with Google');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!isClient) throw new Error('Authentication not available on server');
    
    try {
      setError(null);
      setLoading(true);
      await resetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isClient) throw new Error('Authentication not available on server');
    
    try {
      setError(null);
      await signOutUser();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (!isClient || !initialized) return null;
    
    try {
      return await getCurrentUserToken();
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signInWithGoogle: handleSignInWithGoogle,
    resetPassword: handleResetPassword,
    signOut,
    getToken,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 