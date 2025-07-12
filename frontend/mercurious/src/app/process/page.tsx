'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Video, 
  Play, 
  Download, 
  FileText, 
  AlertTriangle,
  Loader2,
  Home,
  ArrowLeft,
  Plus,
  Library
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type ProcessingStep = 'fetch' | 'transcript' | 'ai';

export default function ProcessVideo() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    // Validate YouTube URL
    if (!apiClient.isValidYouTubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Show processing steps
      setCurrentStep('fetch');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('transcript');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('ai');
      
      // Make actual API call
      const data = await apiClient.processVideo(videoUrl);
      
      // Redirect to video page
      router.push(`/video/${data.video_id}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process video. Please try again.';
      setError(errorMessage);
      setCurrentStep(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-200/50 shadow-lg shadow-purple-100/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl shadow-lg">
                    <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Mercurious AI
                  </span>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/library" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                    <Library className="w-4 h-4" />
                    Library
                  </Link>
                  <Link href="/process" className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Plus className="w-4 h-4" />
                    Process Video
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
                Process Video
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform any YouTube video into interactive learning content with AI-powered analysis
            </p>
          </header>

          {/* Processing Form */}
          <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-purple-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
                  YouTube Video URL
                </label>
                <div className="flex gap-4 flex-col sm:flex-row">
                  <input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !videoUrl.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 min-w-fit disabled:cursor-not-allowed shadow-lg justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    {isLoading ? 'Processing...' : 'Process Video'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-purple-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Processing Your Video</h3>
                <p className="text-gray-600">
                  Our AI is analyzing the content... This may take a moment
                </p>
              </div>
              
              <div className="space-y-4 max-w-md mx-auto">
                {[
                  { id: 'fetch', icon: Download, text: 'Fetching video information...', color: 'from-violet-500 to-purple-600' },
                  { id: 'transcript', icon: FileText, text: 'Extracting transcript...', color: 'from-orange-500 to-amber-600' },
                  { id: 'ai', icon: Brain, text: 'AI processing content...', color: 'from-fuchsia-500 to-pink-600' }
                ].map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      currentStep === step.id
                        ? 'bg-fuchsia-100 text-fuchsia-800 scale-105'
                        : currentStep && ['fetch', 'transcript', 'ai'].indexOf(currentStep) > ['fetch', 'transcript', 'ai'].indexOf(step.id)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    <div className={`p-3 bg-gradient-to-r ${step.color} rounded-lg shadow-lg`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-lg">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8 shadow-lg">
              <div className="text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  Error Processing Video
                </h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={clearError}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-2xl p-8 border border-purple-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Paste URL</h4>
                  <p className="text-sm text-gray-600">Add any YouTube video URL</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">AI Analysis</h4>
                  <p className="text-sm text-gray-600">Our AI processes the content</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Learn Better</h4>
                  <p className="text-sm text-gray-600">Get summaries, notes, and insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 