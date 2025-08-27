'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Settings, 
  Play, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { QuizResponse, QuizAvailability } from '@/lib/api/types/quiz';

interface QuizGeneratorProps {
  videoId: string;
  videoTitle: string;
  onQuizGenerated: (quiz: QuizResponse) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
  availability?: QuizAvailability | null;
}

export default function QuizGenerator({ 
  videoId, 
  videoTitle, 
  onQuizGenerated, 
  onError,
  isLoading = false,
  availability 
}: QuizGeneratorProps) {
  const [numQuestions, setNumQuestions] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerateQuiz = () => {
    if (isLoading) return;
    
    // Import and call the API
    import('@/lib/api').then(({ apiClient }) => {
      apiClient.quiz.generateQuiz(videoId, numQuestions)
        .then(quiz => {
          onQuizGenerated(quiz);
        })
        .catch(error => {
          console.error('Quiz generation error:', error);
          onError(error.message || 'Failed to generate quiz');
        });
    });
  };

  const handleUseExistingQuiz = () => {
    if (!availability?.quiz_available) return;
    
    import('@/lib/api').then(({ apiClient }) => {
      apiClient.quiz.getQuiz(videoId)
        .then(quiz => {
          onQuizGenerated(quiz);
        })
        .catch(error => {
          console.error('Error loading existing quiz:', error);
          onError(error.message || 'Failed to load existing quiz');
        });
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8">
        <div className="animate-pulse">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50 opacity-60"></div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-fuchsia-200/20 rounded-full blur-xl"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full mb-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl">
            <Brain className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-3">
            AI-Powered Quiz
          </h3>
          <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
            Test your understanding of <span className="font-semibold text-purple-600">"{videoTitle}"</span> with an AI-generated quiz tailored to the video content.
          </p>
        </div>
      </div>

      {/* Existing Quiz Notification */}
      {availability?.quiz_available && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Quiz Available
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                A quiz for this video was generated on{' '}
                {availability.generated_at 
                  ? new Date(availability.generated_at).toLocaleDateString()
                  : 'recently'
                }. You can use it or generate a new one.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleUseExistingQuiz}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Use Existing Quiz
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Generate New Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Settings */}
      {(showSettings || !availability?.quiz_available) && (
        <div className="relative z-10 mb-8 p-6 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-200 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Quiz Configuration</h4>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Number of Questions
              </label>
              <div className="flex items-center gap-6">
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-purple-200 to-fuchsia-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-4 focus:ring-purple-200"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Quick (3-5)
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Moderate (6-10)
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Comprehensive (11-15)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full text-white text-xl font-bold shadow-lg">
                    {numQuestions}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Questions</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-blue-900">Factual Recall</p>
                  <p className="text-blue-700 text-xs">Key facts and definitions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-green-900">Conceptual</p>
                  <p className="text-green-700 text-xs">Understanding concepts</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-orange-900">Application</p>
                  <p className="text-orange-700 text-xs">Apply knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="relative z-10 text-center">
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-semibold rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-1"
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
          
          {/* Button Content */}
          <div className="relative z-10 flex items-center gap-3">
            {isLoading ? (
              <>
                <div className="relative">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <div className="absolute inset-0 w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-pulse"></div>
                </div>
                <span className="text-lg">Generating Quiz...</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                <span className="text-lg">Generate AI Quiz</span>
                <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </div>
          
          {/* Shimmer Effect */}
          {!isLoading && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 -top-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          )}
        </button>

        {/* Generation Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <p>
            {isLoading 
              ? "AI is analyzing video content and crafting questions..."
              : "Quiz generation typically takes 10-30 seconds depending on video length"
            }
          </p>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9333ea, #c026d3);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
          border: 3px solid white;
          transition: all 0.3s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(147, 51, 234, 0.6);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9333ea, #c026d3);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
          transition: all 0.3s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(147, 51, 234, 0.6);
        }

        .bg-size-200 {
          background-size: 200% 200%;
        }

        .bg-pos-0 {
          background-position: 0% 50%;
        }

        .bg-pos-100 {
          background-position: 100% 50%;
        }
      `}</style>
    </div>
  );
}
