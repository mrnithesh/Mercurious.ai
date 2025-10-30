'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaBullseye } from 'react-icons/fa';

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
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <FaBullseye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Question {currentQuestion} of {totalQuestions}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <FaCheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">{answeredQuestions} answered</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>{totalQuestions - answeredQuestions} remaining</span>
              </div>
            </div>
          </div>
        </div>
        
        {timeElapsed > 0 && (
          <div className="flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl">
            <FaClock className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-800">{formatTime(timeElapsed)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        {/* Main Progress */}
        <div className="relative">
          {/* Background Track */}
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            {/* Current Progress */}
            <div 
              className="bg-slate-900 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Answered Progress Overlay */}
          <div className="absolute top-0 w-full h-3">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-300 ease-out opacity-50"
              style={{ width: `${answeredPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Indicators */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const questionNumber = index + 1;
              const isCurrentQuestion = questionNumber === currentQuestion;
              const isAnswered = questionNumber <= answeredQuestions;

              return (
                <div
                  key={index}
                  className={`
                    relative w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200
                    ${isCurrentQuestion 
                      ? 'bg-slate-900 text-white ring-2 ring-blue-200 shadow-md' 
                      : isAnswered 
                        ? 'bg-emerald-500 text-white shadow-sm hover:scale-105' 
                        : 'bg-gray-100 text-gray-600 border border-gray-300 shadow-sm hover:border-gray-400'
                    }
                  `}
                >
                  {isAnswered && !isCurrentQuestion ? (
                    <FaCheckCircle className="w-4 h-4" />
                  ) : (
                    questionNumber
                  )}
                </div>
              );
            })}
          </div>

          {/* Percentage Display */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-xs text-gray-500">complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-slate-900 rounded-lg"></div>
          <span className="font-medium text-gray-700">Current</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-emerald-500 rounded-lg"></div>
          <span className="font-medium text-gray-700">Completed</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-gray-300 rounded-lg"></div>
          <span className="font-medium text-gray-700">Remaining</span>
        </div>
      </div>
    </div>
  );
}
