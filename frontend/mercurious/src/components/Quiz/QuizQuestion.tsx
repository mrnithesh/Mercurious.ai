'use client';

import { useState } from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { QuizQuestion as QuizQuestionType } from '@/lib/api/types/quiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  showResult?: boolean;
  isSubmitted?: boolean;
  className?: string;
}

export default function QuizQuestion({ 
  question, 
  questionIndex, 
  selectedAnswer, 
  onAnswerSelect,
  showResult = false,
  isSubmitted = false,
  className = '' 
}: QuizQuestionProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const getOptionStyle = (option: string) => {
    const isSelected = selectedAnswer === option;
    const isCorrect = option === question.correct_answer;
    const isIncorrect = showResult && isSelected && !isCorrect;
    const isHovered = hoveredOption === option && !isSubmitted;

    if (showResult) {
      if (isCorrect) {
        return 'bg-green-50 border-green-500 text-green-900 ring-2 ring-green-200';
      } else if (isIncorrect) {
        return 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-200';
      } else if (isSelected) {
        return 'bg-blue-50 border-blue-300 text-blue-900';
      } else {
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
    const isCorrect = showResult && option === question.correct_answer;
    const isIncorrect = showResult && isSelected && option !== question.correct_answer;

    if (showResult) {
      if (isCorrect) {
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      } else if (isIncorrect) {
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      }
    }

    return isSelected 
      ? <CheckCircle className="w-5 h-5 text-purple-600" />
      : <Circle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-purple-100 p-8 ${className}`}>
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-full text-sm font-bold">
            {questionIndex + 1}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Question {questionIndex + 1}
          </h3>
        </div>
        
        <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
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
                w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${getOptionStyle(option)}
                ${!isSubmitted ? 'cursor-pointer transform hover:scale-[1.02]' : 'cursor-default'}
                disabled:cursor-default
              `}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {getOptionIcon(option)}
                  <span className="font-medium text-sm bg-gray-100 px-2 py-1 rounded">
                    {optionLetter}
                  </span>
                </div>
                <span className="text-base font-medium flex-1">
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after submission) */}
      {showResult && question.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mt-0.5">
              ?
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Explanation
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Answer Status */}
      {!showResult && selectedAnswer && (
        <div className="text-center">
          <p className="text-sm text-purple-600 font-medium">
            Answer selected: {selectedAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
