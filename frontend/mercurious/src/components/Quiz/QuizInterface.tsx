'use client';

import { useState, useEffect } from 'react';
import { 
  FaChevronLeft,
  FaChevronRight,
  FaPaperPlane,
  FaRedo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBullseye
} from 'react-icons/fa';
import { QuizResponse, QuizSubmission, QuizAnswer, QuizState } from '@/lib/api/types/quiz';
import QuizQuestion from './QuizQuestion';
import QuizProgressBar from './QuizProgressBar';

interface QuizInterfaceProps {
  quiz: QuizResponse;
  onSubmit: (result: any) => void;
  onReset: () => void;
  onError: (error: string) => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function QuizInterface({ 
  quiz, 
  onSubmit, 
  onReset, 
  onError,
  isSubmitting = false,
  className = '' 
}: QuizInterfaceProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: Array(quiz.questions.length).fill(null).map((_, index) => ({
      question_index: index,
      selected_answer: ''
    })),
    timeStarted: null, // Initialize as null to prevent hydration mismatch
    timeElapsed: 0,
    isSubmitted: false,
    result: null
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set timeStarted only on client side
    setQuizState(prev => ({
      ...prev,
      timeStarted: new Date()
    }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (!mounted || !quizState.timeStarted || quizState.isSubmitted) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - quizState.timeStarted!.getTime()) / 1000);
      setQuizState(prev => ({ ...prev, timeElapsed: elapsed }));
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, quizState.timeStarted, quizState.isSubmitted]);

  // Keyboard navigation
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default if we're handling the key
      if (['ArrowLeft', 'ArrowRight', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && quizState.currentQuestionIndex > 0) {
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1
        }));
      } else if (e.key === 'ArrowRight' && quizState.currentQuestionIndex < quiz.questions.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      }
      // Number keys for question jumping (1-9)
      else if (e.key >= '1' && e.key <= '9') {
        const questionIndex = parseInt(e.key) - 1;
        if (questionIndex >= 0 && questionIndex < quiz.questions.length) {
          setQuizState(prev => ({
            ...prev,
            currentQuestionIndex: questionIndex
          }));
        }
      }
      // Letter keys for answer selection (A-D)
      else if (e.key >= 'a' && e.key <= 'd' && e.key.length === 1) {
        const answerIndex = e.key.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
        const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
        if (currentQuestion && currentQuestion.options[answerIndex]) {
          setQuizState(prev => ({
            ...prev,
            answers: prev.answers.map((a, index) => 
              index === prev.currentQuestionIndex 
                ? { ...a, selected_answer: currentQuestion.options[answerIndex] }
                : a
            )
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mounted, quizState.currentQuestionIndex, quiz.questions]);

  if (!mounted) {
    return (
      <div className={`flex flex-col overflow-hidden ${className}`}>
        {/* Loading Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-3"></div>
            <div className="flex justify-between">
              <div className="flex gap-1">
                {Array.from({ length: Math.min(quiz.questions.length, 10) }, (_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Content */}
        <div className="flex-1 px-4 pb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="flex justify-between">
              <div className="h-10 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
  const answeredQuestions = quizState.answers.filter(answer => answer.selected_answer.trim() !== '').length;
  const allQuestionsAnswered = answeredQuestions === quiz.questions.length;

  const handleAnswerSelect = (answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: prev.answers.map((a, index) => 
        index === prev.currentQuestionIndex 
          ? { ...a, selected_answer: answer }
          : a
      )
    }));
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handleSubmitQuiz = async () => {
    // Validate all questions are answered
    const unansweredQuestions = quizState.answers
      .map((answer, index) => ({ answer, index }))
      .filter(({ answer }) => !answer.selected_answer.trim())
      .map(({ index }) => index + 1);

    if (unansweredQuestions.length > 0) {
      onError(`Please answer all questions. Missing: Question${unansweredQuestions.length > 1 ? 's' : ''} ${unansweredQuestions.join(', ')}`);
      return;
    }

    const submission: QuizSubmission = {
      video_id: quiz.video_id,
      answers: quizState.answers
    };

    try {
      console.log('Submitting quiz:', submission);
      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.quiz.submitQuiz(submission);
      console.log('Quiz submission result:', result);
      onSubmit(result);
    } catch (error) {
      console.error('Quiz submission error:', error);
      onError(error instanceof Error ? error.message : 'Failed to submit quiz');
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to reset the quiz? All your answers will be lost.')) {
      setQuizState({
        currentQuestionIndex: 0,
        answers: Array(quiz.questions.length).fill(null).map((_, index) => ({
          question_index: index,
          selected_answer: ''
        })),
        timeStarted: new Date(),
        timeElapsed: 0,
        isSubmitted: false,
        result: null
      });
    }
  };

  const handleQuestionJump = (questionIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: questionIndex
    }));
  };

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* Fixed Header with Progress and Navigation */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 shadow-sm">
        {/* Compact Progress Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900 rounded-lg">
                <FaBullseye className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  Question {quizState.currentQuestionIndex + 1} of {quiz.questions.length}
                </div>
                <div className="text-xs text-gray-600">
                  {answeredQuestions} answered • {quiz.questions.length - answeredQuestions} remaining
                </div>
              </div>
            </div>
          </div>
          
          {quizState.timeElapsed > 0 && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              <FaClock className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800">{Math.floor(quizState.timeElapsed / 60)}:{(quizState.timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Compact Progress Track */}
        <div className="relative mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-slate-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((quizState.currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Navigation Pills */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {quiz.questions.map((_, index) => {
              const isCurrentQuestion = index === quizState.currentQuestionIndex;
              const isAnswered = quizState.answers[index]?.selected_answer.trim() !== '';
              
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionJump(index)}
                  className={`
                    relative w-8 h-8 rounded-lg font-medium text-xs transition-all duration-200 transform hover:scale-105
                    ${isCurrentQuestion 
                      ? 'bg-slate-900 text-white ring-2 ring-blue-200 shadow-md' 
                      : isAnswered 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }
                  `}
                  title={`Question ${index + 1}${isAnswered ? ' (answered)' : ''}`}
                >
                  {index + 1}
                  {isAnswered && !isCurrentQuestion && (
                    <FaCheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-emerald-600 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Compact Question */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-lg text-sm font-bold flex-shrink-0">
              {quizState.currentQuestionIndex + 1}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 leading-tight">
                {currentQuestion.question}
              </h2>
            </div>
          </div>

          {/* Compact Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = quizState.answers[quizState.currentQuestionIndex]?.selected_answer === option;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-3 min-h-[56px] shadow-sm
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-md ring-2 ring-blue-200' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                  aria-label={`Select option ${optionLetter}: ${option}`}
                >
                  <div className={`
                    flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 transition-colors
                    ${isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {optionLetter}
                  </div>
                  <span className="text-sm font-medium flex-1 text-slate-900 leading-relaxed">{option}</span>
                  {isSelected && <FaCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Previous Button */}
          <button
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            aria-label="Previous question"
          >
            <FaChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Center Status */}
          <div className="text-center">
            {allQuestionsAnswered && (
              <div className="text-xs text-emerald-600 font-medium mb-1 flex items-center justify-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
                All answered!
              </div>
            )}
            <div className="text-sm text-gray-600">
              Question {quizState.currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
          </div>

          {/* Next/Submit Button */}
          {quizState.currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className={`
                flex items-center gap-2 px-6 py-2 font-medium rounded-lg transition-all duration-200 shadow-sm
                ${allQuestionsAnswered 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg' 
                  : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={allQuestionsAnswered ? 'Submit quiz' : 'Answer all questions to submit'}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : allQuestionsAnswered ? (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  Submit Quiz
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="w-4 h-4" />
                  Answer All
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md font-medium"
              aria-label="Next question"
            >
              Next
              <FaChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
