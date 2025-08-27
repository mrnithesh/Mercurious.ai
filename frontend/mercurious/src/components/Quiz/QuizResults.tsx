'use client';

import { useState } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  Target,
  Award,
  Calendar
} from 'lucide-react';
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
      <div className={`bg-white rounded-2xl shadow-xl border border-red-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Trophy className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Results
          </h3>
          <p className="text-red-700 mb-4">
            Quiz results are not available. Please try taking the quiz again.
          </p>
          <button
            onClick={onRetakeQuiz}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
        icon: <Trophy className="w-8 h-8 text-yellow-500" />
      };
    } else if (scorePercentage >= 75) {
      return {
        level: 'Good',
        message: 'Well done! You understand most of the content.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <Award className="w-8 h-8 text-blue-500" />
      };
    } else if (scorePercentage >= 60) {
      return {
        level: 'Fair',
        message: 'Good effort! Consider reviewing the material again.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <Target className="w-8 h-8 text-yellow-500" />
      };
    } else {
      return {
        level: 'Needs Improvement',
        message: 'Keep studying! Review the content and try again.',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <TrendingUp className="w-8 h-8 text-red-500" />
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
      <div className={`bg-white rounded-2xl shadow-xl border ${performance.borderColor} p-8`}>
        <div className="text-center mb-8">
          {/* Performance Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full mb-4">
            {performance.icon}
          </div>
          
          {/* Score Display */}
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {quizResult.score}/{quizResult.total_questions}
          </h2>
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            {scorePercentage}%
          </div>
          
          {/* Performance Level */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bgColor} ${performance.borderColor} border mb-4`}>
            <Star className={`w-5 h-5 ${performance.color}`} />
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
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {quizResult.score}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {quizResult.total_questions - quizResult.score}
            </div>
            <div className="text-sm text-gray-600">Incorrect Answers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
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
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Quiz
          </button>
          
          <button
            onClick={onNewQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-medium rounded-xl border-2 border-purple-600 hover:bg-purple-50 transition-all duration-200 transform hover:scale-105"
          >
            <Trophy className="w-5 h-5" />
            Generate New Quiz
          </button>
        </div>
      </div>

      {/* Quiz Metadata */}
      <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">
              Completed on {formatDate(quizResult.submitted_at)}
            </span>
          </div>
          
          <button
            onClick={() => setShowDetailedReview(!showDetailedReview)}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
          >
            {showDetailedReview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Review
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Review Answers
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detailed Review */}
      {showDetailedReview && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Detailed Answer Review
            </h3>
            <p className="text-gray-600 mb-6">
              Review each question to understand the correct answers and explanations.
            </p>
          </div>

          {questions.map((question, index) => {
            const isCorrect = quizResult.correct_answers.includes(index);
            // For now, we'll show the correct answer as selected since we don't store user answers
            // TODO: Store user answers in the result for proper review
            const userAnswer = question.correct_answer; // Placeholder until we store user answers
            
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
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <QuizQuestion
                  question={question}
                  questionIndex={index}
                  selectedAnswer={userAnswer}
                  onAnswerSelect={() => {}} // Read-only
                  showResult={true}
                  isSubmitted={true}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Encouragement Message */}
      <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">
          Keep Learning! 🚀
        </h3>
        <p className="text-purple-700">
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
