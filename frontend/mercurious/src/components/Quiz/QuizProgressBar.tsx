'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const answeredPercentage = (answeredQuestions / totalQuestions) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-purple-100 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full mb-4"></div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-xl border border-purple-200 p-6 backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Question {currentQuestion} of {totalQuestions}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{answeredQuestions} answered</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>{totalQuestions - answeredQuestions} remaining</span>
              </div>
            </div>
          </div>
        </div>
        
        {timeElapsed > 0 && (
          <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 py-2.5 rounded-xl">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-800">{formatTime(timeElapsed)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        {/* Main Progress */}
        <div className="relative">
          {/* Background Track */}
          <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-4 shadow-inner">
            {/* Current Progress */}
            <div 
              className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Animated Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer"></div>
            </div>
          </div>
          
          {/* Answered Progress Overlay */}
          <div className="absolute top-0 w-full h-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out opacity-60 shadow-lg"
              style={{ width: `${answeredPercentage}%` }}
            />
          </div>

          {/* Progress Glow Effect */}
          <div 
            className="absolute top-0 bg-gradient-to-r from-purple-500 to-fuchsia-500 h-4 rounded-full opacity-30 blur-sm transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Question Indicators */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const questionNumber = index + 1;
              const isCurrentQuestion = questionNumber === currentQuestion;
              const isAnswered = questionNumber <= answeredQuestions;
              const isPassed = questionNumber < currentQuestion;

              return (
                <div
                  key={index}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 transform
                    ${isCurrentQuestion 
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white ring-4 ring-purple-200 scale-110 shadow-lg animate-pulse' 
                      : isAnswered 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:scale-105' 
                        : isPassed
                          ? 'bg-gray-300 text-gray-600 shadow-sm'
                          : 'bg-white text-gray-500 border-2 border-gray-300 shadow-sm hover:border-purple-300 hover:text-purple-600'
                    }
                  `}
                >
                  {/* Glow Effect for Current Question */}
                  {isCurrentQuestion && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 opacity-30 blur-md animate-pulse"></div>
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {isAnswered && !isCurrentQuestion ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      questionNumber
                    )}
                  </div>

                  {/* Success Animation */}
                  {isAnswered && !isCurrentQuestion && (
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 animate-ping"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Percentage Display */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 px-4 py-2 rounded-xl border border-purple-200">
            <div className="text-right">
              <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-xs text-gray-500">complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="flex items-center justify-center gap-8 mt-6 p-4 bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="relative">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full shadow-sm"></div>
            <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full opacity-30 blur-sm animate-pulse"></div>
          </div>
          <span className="font-medium text-purple-700">Current</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm"></div>
          <span className="font-medium text-green-700">Completed</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-gray-300 rounded-full shadow-sm"></div>
          <span className="font-medium text-gray-600">Remaining</span>
        </div>
      </div>
    </div>
  );
}
