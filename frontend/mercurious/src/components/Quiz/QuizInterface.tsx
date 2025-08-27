'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { QuizResponse, QuizSubmission, QuizAnswer, QuizState } from '@/lib/api/types/quiz';
import QuizQuestion from './QuizQuestion';
import QuizProgressBar from './QuizProgressBar';

interface QuizInterfaceProps {
  quiz: QuizResponse;
  onSubmit: (submission: QuizSubmission) => void;
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
    timeStarted: new Date(),
    timeElapsed: 0,
    isSubmitted: false,
    result: null
  });

  // Timer effect
  useEffect(() => {
    if (!quizState.timeStarted || quizState.isSubmitted) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - quizState.timeStarted!.getTime()) / 1000);
      setQuizState(prev => ({ ...prev, timeElapsed: elapsed }));
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState.timeStarted, quizState.isSubmitted]);

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

  const handleSubmitQuiz = () => {
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

    onSubmit(submission);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the quiz? All your answers will be lost.')) {
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
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      <QuizProgressBar
        currentQuestion={quizState.currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        answeredQuestions={answeredQuestions}
        timeElapsed={quizState.timeElapsed}
      />

      {/* Question Navigation Pills */}
      <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {quiz.questions.map((_, index) => {
            const isCurrentQuestion = index === quizState.currentQuestionIndex;
            const isAnswered = quizState.answers[index]?.selected_answer.trim() !== '';
            
            return (
              <button
                key={index}
                onClick={() => handleQuestionJump(index)}
                className={`
                  w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105
                  ${isCurrentQuestion 
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white ring-2 ring-purple-200' 
                    : isAnswered 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {index + 1}
                {isAnswered && !isCurrentQuestion && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      <QuizQuestion
        question={currentQuestion}
        questionIndex={quizState.currentQuestionIndex}
        selectedAnswer={quizState.answers[quizState.currentQuestionIndex]?.selected_answer || null}
        onAnswerSelect={handleAnswerSelect}
        showResult={false}
        isSubmitted={false}
      />

      {/* Navigation and Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Question Counter & Status */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">
              {answeredQuestions} of {quiz.questions.length} answered
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{Math.floor(quizState.timeElapsed / 60)}:{(quizState.timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Next/Submit Button */}
          {quizState.currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className={`
                flex items-center gap-2 px-6 py-2 font-medium rounded-lg transition-all duration-200 transform hover:scale-105
                ${allQuestionsAnswered 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : allQuestionsAnswered ? (
                <>
                  <Send className="w-4 h-4" />
                  Submit Quiz
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Answer All ({quiz.questions.length - answeredQuestions} left)
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Reset Button */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Quiz
          </button>
        </div>
      </div>

      {/* Completion Status */}
      {allQuestionsAnswered && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-green-900">
                All Questions Answered!
              </h3>
              <p className="text-sm text-green-700">
                You've completed all {quiz.questions.length} questions in {Math.floor(quizState.timeElapsed / 60)}:{(quizState.timeElapsed % 60).toString().padStart(2, '0')}. 
                Ready to submit your quiz?
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
