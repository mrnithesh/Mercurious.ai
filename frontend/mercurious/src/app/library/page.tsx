'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Video, 
  Star, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  BookOpen,
  Play,
  Trash2,
  Clock,
  SortAsc,
  Home,
  Library,
  Eye,
  MoreVertical
} from 'lucide-react';
import { apiClient, VideoLibraryItem } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface VideoCardProps {
  video: VideoLibraryItem;
  onRemove: (videoId: string) => void;
  onToggleFavorite: (videoId: string, isFavorite: boolean) => void;
}

function VideoCard({ video, onRemove, onToggleFavorite }: VideoCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const progressPercentage = Math.round(video.progress * 100);
  
  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove this video from your library?')) {
      setIsRemoving(true);
      try {
        await onRemove(video.video_id);
      } finally {
        setIsRemoving(false);
      }
    }
    setIsMenuOpen(false);
  };

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      await onToggleFavorite(video.video_id, !video.is_favorite);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center overflow-hidden">
          {!imageError && video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-fuchsia-500">
              <Video className="w-12 h-12 text-white" />
            </div>
          )}
        </div>
        
        {/* Progress bar overlay */}
        {video.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black bg-opacity-20">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Progress percentage overlay */}
        {video.progress > 0 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
            {progressPercentage}%
          </div>
        )}

        {/* Favorite star */}
        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="absolute top-3 left-3 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
        >
          <Star 
            className={`w-4 h-4 transition-colors ${
              video.is_favorite 
                ? 'text-yellow-400 fill-current' 
                : 'text-white'
            }`} 
          />
        </button>

        {/* Menu button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <Link
                  href={`/video/${video.video_id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Play className="w-4 h-4" />
                  View Details
                </Link>
                <button
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Star className="w-4 h-4" />
                  {video.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove from Library
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Duration overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/video/${video.video_id}`} className="block group">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-2 text-sm">
            {video.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{video.author}</p>
        </Link>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Added {new Date(video.added_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            {video.notes && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span>Notes</span>
              </div>
            )}
            {video.progress > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-green-500" />
                <span>{progressPercentage}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {(isRemoving || isTogglingFavorite) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  );
}

export default function VideoLibrary() {
  const [videos, setVideos] = useState<VideoLibraryItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'progress'>('newest');

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchTerm, showFavoritesOnly, sortBy]);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getVideoLibrary();
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video library');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let filtered = videos;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(video => video.is_favorite);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
        case 'oldest':
          return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    setFilteredVideos(filtered);
  };

  const handleRemoveVideo = async (videoId: string) => {
    try {
      await apiClient.removeVideoFromLibrary(videoId);
      setVideos(prev => prev.filter(v => v.video_id !== videoId));
    } catch (err) {
      alert('Failed to remove video: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleToggleFavorite = async (videoId: string, isFavorite: boolean) => {
    try {
      await apiClient.toggleVideoFavorite(videoId, isFavorite);
      setVideos(prev => prev.map(v => 
        v.video_id === videoId ? { ...v, is_favorite: isFavorite } : v
      ));
    } catch (err) {
      alert('Failed to update favorite: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your video library...</p>
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
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/library" className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Video Library
              </h1>
              <p className="text-lg text-gray-600">
                {filteredVideos.length} of {videos.length} videos
              </p>
            </div>
            <Link
              href="/process"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </Link>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search videos by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                {/* Favorites toggle */}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    showFavoritesOnly
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  Favorites
                </button>

                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="progress">Progress High-Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={loadLibrary}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Videos Grid */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.video_id}
                  video={video}
                  onRemove={handleRemoveVideo}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : videos.length === 0 ? (
            /* Empty State - No videos */
            <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-purple-100">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-6">
                <Video className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No videos yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start building your video library by processing your first YouTube video.
              </p>
              <Link 
                href="/process"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Process Your First Video
              </Link>
            </div>
          ) : (
            /* Empty State - No filtered results */
            <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-purple-100">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No videos found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setShowFavoritesOnly(false);
                }}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 