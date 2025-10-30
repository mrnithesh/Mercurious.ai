'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaExclamationCircle, FaGoogle, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const router = useRouter();
  const { signIn, signInWithGoogle, resetPassword, loading, error, clearError } = useAuth();
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const resetEmailInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus email input when modal opens or view changes
  useEffect(() => {
    if (isOpen) {
      if (view === 'login' && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (view === 'forgot-password' && resetEmailInputRef.current) {
        resetEmailInputRef.current.focus();
      }
    }
  }, [isOpen, view]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError || error) {
      setLocalError(null);
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      onClose();
      setFormData({ email: '', password: '' });
      router.push('/dashboard');
    } catch (err: any) {
      setLocalError(getAuthErrorMessage(err.code));
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setResetEmail('');
    setLocalError(null);
    setSuccessMessage(null);
    setView('login');
    clearError();
    onClose();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    clearError();

    if (!resetEmail) {
      setLocalError('Please enter your email address');
      return;
    }

    try {
      await resetPassword(resetEmail);
      setSuccessMessage('Password reset email sent! Check your inbox for instructions.');
      setResetEmail('');
    } catch (err: any) {
      setLocalError(getAuthErrorMessage(err.code));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
      router.push('/dashboard');
    } catch (err: any) {
      // Error is handled by context, but we can add local handling if needed
      if (err.code !== 'auth/popup-closed-by-user') {
        setLocalError(getAuthErrorMessage(err.code));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {view === 'forgot-password' && (
              <button
                onClick={() => {
                  setView('login');
                  setLocalError(null);
                  setSuccessMessage(null);
                  setResetEmail('');
                  clearError();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to login"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-slate-900">
              {view === 'forgot-password' ? 'Reset Password' : 'Welcome Back'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Forgot Password View */}
        {view === 'forgot-password' ? (
          <form onSubmit={handleForgotPassword} className="p-6 space-y-5">
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                  <p className="text-green-700 text-xs mt-1">
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {(localError || error) && !successMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-shake">
                <FaExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm flex-1">{localError || error}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={resetEmailInputRef}
                  type="email"
                  id="resetEmail"
                  name="resetEmail"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (localError || error) {
                      setLocalError(null);
                      clearError();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400 text-slate-900 placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaEnvelope className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        ) : (
          /* Login Form View */
          <div className="p-6">
            {/* Email/Password Form Section */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Display */}
              {(localError || error) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-shake">
                  <FaExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm flex-1">{localError || error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400 text-slate-900 placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot-password');
                      setLocalError(null);
                      clearError();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400 text-slate-900 placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-4 h-4 text-gray-500" />
                    ) : (
                      <FaEye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500 bg-white font-medium">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Sign In Section */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm hover:shadow-md border-2 border-gray-200 hover:border-gray-300"
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
                Continue with Google
              </button>

              {/* Switch to Register */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors underline-offset-2 hover:underline"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 