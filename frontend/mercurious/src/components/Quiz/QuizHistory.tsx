'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Target,
  RotateCcw,
  Trash2,
  Eye
} from 'lucide-react';
import { QuizResult } from '@/lib/api/types/quiz';

interface QuizHistoryProps {
  videoId: string;
  onRetakeQuiz: () => void;
  onResetHistory?: () => void;
  className?: string;
}

export default function QuizHistory({ 
  videoId, 
  onRetakeQuiz, 
  onResetHistory,
  className = '' 
}: QuizHistoryProps) {
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizHistory();
  }, [videoId]);

  const loadQuizHistory = async () => {
    try {
      setLoading(true);
      const { apiClient } = await import('@/lib/api');
      const historyData = await apiClient.quiz.getQuizHistory(videoId);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      console.error('Error loading quiz history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  const handleResetHistory = async () => {
    if (!window.confirm('Are you sure you want to reset all quiz attempts for this video? This action cannot be undone.')) {
      return;
    }

    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.quiz.resetQuizAttempts(videoId);
      setHistory([]);
      onResetHistory?.();
    } catch (err) {
      console.error('Error resetting quiz history:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset quiz history');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScorePercentage = (result: QuizResult): number => {
    return Math.round((result.score / result.total_questions) * 100);
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBg = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 75) return 'bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (currentIndex: number): JSX.Element | null => {
    if (currentIndex >= history.length - 1) return null;
    
    const current = getScorePercentage(history[currentIndex]);
    const previous = getScorePercentage(history[currentIndex + 1]);
    
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBestScore = (): QuizResult | null => {
    if (history.length === 0) return null;
    return history.reduce((best, current) => 
      getScorePercentage(current) > getScorePercentage(best) ? current : best
    );
  };

  const getAverageScore = (): number => {
    if (history.length === 0) return 0;
    const totalPercentage = history.reduce((sum, result) => sum + getScorePercentage(result), 0);
    return Math.round(totalPercentage / history.length);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-purple-100 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading quiz history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-red-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <History className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading History
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadQuizHistory}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-purple-100 p-8 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <History className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Quiz History
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't taken any quizzes for this video yet. Start your first quiz to track your progress!
          </p>
          <button
            onClick={onRetakeQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
          >
            <Target className="w-5 h-5" />
            Take Your First Quiz
          </button>
        </div>
      </div>
    );
  }

  const bestScore = getBestScore();
  const averageScore = getAverageScore();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Statistics */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Quiz History
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {history.length}
            </div>
            <div className="text-sm text-purple-700">Total Attempts</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {bestScore ? getScorePercentage(bestScore) : 0}%
            </div>
            <div className="text-sm text-green-700">Best Score</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {averageScore}%
            </div>
            <div className="text-sm text-blue-700">Average Score</div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onRetakeQuiz}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Take Quiz Again
          </button>
          
          {onResetHistory && (
            <button
              onClick={handleResetHistory}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Reset History
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">
            Recent Attempts
          </h4>
        </div>

        <div className="divide-y divide-gray-200">
          {history.map((result, index) => {
            const percentage = getScorePercentage(result);
            const trendIcon = getTrendIcon(index);
            
            return (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Attempt Number */}
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                      #{history.length - index}
                    </div>
                    
                    {/* Score and Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-2xl font-bold ${getPerformanceColor(percentage)}`}>
                          {percentage}%
                        </span>
                        <span className="text-gray-600">
                          ({result.score}/{result.total_questions})
                        </span>
                        {trendIcon}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(result.submitted_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(result.time_taken)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceBg(percentage)}`}>
                    {percentage >= 90 ? 'Excellent' : 
                     percentage >= 75 ? 'Good' : 
                     percentage >= 60 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>

                {/* Best Score Indicator */}
                {bestScore && result.submitted_at === bestScore.submitted_at && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">Your best score!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
