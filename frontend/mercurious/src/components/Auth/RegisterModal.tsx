'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaUser, FaExclamationCircle, FaCheckCircle, FaGoogle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/firebase/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Calculate password strength
  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { strength: 'weak', score };
    if (score <= 4) return { strength: 'medium', score };
    return { strength: 'strong', score };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  // Auto-focus name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError || error) {
      setLocalError(null);
      clearError();
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name);
      onClose();
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      setLocalError(getAuthErrorMessage(err.code));
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setLocalError(null);
    clearError();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Create Account
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Display */}
            {(localError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-shake">
                <FaExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm flex-1">{localError || error}</p>
              </div>
            )}

          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={nameInputRef}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400 text-slate-900 placeholder-gray-400"
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
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
              {formData.password && (
                <span className={`text-xs font-medium ${
                  passwordStrength.strength === 'weak' ? 'text-red-600' :
                  passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                </span>
              )}
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-gray-400 text-slate-900 placeholder-gray-400 ${
                  formData.password ? 
                    passwordStrength.strength === 'weak' ? 'border-red-300 focus:border-red-500' :
                    passwordStrength.strength === 'medium' ? 'border-yellow-300 focus:border-yellow-500' :
                    'border-green-300 focus:border-green-500' :
                  'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Create a password"
                required
                autoComplete="new-password"
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
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="flex gap-1 h-1.5">
                <div className={`flex-1 rounded-full transition-all ${
                  passwordStrength.score >= 1 ? 
                    passwordStrength.strength === 'weak' ? 'bg-red-500' :
                    passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500' :
                    'bg-gray-200'
                }`}></div>
                <div className={`flex-1 rounded-full transition-all ${
                  passwordStrength.score >= 2 ? 
                    passwordStrength.strength === 'weak' ? 'bg-red-500' :
                    passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500' :
                    'bg-gray-200'
                }`}></div>
                <div className={`flex-1 rounded-full transition-all ${
                  passwordStrength.score >= 3 ? 
                    passwordStrength.strength === 'weak' ? 'bg-red-500' :
                    passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500' :
                    'bg-gray-200'
                }`}></div>
                <div className={`flex-1 rounded-full transition-all ${
                  passwordStrength.score >= 4 ? 
                    passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500' :
                    'bg-gray-200'
                }`}></div>
                <div className={`flex-1 rounded-full transition-all ${
                  passwordStrength.score >= 5 ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Must be at least 6 characters long
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-gray-400 text-slate-900 placeholder-gray-400 ${
                  formData.confirmPassword ? 
                    passwordsMatch ? 'border-green-300 focus:border-green-500' : 'border-red-300 focus:border-red-500' :
                    'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="w-4 h-4 text-gray-500" />
                ) : (
                  <FaEye className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {formData.confirmPassword && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  {passwordsMatch ? (
                    <FaCheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <FaExclamationCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
            {formData.confirmPassword && passwordsMatch && (
              <p className="text-xs text-green-600">Passwords match</p>
            )}
          </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !passwordsMatch || passwordStrength.strength === 'weak'}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="w-5 h-5" />
                  Create Account
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

            {/* Switch to Login */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors underline-offset-2 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 