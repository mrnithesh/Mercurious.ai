'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FaBrain, 
  FaYoutube, 
  FaPlay, 
  FaDownload, 
  FaFileAlt, 
  FaExclamationTriangle,
  FaHome,
  FaPlus,
  FaSpinner,
  FaInfoCircle,
  FaArrowRight
} from 'react-icons/fa';
import { apiClient } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserMenu } from '@/components/Auth';
import { useToast } from '@/contexts/ToastContext';

type ProcessingStep = 'fetch' | 'transcript' | 'ai';

// Example videos that are already processed and available for demonstration
const EXAMPLE_VIDEOS = [
  {
    video_id: 'JxgmHe2NyeY',
    title: 'Complete Machine Learning In 6 Hours| Krish Naik',
    description: 'This video is a complete machine learning course in 6 hours. It covers all the basics of machine learning.',
    thumbnail_url: 'https://i.ytimg.com/vi/JxgmHe2NyeY/hqdefault.jpg'
  },
  {
    video_id: 'If1Lw4pLLEo',
    title: 'Spring Framework Tutorial | Full Course',
    description: 'This video is a complete spring framework course. It covers all the basics of spring framework.',
    thumbnail_url: 'https://i.ytimg.com/vi/If1Lw4pLLEo/hqdefault.jpg'
  },
  {
    video_id: 'iInUBOVeBCc',
    title: 'NGINX Explained - What is Nginx',
    description: 'Complete Nginx course. It covers all the basics of Nginx.',
    thumbnail_url: 'https://i.ytimg.com/vi/iInUBOVeBCc/hqdefault.jpg'
  }
];

export default function ProcessVideo() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    // Validate YouTube URL
    if (!apiClient.isValidYouTubeUrl(videoUrl)) {
      const errorMsg = 'Please enter a valid YouTube URL';
      setError(errorMsg);
      showError(errorMsg);
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
      showSuccess('Video processed successfully!');
      router.push(`/video/${data.video_id}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process video. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
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
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Image src="/logo.png" alt="Mercurious AI Logo" width={40} height={40} className="w-9 sm:w-10 h-9 sm:h-10" />
                  <span className="text-lg sm:text-xl font-bold text-slate-900">
                    Mercurious AI
                  </span>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-slate-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaHome className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/process" className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg">
                    <FaPlus className="w-4 h-4" />
                    Process Video
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex items-center">
                <UserMenu />
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image src="/logo.png" alt="Mercurious AI Logo" width={48} height={48} className="w-12 h-12" />
              <h1 className="text-4xl font-bold text-slate-900">
                Process Video
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform any YouTube video into interactive learning content with AI-powered analysis
            </p>
          </header>

          {/* Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <FaInfoCircle className="w-6 h-6 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Cloud Hosting Limitation
                </h3>
                <p className="text-amber-800">
                  Note: New video processing is currently unavailable on cloud hosting due to network restrictions from YouTube. 
                  However, you can explore our pre-processed example videos below to experience the full functionality of Mercurious AI or use the local hosting.
                </p>
              </div>
            </div>
          </div>

          {/* Processing Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-700">
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !videoUrl.trim()}
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 min-w-fit disabled:cursor-not-allowed shadow-sm hover:shadow-md justify-center"
                  >
                    {isLoading ? (
                      <FaSpinner className="w-5 h-5 animate-spin" />
                    ) : (
                      <FaPlay className="w-5 h-5" />
                    )}
                    {isLoading ? 'Processing...' : 'Process Video'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">Processing Your Video</h3>
                <p className="text-gray-600">
                  Our AI is analyzing the content... This may take a moment
                </p>
              </div>
              
              <div className="space-y-4 max-w-md mx-auto">
                {[
                  { id: 'fetch', icon: FaDownload, text: 'Fetching video information...', bgColor: 'bg-blue-100', textColor: 'text-blue-800', iconBg: 'bg-blue-500' },
                  { id: 'transcript', icon: FaFileAlt, text: 'Extracting transcript...', bgColor: 'bg-orange-100', textColor: 'text-orange-800', iconBg: 'bg-orange-500' },
                  { id: 'ai', icon: FaBrain, text: 'AI processing content...', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', iconBg: 'bg-emerald-500' }
                ].map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      currentStep === step.id
                        ? `${step.bgColor} ${step.textColor} scale-105`
                        : currentStep && ['fetch', 'transcript', 'ai'].indexOf(currentStep) > ['fetch', 'transcript', 'ai'].indexOf(step.id)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <div className={`p-3 ${step.iconBg} rounded-lg shadow-sm`}>
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
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8 shadow-lg">
              <div className="text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  Error Processing Video
                </h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={clearError}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Example Videos Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Try Pre-processed Example Videos
              </h2>
              <p className="text-gray-600">
                Explore these already processed videos to see Mercurious AI in action
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXAMPLE_VIDEOS.map((video) => (
                <Link
                  key={video.video_id}
                  href={`/video/${video.video_id}`}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/640x360?text=Video+Thumbnail';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="p-3 bg-white/90 rounded-full">
                          <FaPlay className="w-5 h-5 text-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-2 text-slate-900 font-medium text-sm group-hover:gap-3 transition-all">
                      <span>View Processed Video</span>
                      <FaArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FaYoutube className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Paste URL</h4>
                  <p className="text-sm text-gray-600">Add any YouTube video URL</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <FaBrain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">AI Analysis</h4>
                  <p className="text-sm text-gray-600">Our AI processes the content</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-600 rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Learn Better</h4>
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