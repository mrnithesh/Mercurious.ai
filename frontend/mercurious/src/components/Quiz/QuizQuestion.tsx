'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { QuizQuestion as QuizQuestionType } from '@/lib/api/types/quiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  showResult?: boolean;
  isSubmitted?: boolean;
  userAnswer?: string; // For review mode - what the user actually selected
  className?: string;
}

export default function QuizQuestion({ 
  question, 
  questionIndex, 
  selectedAnswer, 
  onAnswerSelect,
  showResult = false,
  isSubmitted = false,
  userAnswer,
  className = '' 
}: QuizQuestionProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-purple-100 p-8 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getOptionStyle = (option: string) => {
    const isSelected = selectedAnswer === option;
    const isCorrect = option === question.correct_answer;
    const isUserAnswer = showResult && userAnswer === option;
    const isIncorrect = showResult && isUserAnswer && !isCorrect;
    const isHovered = hoveredOption === option && !isSubmitted;

    if (showResult) {
      if (isCorrect && isUserAnswer) {
        // User selected the correct answer
        return 'bg-green-50 border-green-500 text-green-900 ring-2 ring-green-200';
      } else if (isCorrect) {
        // This is the correct answer (but user didn't select it)
        return 'bg-green-50 border-green-300 text-green-800 ring-1 ring-green-100';
      } else if (isIncorrect) {
        // User selected this incorrect answer
        return 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-200';
      } else {
        // Other options
        return 'bg-gray-50 border-gray-200 text-gray-700';
      }
    }

    if (isSelected) {
      return 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200';
    }

    if (isHovered) {
      return 'bg-purple-25 border-purple-300 text-purple-800';
    }

    return 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-25';
  };

  const getOptionIcon = (option: string) => {
    const isSelected = selectedAnswer === option;
    const isCorrect = option === question.correct_answer;
    const isUserAnswer = showResult && userAnswer === option;
    const isIncorrect = showResult && isUserAnswer && !isCorrect;

    if (showResult) {
      if (isCorrect && isUserAnswer) {
        // User selected the correct answer
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      } else if (isCorrect) {
        // This is the correct answer (show as correct)
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      } else if (isIncorrect) {
        // User selected this incorrect answer
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      } else {
        // Other options
        return <Circle className="w-5 h-5 text-gray-400" />;
      }
    }

    return isSelected 
      ? <CheckCircle className="w-5 h-5 text-purple-600" />
      : <Circle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className={`bg-gradient-to-br from-white to-purple-50/30 rounded-3xl shadow-2xl border border-purple-200 p-8 relative overflow-hidden ${className}`}>
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/40 to-fuchsia-100/40 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/40 to-purple-100/40 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
      
      {/* Question Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl text-lg font-bold shadow-lg transform transition-all duration-300 hover:scale-110">
              {questionIndex + 1}
            </div>
            <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl opacity-30 blur-md animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Question {questionIndex + 1}
            </h3>
            <div className="text-sm text-gray-500 mt-1">
              {showResult ? 'Review Mode' : 'Select the best answer'}
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50/50 to-fuchsia-50/50 rounded-2xl p-6 border border-purple-100">
          <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
            {question.question}
          </h2>
        </div>
      </div>

      {/* Answer Options */}
      <div className="relative z-10 space-y-4 mb-8">
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          
          return (
            <button
              key={index}
              onClick={() => !isSubmitted && onAnswerSelect(option)}
              onMouseEnter={() => setHoveredOption(option)}
              onMouseLeave={() => setHoveredOption(null)}
              disabled={isSubmitted}
              className={`
                group relative w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left shadow-lg hover:shadow-xl
                ${getOptionStyle(option)}
                ${!isSubmitted ? 'cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1' : 'cursor-default'}
                disabled:cursor-default overflow-hidden
              `}
            >
              {/* Option Background Glow */}
              {selectedAnswer === option && !showResult && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 rounded-2xl blur-xl"></div>
              )}
              
              {/* Option Content */}
              <div className="relative z-10 flex items-center gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getOptionIcon(option)}
                    {selectedAnswer === option && !showResult && (
                      <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 animate-ping"></div>
                    )}
                  </div>
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shadow-md transition-all duration-300
                    ${selectedAnswer === option 
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white transform scale-110' 
                      : 'bg-white text-gray-600 border border-gray-300 group-hover:border-purple-300 group-hover:text-purple-600'
                    }
                  `}>
                    {optionLetter}
                  </div>
                </div>
                <span className="text-lg font-medium flex-1 leading-relaxed">
                  {option}
                </span>
                
                {/* Labels for review mode */}
                {showResult && (
                  <div className="flex gap-1">
                    {option === question.correct_answer && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                        ✓ Correct
                      </span>
                    )}
                    {userAnswer === option && option !== question.correct_answer && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                        ✗ Your Answer
                      </span>
                    )}
                    {userAnswer === option && option === question.correct_answer && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                        ✓ Your Answer
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Hover Shimmer Effect */}
              {!isSubmitted && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after submission) */}
      {showResult && question.explanation && (
        <div className="relative z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg">
              💡
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                Explanation
                <div className="h-px flex-1 bg-gradient-to-r from-blue-300 to-transparent"></div>
              </h4>
              <p className="text-base text-blue-800 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Answer Status */}
      {!showResult && selectedAnswer && (
        <div className="relative z-10 text-center mt-6">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 px-6 py-3 rounded-2xl border border-purple-200 shadow-lg">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-semibold text-purple-800">
                Answer Selected
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {selectedAnswer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
