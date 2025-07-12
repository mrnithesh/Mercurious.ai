'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Video, 
  Star, 
  Play, 
  TrendingUp,
  Clock,
  BookOpen,
  Plus,
  Eye,
  CheckCircle,
  Home,
  Library,
  BarChart3
} from 'lucide-react';
import { apiClient, VideoLibraryItem } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface DashboardStats {
  total_videos: number;
  favorites_count: number;
  watched_count: number;
  completed_count: number;
  recent_videos: VideoLibraryItem[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description: string;
}

function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function RecentVideoCard({ video }: { video: VideoLibraryItem }) {
  const progressPercentage = Math.round(video.progress * 100);
  
  return (
    <Link href={`/video/${video.video_id}`} className="block group">
      <div className="bg-white rounded-lg p-4 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-300">
        <div className="flex items-start gap-3">
          {/* Thumbnail placeholder */}
          <div className="w-16 h-12 bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Video className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {video.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{video.author}</p>
            
            <div className="flex items-center gap-4 mt-2">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{progressPercentage}%</span>
              </div>
              
              {/* Favorite */}
              {video.is_favorite && (
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              )}
              
              {/* Notes indicator */}
              {video.notes && (
                <BookOpen className="w-4 h-4 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getVideoStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
          <div className="text-center">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <Brain className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboardStats}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-200/50 shadow-lg shadow-purple-100/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl shadow-lg">
                    <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Mercurious AI
                  </span>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/library" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                    <Library className="w-4 h-4" />
                    Library
                  </Link>
                  <Link href="/process" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Process Video
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's an overview of your learning progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Videos"
              value={stats?.total_videos || 0}
              icon={Video}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              description="Videos processed"
            />
            <StatCard
              title="Favorites"
              value={stats?.favorites_count || 0}
              icon={Star}
              color="bg-gradient-to-r from-yellow-500 to-orange-500"
              description="Starred videos"
            />
            <StatCard
              title="Watched"
              value={stats?.watched_count || 0}
              icon={Eye}
              color="bg-gradient-to-r from-green-500 to-emerald-500"
              description="Videos started"
            />
            <StatCard
              title="Completed"
              value={stats?.completed_count || 0}
              icon={CheckCircle}
              color="bg-gradient-to-r from-purple-500 to-fuchsia-500"
              description="Videos finished"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/process" className="group">
              <div className="bg-white rounded-xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      Process New Video
                    </h3>
                    <p className="text-sm text-gray-600">Add a YouTube video to your library</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/library" className="group">
              <div className="bg-white rounded-xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <Library className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      View Library
                    </h3>
                    <p className="text-sm text-gray-600">Browse all your processed videos</p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Learning Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stats?.completed_count || 0} of {stats?.total_videos || 0} videos completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Videos */}
          {stats?.recent_videos && stats.recent_videos.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Videos</h2>
                <Link 
                  href="/library" 
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {stats.recent_videos.map((video) => (
                  <RecentVideoCard key={video.video_id} video={video} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {stats?.total_videos === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-purple-100">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-6">
                <Video className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Mercurious AI!
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your learning journey by processing your first YouTube video. 
                Our AI will analyze the content and help you learn more effectively.
              </p>
              <Link 
                href="/process"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Process Your First Video
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 