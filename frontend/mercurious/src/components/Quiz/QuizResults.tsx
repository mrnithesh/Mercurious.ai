'use client';

import { useState } from 'react';
import { 
  FaTrophy, 
  FaRedo, 
  FaEye, 
  FaEyeSlash, 
  FaChartLine, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaStar,
  FaBullseye,
  FaAward,
  FaCalendar
} from 'react-icons/fa';
import { QuizResultResponse } from '@/lib/api/types/quiz';
import QuizQuestion from './QuizQuestion';

interface QuizResultsProps {
  result: QuizResultResponse;
  onRetakeQuiz: () => void;
  onNewQuiz: () => void;
  className?: string;
}

export default function QuizResults({ 
  result, 
  onRetakeQuiz, 
  onNewQuiz, 
  className = '' 
}: QuizResultsProps) {
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  // Safety check to prevent undefined errors
  if (!result || !result.result || !result.questions) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FaTrophy className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Results
          </h3>
          <p className="text-red-700 mb-4">
            Quiz results are not available. Please try taking the quiz again.
          </p>
          <button
            onClick={onRetakeQuiz}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const { result: quizResult, questions } = result;
  const scorePercentage = Math.round((quizResult.score / quizResult.total_questions) * 100);
  
  // Performance level calculation
  const getPerformanceLevel = () => {
    if (scorePercentage >= 90) {
      return {
        level: 'Excellent',
        message: 'Outstanding! You have mastered this content.',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <FaTrophy className="w-8 h-8 text-yellow-500" />
      };
    } else if (scorePercentage >= 75) {
      return {
        level: 'Good',
        message: 'Well done! You understand most of the content.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <FaAward className="w-8 h-8 text-blue-500" />
      };
    } else if (scorePercentage >= 60) {
      return {
        level: 'Fair',
        message: 'Good effort! Consider reviewing the material again.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <FaBullseye className="w-8 h-8 text-yellow-500" />
      };
    } else {
      return {
        level: 'Needs Improvement',
        message: 'Keep studying! Review the content and try again.',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <FaChartLine className="w-8 h-8 text-red-500" />
      };
    }
  };

  const performance = getPerformanceLevel();
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Results Card */}
      <div className={`bg-white rounded-xl shadow-lg border ${performance.borderColor} p-8`}>
        <div className="text-center mb-8">
          {/* Performance Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-full mb-4 shadow-md">
            {performance.icon}
          </div>
          
          {/* Score Display */}
          <h2 className="text-4xl font-bold text-slate-900 mb-2">
            {quizResult.score}/{quizResult.total_questions}
          </h2>
          <div className="text-6xl font-bold text-slate-900 mb-4">
            {scorePercentage}%
          </div>
          
          {/* Performance Level */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bgColor} ${performance.borderColor} border mb-4`}>
            <FaStar className={`w-5 h-5 ${performance.color}`} />
            <span className={`font-semibold ${performance.color}`}>
              {performance.level}
            </span>
          </div>
          
          <p className={`text-lg ${performance.color} font-medium`}>
            {performance.message}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {quizResult.score}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <FaTimesCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {quizResult.total_questions - quizResult.score}
            </div>
            <div className="text-sm text-gray-600">Incorrect Answers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <FaClock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(quizResult.time_taken)}
            </div>
            <div className="text-sm text-gray-600">Time Taken</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetakeQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FaRedo className="w-5 h-5" />
            Retake Quiz
          </button>
          
          <button
            onClick={onNewQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-medium rounded-xl border-2 border-slate-900 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-sm"
          >
            <FaTrophy className="w-5 h-5" />
            Generate New Quiz
          </button>
        </div>
      </div>

      {/* Quiz Metadata */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="w-5 h-5" />
            <span className="text-sm">
              Completed on {formatDate(quizResult.submitted_at)}
            </span>
          </div>
          
          <button
            onClick={() => setShowDetailedReview(!showDetailedReview)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            {showDetailedReview ? (
              <>
                <FaEyeSlash className="w-4 h-4" />
                Hide Review
              </>
            ) : (
              <>
                <FaEye className="w-4 h-4" />
                Review Answers
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detailed Review */}
      {showDetailedReview && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Detailed Answer Review
            </h3>
            <p className="text-gray-600 mb-6">
              Review each question to understand the correct answers and explanations.
            </p>
          </div>

          {questions.map((question, index) => {
            const isCorrect = quizResult.correct_answers.includes(index);
            const userAnswer = quizResult.user_answers[index] || '';
            const correctAnswer = question.correct_answer;
            
            return (
              <div key={index} className="relative">
                {/* Correct/Incorrect Badge */}
                <div className="absolute -top-3 -right-3 z-10">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full shadow-lg
                    ${isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                    }
                  `}>
                    {isCorrect ? (
                      <FaCheckCircle className="w-5 h-5" />
                    ) : (
                      <FaTimesCircle className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center w-7 h-7 bg-slate-900 text-white rounded-lg text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-slate-900 leading-tight">
                        {question.question}
                      </h2>
                    </div>
                  </div>

                  {/* Answer Options with Review Styling */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const optionLetter = String.fromCharCode(65 + optionIndex);
                      const isCorrect = option === correctAnswer;
                      const isUserAnswer = option === userAnswer;
                      const isIncorrect = isUserAnswer && !isCorrect;
                      
                      return (
                        <div
                          key={optionIndex}
                          className={`
                            w-full p-3 rounded-lg border-2 text-left flex items-center gap-3 min-h-[48px] shadow-sm
                            ${isCorrect && isUserAnswer
                              ? 'bg-green-50 border-green-500 text-green-900 shadow-green-100'
                              : isCorrect
                                ? 'bg-green-50 border-green-300 text-green-800 shadow-green-50'
                                : isIncorrect
                                  ? 'bg-red-50 border-red-500 text-red-900 shadow-red-100'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                            }
                          `}
                        >
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0
                            ${isCorrect && isUserAnswer
                              ? 'bg-green-500 text-white'
                              : isCorrect
                                ? 'bg-green-400 text-white'
                                : isIncorrect
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                            }
                          `}>
                            {optionLetter}
                          </div>
                          <span className="text-sm font-medium flex-1 text-inherit leading-relaxed">{option}</span>
                          
                          {/* Labels for review mode */}
                          <div className="flex gap-1">
                            {isCorrect && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                                ✓ Correct
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                                ✗ Your Answer
                              </span>
                            )}
                            {isUserAnswer && isCorrect && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                                ✓ Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                          i
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Explanation</h4>
                          <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Encouragement Message */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Keep Learning! 🚀
        </h3>
        <p className="text-gray-700">
          {scorePercentage >= 80 
            ? "Excellent work! You're ready to tackle more challenging content."
            : scorePercentage >= 60
            ? "Good progress! Consider reviewing the video content and trying again."
            : "Don't give up! Learning takes practice. Review the material and try again."
          }
        </p>
      </div>
    </div>
  );
}
