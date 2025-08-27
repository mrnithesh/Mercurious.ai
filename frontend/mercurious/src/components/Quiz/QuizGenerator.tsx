'use client';

import { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Settings, 
  Play, 
  Loader2,
  AlertCircle,
  CheckCircle
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          AI-Powered Quiz
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Test your understanding of "{videoTitle}" with an AI-generated quiz tailored to the video content.
        </p>
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
        <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-medium text-gray-900">Quiz Settings</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-lg font-bold text-purple-600 min-w-[3ch]">
                  {numQuestions}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Quick (3)</span>
                <span>Comprehensive (15)</span>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>• Questions will cover key concepts and main points</p>
              <p>• Mix of factual, conceptual, and application questions</p>
              <p>• Each question includes detailed explanations</p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Quiz
              <Play className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Generation Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Quiz generation typically takes 10-30 seconds depending on video length
        </p>
      </div>

      {/* Style for custom slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9333ea, #c026d3);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9333ea, #c026d3);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
