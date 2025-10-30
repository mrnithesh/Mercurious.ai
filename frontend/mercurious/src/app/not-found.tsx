'use client';

import Link from 'next/link';
import { FaHome, FaArrowLeft, FaYoutube, FaSearch } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-full mb-6">
            <FaSearch className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FaHome className="w-4 h-4" />
            Go to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-50 font-semibold rounded-lg transition-all duration-200"
          >
            <FaYoutube className="w-4 h-4" />
            View Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 text-gray-600 hover:text-slate-900 font-medium transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

