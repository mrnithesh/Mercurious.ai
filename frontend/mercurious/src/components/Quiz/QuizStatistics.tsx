'use client';

import { useState, useEffect, ReactElement } from 'react';
import { 
  FaChartLine, 
  FaTrophy, 
  FaBullseye, 
  FaCalendar,
  FaClock,
  FaAward,
  FaBrain,
  FaBolt,
  FaStar
} from 'react-icons/fa';
import { QuizStatistics as QuizStatsType } from '@/lib/api/types/quiz';

interface QuizStatisticsProps {
  className?: string;
}

export default function QuizStatistics({ className = '' }: QuizStatisticsProps) {
  const [statistics, setStatistics] = useState<QuizStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const { apiClient } = await import('@/lib/api');
      const stats = await apiClient.quiz.getQuizStatistics();
      setStatistics(stats);
      setError(null);
    } catch (err) {
      console.error('Error loading quiz statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevel = (score: number): {
    level: string;
    color: string;
    bgColor: string;
    icon: ReactElement;
  } => {
    if (score >= 90) {
      return {
        level: 'Master',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: <FaTrophy className="w-6 h-6 text-yellow-500" />
      };
    } else if (score >= 75) {
      return {
        level: 'Expert',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        icon: <FaAward className="w-6 h-6 text-emerald-500" />
      };
    } else if (score >= 60) {
      return {
        level: 'Learner',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: <FaBrain className="w-6 h-6 text-blue-500" />
      };
    } else {
      return {
        level: 'Beginner',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        icon: <FaStar className="w-6 h-6 text-slate-500" />
      };
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-slate-900"></div>
          <span className="ml-3 text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FaChartLine className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Statistics
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadStatistics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.total_quiz_attempts === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <FaChartLine className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Quiz Data Yet
          </h3>
          <p className="text-gray-600">
            Take some quizzes to see your learning statistics and track your progress!
          </p>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(statistics.overall_average_score);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Performance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <FaChartLine className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            Learning Statistics
          </h3>
        </div>

        {/* Performance Level */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${performance.bgColor} mb-4`}>
            {performance.icon}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {statistics.overall_average_score}%
          </h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bgColor} border border-current mb-2`}>
            <span className={`font-semibold ${performance.color}`}>
              {performance.level}
            </span>
          </div>
          <p className="text-gray-600">
            Overall Average Score
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <FaBullseye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {statistics.total_videos_with_quizzes}
            </div>
            <div className="text-sm text-blue-700">Videos Studied</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <FaBolt className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {statistics.total_quiz_attempts}
            </div>
            <div className="text-sm text-emerald-700">Total Attempts</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <FaTrophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {statistics.best_overall_score}%
            </div>
            <div className="text-sm text-yellow-700">Best Score</div>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <FaChartLine className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {statistics.completion_rate}%
            </div>
            <div className="text-sm text-indigo-700">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Progress Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          Learning Insights
        </h4>

        <div className="space-y-4">
          {/* Performance Insights */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <FaBrain className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h5 className="font-medium text-slate-900 mb-1">Performance Analysis</h5>
              <p className="text-sm text-gray-600">
                {statistics.overall_average_score >= 80 
                  ? "Excellent work! You're consistently performing well across different topics."
                  : statistics.overall_average_score >= 60
                  ? "Good progress! Consider reviewing challenging topics to improve further."
                  : "Keep practicing! Regular quiz attempts will help improve your understanding."
                }
              </p>
            </div>
          </div>

          {/* Study Habits */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
              <FaCalendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h5 className="font-medium text-slate-900 mb-1">Study Habits</h5>
              <p className="text-sm text-gray-600">
                {statistics.total_videos_with_quizzes >= 5 
                  ? "Great consistency! You're actively engaging with multiple videos."
                  : "Try taking quizzes on more videos to diversify your learning experience."
                }
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
              <FaStar className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-medium text-slate-900 mb-1">Recommendations</h5>
              <p className="text-sm text-gray-600">
                {statistics.best_overall_score - statistics.overall_average_score > 20
                  ? "Your best performance shows great potential! Focus on consistency to reach that level regularly."
                  : "You're performing consistently! Challenge yourself with more complex topics to continue growing."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          Achievements
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quiz Taker Badge */}
          <div className={`
            p-4 rounded-xl border-2 text-center
            ${statistics.total_quiz_attempts >= 1 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-gray-200 opacity-50'
            }
          `}>
            <div className={`
              w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
              ${statistics.total_quiz_attempts >= 1 ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              <FaBullseye className={`w-6 h-6 ${statistics.total_quiz_attempts >= 1 ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <h5 className={`font-medium mb-1 ${statistics.total_quiz_attempts >= 1 ? 'text-blue-900' : 'text-gray-400'}`}>
              Quiz Taker
            </h5>
            <p className={`text-xs ${statistics.total_quiz_attempts >= 1 ? 'text-blue-700' : 'text-gray-400'}`}>
              Complete your first quiz
            </p>
          </div>

          {/* High Achiever Badge */}
          <div className={`
            p-4 rounded-xl border-2 text-center
            ${statistics.best_overall_score >= 90 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-gray-50 border-gray-200 opacity-50'
            }
          `}>
            <div className={`
              w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
              ${statistics.best_overall_score >= 90 ? 'bg-yellow-100' : 'bg-gray-100'}
            `}>
              <FaTrophy className={`w-6 h-6 ${statistics.best_overall_score >= 90 ? 'text-yellow-600' : 'text-gray-400'}`} />
            </div>
            <h5 className={`font-medium mb-1 ${statistics.best_overall_score >= 90 ? 'text-yellow-900' : 'text-gray-400'}`}>
              High Achiever
            </h5>
            <p className={`text-xs ${statistics.best_overall_score >= 90 ? 'text-yellow-700' : 'text-gray-400'}`}>
              Score 90% or higher
            </p>
          </div>

          {/* Dedicated Learner Badge */}
          <div className={`
            p-4 rounded-xl border-2 text-center
            ${statistics.total_videos_with_quizzes >= 5 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-gray-50 border-gray-200 opacity-50'
            }
          `}>
            <div className={`
              w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
              ${statistics.total_videos_with_quizzes >= 5 ? 'bg-emerald-100' : 'bg-gray-100'}
            `}>
              <FaAward className={`w-6 h-6 ${statistics.total_videos_with_quizzes >= 5 ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <h5 className={`font-medium mb-1 ${statistics.total_videos_with_quizzes >= 5 ? 'text-emerald-900' : 'text-gray-400'}`}>
              Dedicated Learner
            </h5>
            <p className={`text-xs ${statistics.total_videos_with_quizzes >= 5 ? 'text-emerald-700' : 'text-gray-400'}`}>
              Quiz on 5+ videos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
