'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal, RegisterModal } from '@/components/Auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    // Only show login modal if auth is initialized and user is not authenticated
    if (initialized && !loading && !user) {
      setIsLoginModalOpen(true);
    }
  }, [user, loading, initialized]);

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

  // Show loading spinner while auth is not initialized or still loading
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-fit mx-auto mb-4 animate-pulse">
            <Image src="/logo.png" alt="Mercurious AI Logo" width={48} height={48} className="w-12 h-12" />
          </div>
          <div className="w-8 h-8 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {!initialized ? 'Initializing authentication...' : 'Checking authentication...'}
          </p>
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-fit mx-auto mb-6">
          <Image src="/logo.png" alt="Mercurious AI Logo" width={64} height={64} className="w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Authentication Required
        </h1>
        <p className="text-gray-600 mb-8">
          Please sign in to access this feature and continue your learning journey.
        </p>
        <div className="space-y-4">
          <button
            onClick={openLoginModal}
            className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Sign In
          </button>
          <button
            onClick={openRegisterModal}
            className="w-full px-6 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-50 font-semibold rounded-lg transition-all duration-200"
          >
            Create Account
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 text-gray-600 hover:text-slate-900 font-medium transition-colors"
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