'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Video, 
  Play, 
  Download, 
  FileText, 
  List, 
  Lightbulb, 
  Book, 
  SpellCheck,
  BarChart3,
  Plus,
  AlertTriangle,
  Loader2,
  Home,
  ArrowLeft
} from 'lucide-react';
import { apiClient, VideoResponse } from '@/lib/api';

type ProcessingStep = 'fetch' | 'transcript' | 'ai';
type ActiveTab = 'summary' | 'points' | 'concepts' | 'study' | 'vocab' | 'analysis';

export default function ProcessVideo() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VideoResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

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
    setResults(null);

    try {
      // Show processing steps
      setCurrentStep('fetch');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCurrentStep('transcript');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCurrentStep('ai');
      
      // Make actual API call
      const data = await apiClient.processVideo(videoUrl);
      setResults(data);
      setActiveTab('summary');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process video. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const processNewVideo = () => {
    setVideoUrl('');
    setResults(null);
    setError(null);
  };

  const downloadResults = () => {
    if (!results) return;

    // Create downloadable content
    const content = `
# ${results.info.title}

**Author:** ${results.info.author}
**Duration:** ${results.info.duration}
**Views:** ${results.info.views.toLocaleString()}

## Summary
${results.content.summary}

## Main Points
${results.content.main_points.map((point: string) => `• ${point}`).join('\n')}

## Key Concepts
${results.content.key_concepts.map((concept: string) => `• ${concept}`).join('\n')}

## Study Guide
${results.content.study_guide}

## Vocabulary
${results.content.vocabulary.map((item: string) => `• ${item}`).join('\n')}

## Analysis
${results.content.analysis}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2 last:mb-0">{line}</p>
    ));
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText, color: 'from-purple-500 to-violet-600' },
    { id: 'points', label: 'Key Points', icon: List, color: 'from-emerald-500 to-teal-600' },
    { id: 'concepts', label: 'Concepts', icon: Lightbulb, color: 'from-amber-500 to-orange-600' },
    { id: 'study', label: 'Study Guide', icon: Book, color: 'from-fuchsia-500 to-pink-600' },
    { id: 'vocab', label: 'Vocabulary', icon: SpellCheck, color: 'from-violet-500 to-purple-600' },
    { id: 'analysis', label: 'Analysis', icon: BarChart3, color: 'from-rose-500 to-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-200/50 shadow-lg shadow-purple-100/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-fuchsia-600 transition-colors">
                <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                <Home className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Home</span>
              </Link>
              <div className="h-6 w-px bg-purple-300"></div>
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl shadow-lg">
                  <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Mercurious AI
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-lg">
              <Brain className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
              Video Processor
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-800 font-medium">
            AI-Powered Video Learning Assistant
          </p>
        </header>

        {/* Video Processing Section */}
        <main>
          <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-purple-200">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg">
                <Video className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              Process YouTube Video
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 flex-col lg:flex-row">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube URL here..."
                  required
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                />
                <button
                  type="submit"
                  disabled={isLoading || !videoUrl.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 min-w-fit disabled:cursor-not-allowed shadow-lg justify-center text-sm sm:text-base"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  ) : (
                    <Play className="w-4 sm:w-5 h-4 sm:h-5" />
                  )}
                  {isLoading ? 'Processing...' : 'Process Video'}
                </button>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-purple-200">
              <div className="text-center mb-6">
                <div className="w-12 sm:w-16 h-12 sm:h-16 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-base sm:text-lg text-gray-800">
                  Processing video... This may take a moment
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 'fetch', icon: Download, text: 'Fetching video info...', color: 'from-violet-500 to-purple-600' },
                  { id: 'transcript', icon: FileText, text: 'Extracting transcript...', color: 'from-orange-500 to-amber-600' },
                  { id: 'ai', icon: Brain, text: 'AI processing content...', color: 'from-fuchsia-500 to-pink-600' }
                ].map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      currentStep === step.id
                        ? 'bg-fuchsia-100 text-fuchsia-700'
                        : currentStep && ['fetch', 'transcript', 'ai'].indexOf(currentStep) > ['fetch', 'transcript', 'ai'].indexOf(step.id)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    <div className={`p-2 bg-gradient-to-r ${step.color} rounded-lg`}>
                      <step.icon className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg">
              <div className="text-center">
                <AlertTriangle className="w-10 sm:w-12 h-10 sm:h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">
                  Error Processing Video
                </h3>
                <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
                <button
                  onClick={clearError}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-6 sm:space-y-8">
              {/* Video Info Card */}
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-purple-200">
                <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
                  <img
                    src={results.info.thumbnail_url}
                    alt="Video thumbnail"
                    className="w-full sm:w-40 lg:w-48 h-32 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/320/180';
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
                      {results.info.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700">
                      {results.info.author} • {results.info.duration} • {results.info.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-purple-200">
                <div className="border-b border-purple-200">
                  <nav className="flex overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors min-w-fit ${
                          activeTab === tab.id
                            ? 'border-b-2 border-fuchsia-500 text-fuchsia-600 bg-fuchsia-50'
                            : 'text-purple-600 hover:text-purple-800'
                        }`}
                      >
                        <div className={`p-1 bg-gradient-to-r ${tab.color} rounded-md`}>
                          <tab.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-4 sm:p-6">
                  {activeTab === 'summary' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                          <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                        </div>
                        Video Summary
                      </h3>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm sm:text-base text-gray-900">
                          {formatText(results.content.summary)}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'points' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                          <List className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                        </div>
                        Main Points
                      </h3>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <ul className="space-y-2">
                          {results.content.main_points.map((point: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-900">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'concepts' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                          <Lightbulb className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                        </div>
                        Key Concepts
                      </h3>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {results.content.key_concepts.map((concept: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-200 text-amber-800 rounded-full text-xs sm:text-sm font-medium"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'study' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                        <div className="p-2 bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-lg">
                          <Book className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                        </div>
                        Study Guide
                      </h3>
                      <div className="bg-fuchsia-50 rounded-lg p-4">
                        <div className="text-sm sm:text-base text-gray-900 font-sans">
                          {formatText(results.content.study_guide)}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'vocab' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                        <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                          <SpellCheck className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                        </div>
                        Vocabulary
                      </h3>
                      <div className="bg-violet-50 rounded-lg p-4">
                        <ul className="space-y-3">
                          {results.content.vocabulary.map((item: string, index: number) => (
                            <li key={index} className="text-sm sm:text-base text-gray-900">
                              <span className="w-2 h-2 bg-violet-500 rounded-full inline-block mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                        <div className="p-2 bg-gradient-to-r from-rose-500 to-red-600 rounded-lg">
                          <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                        </div>
                        Analysis
                      </h3>
                      <div className="bg-rose-50 rounded-lg p-4">
                        <div className="text-sm sm:text-base text-gray-900">
                          {formatText(results.content.analysis)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-col sm:flex-row">
                <button
                  onClick={downloadResults}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 justify-center shadow-lg text-sm sm:text-base"
                >
                  <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                  Download Results
                </button>
                <button
                  onClick={processNewVideo}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 justify-center shadow-lg text-sm sm:text-base"
                >
                  <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
                  Process Another Video
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 