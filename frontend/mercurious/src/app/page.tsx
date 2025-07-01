'use client';

import { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { apiClient, VideoResponse } from '@/lib/api';

type ProcessingStep = 'fetch' | 'transcript' | 'ai';
type ActiveTab = 'summary' | 'points' | 'concepts' | 'study' | 'vocab' | 'analysis';

export default function Home() {
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
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'points', label: 'Key Points', icon: List },
    { id: 'concepts', label: 'Concepts', icon: Lightbulb },
    { id: 'study', label: 'Study Guide', icon: Book },
    { id: 'vocab', label: 'Vocabulary', icon: SpellCheck },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Mercurious AI
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            AI-Powered Video Learning Assistant
          </p>
        </header>

        {/* Video Processing Section */}
        <main>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <Video className="w-6 h-6 text-blue-600" />
              Process YouTube Video
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 flex-col sm:flex-row">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube URL here..."
                  required
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading || !videoUrl.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2 min-w-fit disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {isLoading ? 'Processing...' : 'Process Video'}
                </button>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Processing video... This may take a moment
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 'fetch', icon: Download, text: 'Fetching video info...' },
                  { id: 'transcript', icon: FileText, text: 'Extracting transcript...' },
                  { id: 'ai', icon: Brain, text: 'AI processing content...' }
                ].map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      currentStep === step.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : currentStep && ['fetch', 'transcript', 'ai'].indexOf(currentStep) > ['fetch', 'transcript', 'ai'].indexOf(step.id)
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                    <span>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 mb-8">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">
                  Error Processing Video
                </h3>
                <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={clearError}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-8">
              {/* Video Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex gap-6 flex-col sm:flex-row">
                  <img
                    src={results.info.thumbnail_url}
                    alt="Video thumbnail"
                    className="w-full sm:w-48 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/320/180';
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      {results.info.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {results.info.author} • {results.info.duration} • {results.info.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === tab.id
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'summary' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <FileText className="w-5 h-5" />
                        Video Summary
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {formatText(results.content.summary)}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'points' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <List className="w-5 h-5" />
                        Main Points
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <ul className="space-y-2">
                          {results.content.main_points.map((point: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
        </div>
                  )}

                  {activeTab === 'concepts' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Lightbulb className="w-5 h-5" />
                        Key Concepts
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {results.content.key_concepts.map((concept: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
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
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Book className="w-5 h-5" />
                        Study Guide
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-gray-700 dark:text-gray-300 font-sans">
                          {formatText(results.content.study_guide)}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'vocab' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <SpellCheck className="w-5 h-5" />
                        Vocabulary
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <ul className="space-y-3">
                          {results.content.vocabulary.map((item: string, index: number) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">
                              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <BarChart3 className="w-5 h-5" />
                        Analysis
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-gray-700 dark:text-gray-300">
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
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 justify-center"
                >
                  <Download className="w-5 h-5" />
                  Download Results
                </button>
                <button
                  onClick={processNewVideo}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 justify-center"
                >
                  <Plus className="w-5 h-5" />
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
