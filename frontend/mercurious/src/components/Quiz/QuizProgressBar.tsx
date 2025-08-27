'use client';

import { CheckCircle, Circle, Clock } from 'lucide-react';

interface QuizProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeElapsed?: number;
  className?: string;
}

export default function QuizProgressBar({ 
  currentQuestion, 
  totalQuestions, 
  answeredQuestions,
  timeElapsed = 0,
  className = '' 
}: QuizProgressBarProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const answeredPercentage = (answeredQuestions / totalQuestions) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-purple-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Question {currentQuestion} of {totalQuestions}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{answeredQuestions} answered</span>
          </div>
        </div>
        
        {timeElapsed > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        {/* Main Progress */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Answered Progress Overlay */}
          <div className="absolute top-0 w-full bg-gray-200 rounded-full h-3 opacity-50">
            <div 
              className="bg-green-400 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${answeredPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Indicators */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const questionNumber = index + 1;
              const isCurrentQuestion = questionNumber === currentQuestion;
              const isAnswered = questionNumber <= answeredQuestions;
              const isPassed = questionNumber < currentQuestion;

              return (
                <div
                  key={index}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
                    ${isCurrentQuestion 
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white ring-4 ring-purple-200 scale-110' 
                      : isAnswered 
                        ? 'bg-green-500 text-white' 
                        : isPassed
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                    }
                  `}
                >
                  {isAnswered && !isCurrentQuestion ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    questionNumber
                  )}
                </div>
              );
            })}
          </div>

          {/* Percentage */}
          <div className="text-sm font-medium text-gray-600">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
          <span>Remaining</span>
        </div>
      </div>
    </div>
  );
}
