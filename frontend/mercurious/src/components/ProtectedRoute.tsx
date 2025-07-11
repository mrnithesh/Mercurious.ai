'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal, RegisterModal } from '@/components/Auth';
import { Brain } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasCheckedAuth(true);
      if (!user) {
        setIsLoginModalOpen(true);
      }
    }
  }, [user, loading]);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    // If user closes modals without logging in, don't show them again immediately
    if (!user) {
      // Could redirect to home page here if desired
      window.location.href = '/';
    }
  };

  // Show loading spinner while checking authentication
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl w-fit mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the protected content
  if (user) {
    return <>{children}</>;
  }

  // If user is not authenticated, show authentication prompt
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl w-fit mx-auto mb-6">
          <Brain className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
          Authentication Required
        </h1>
        <p className="text-gray-600 mb-8">
          Please sign in to access this feature and continue your learning journey.
        </p>
        <div className="space-y-4">
          <button
            onClick={openLoginModal}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Sign In
          </button>
          <button
            onClick={openRegisterModal}
            className="w-full px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition-all duration-300"
          >
            Create Account
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeModals} 
        onSwitchToRegister={openRegisterModal} 
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={closeModals} 
        onSwitchToLogin={openLoginModal} 
      />
    </div>
  );
}; 