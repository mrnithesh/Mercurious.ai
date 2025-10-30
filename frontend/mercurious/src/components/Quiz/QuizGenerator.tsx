'use client';

import { useState, useEffect } from 'react';
import { 
  FaBrain,
  FaMagic,
  FaCog,
  FaPlay,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { QuizResponse, QuizAvailability } from '@/lib/api/types/quiz';

interface QuizGeneratorProps {
  videoId: string;
  videoTitle: string;
  onQuizGenerated: (quiz: QuizResponse) => void;
  onError: (error: string) => void;
  onLoadingStart?: () => void;
  isLoading?: boolean;
  availability?: QuizAvailability | null;
}

export default function QuizGenerator({ 
  videoId, 
  videoTitle, 
  onQuizGenerated, 
  onError,
  onLoadingStart,
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
    
    // Notify parent that loading has started
    onLoadingStart?.();
    
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 relative overflow-hidden transition-all duration-300 ${
      isLoading ? 'ring-2 ring-blue-200 ring-opacity-50' : ''
    }`}>
      {/* Loading overlay backdrop */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 animate-pulse pointer-events-none"></div>
      )}
      
      <div className="relative z-10">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-full mb-4 shadow-md transform transition-all duration-200 ${
          isLoading ? 'animate-pulse scale-110' : 'hover:scale-105'
        }`}>
          <FaBrain className={`w-10 h-10 text-white ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-3">
          AI-Powered Quiz
        </h3>
        <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
          Test your understanding of <span className="font-semibold text-slate-900">"{videoTitle}"</span> with an AI-generated quiz tailored to the video content.
        </p>
      </div>

        {/* Existing Quiz Notification */}
        {availability?.quiz_available && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  Use Existing Quiz
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-4 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
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
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-900 rounded-lg">
              <FaCog className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-slate-900">Quiz Configuration</h4>
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
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full text-white text-xl font-bold shadow-md">
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
        <div className="text-center">
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className={`inline-flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed ${
            isLoading 
              ? 'opacity-90 cursor-wait' 
              : 'disabled:opacity-50 transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="w-5 h-5 animate-spin" />
              <span className="text-lg animate-pulse">Generating Quiz...</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
              </div>
            </>
          ) : (
            <>
              <FaMagic className="w-5 h-5" />
              <span className="text-lg">Generate AI Quiz</span>
              <FaPlay className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Generation Info with Animation */}
        <div className={`mt-6 flex items-center justify-center gap-2 text-sm transition-all duration-300 ${
          isLoading ? 'text-blue-600' : 'text-gray-500'
        }`}>
          <FaClock className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
          <p className={isLoading ? 'font-medium' : ''}>
            {isLoading 
              ? "AI is analyzing video content and crafting questions..."
              : "Quiz generation typically takes 10-30 seconds depending on video length"
            }
          </p>
        </div>

        {/* Loading Progress Indicator */}
        {isLoading && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full animate-[loading_2s_ease-in-out_infinite] bg-[length:200%_100%]"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Processing video content...</p>
          </div>
        )}
      </div>

      </div>
      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #0f172a;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.3);
          border: 2px solid white;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.4);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #0f172a;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.3);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.4);
        }
      `}</style>
    </div>
  );
}
