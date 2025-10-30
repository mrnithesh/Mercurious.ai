'use client';

import { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import Link from 'next/link';
import { FixedSizeGrid as Grid } from 'react-window';
import { 
  FaBrain, 
  FaYoutube, 
  FaStar, 
  FaSearch, 
  FaPlay, 
  FaChartLine,
  FaClock,
  FaBookOpen,
  FaPlus,
  FaEye,
  FaCheckCircle,
  FaHome,
  FaEllipsisV,
  FaTrash
} from 'react-icons/fa';
import { 
  MdVideoLibrary,
  MdFilterList
} from 'react-icons/md';
import { apiClient, VideoLibraryItem } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/Auth';

// Helper function to calculate stats from video library
function calculateStats(videos: VideoLibraryItem[]) {
  const totalVideos = videos.length;
  const favoritesCount = videos.filter(video => video.is_favorite).length;
  const watchedCount = videos.filter(video => video.progress > 0).length;
  const completedCount = videos.filter(video => video.progress >= 0.9).length;
  const inProgressCount = videos.filter(video => video.progress > 0 && video.progress < 0.9).length;
  
  return {
    totalVideos,
    favoritesCount,
    watchedCount,
    completedCount,
    inProgressCount
  };
}

// Lazy Image component for performance optimization
function LazyImage({ src, alt, className, onError }: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const handleImageError = () => {
    setError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setLoaded(true);
  };

  return (
    <div ref={imgRef} className={className}>
      {inView && !error ? (
        <img 
          src={src} 
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-700">
          <FaYoutube className="w-12 h-12 text-white" />
        </div>
      )}
      
      {/* Loading placeholder */}
      {inView && !loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
          <div className="animate-pulse">
            <FaYoutube className="w-12 h-12 text-white opacity-50" />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get smart video sections
function getVideoSections(videos: VideoLibraryItem[]) {
  const continueWatching = videos
    .filter(video => video.progress > 0 && video.progress < 0.9)
    .sort((a, b) => new Date(b.last_watched || b.added_at).getTime() - new Date(a.last_watched || a.added_at).getTime())
    .slice(0, 6);

  const recentlyAdded = videos
    .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    .slice(0, 8);

  const favorites = videos
    .filter(video => video.is_favorite)
    .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    .slice(0, 6);

  return {
    continueWatching,
    recentlyAdded,
    favorites
  };
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
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: VideoLibraryItem;
  onRemove?: (videoId: string) => void;
  onToggleFavorite?: (videoId: string, isFavorite: boolean) => void;
  showMenu?: boolean;
}

const VideoCard = memo(function VideoCard({ video, onRemove, onToggleFavorite, showMenu = true }: VideoCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const progressPercentage = useMemo(() => Math.round(video.progress * 100), [video.progress]);
  
  const handleRemove = useCallback(async () => {
    if (confirm('Are you sure you want to remove this video from your library?')) {
      setIsRemoving(true);
      try {
        await onRemove?.(video.video_id);
      } finally {
        setIsRemoving(false);
      }
    }
    setIsMenuOpen(false);
  }, [onRemove, video.video_id]);

  const handleToggleFavorite = useCallback(async () => {
    setIsTogglingFavorite(true);
    try {
      await onToggleFavorite?.(video.video_id, !video.is_favorite);
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [onToggleFavorite, video.video_id, video.is_favorite]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative">
        <div className="aspect-video bg-slate-700 flex items-center justify-center overflow-hidden">
          {video.thumbnail_url ? (
            <LazyImage
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full relative"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <FaYoutube className="w-12 h-12 text-white" />
            </div>
          )}
        </div>
        
        {/* Progress bar overlay */}
        {video.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black bg-opacity-20">
            <div 
              className="h-full bg-slate-900 transition-all duration-300"
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
          <FaStar 
            className={`w-4 h-4 transition-colors ${
              video.is_favorite 
                ? 'text-yellow-400 fill-current' 
                : 'text-white'
            }`} 
          />
        </button>

        {/* Menu button */}
        {showMenu && (
          <div className="absolute top-3 right-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
            >
              <FaEllipsisV className="w-4 h-4 text-white" />
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
                    <FaPlay className="w-4 h-4" />
                    View Details
                  </Link>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FaStar className="w-4 h-4" />
                    {video.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                  <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <FaTrash className="w-4 h-4" />
                    Remove from Library
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Duration overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/video/${video.video_id}`} className="block group">
          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 text-sm">
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
                <FaBookOpen className="w-3 h-3 text-blue-500" />
                <span>Notes</span>
              </div>
            )}
            {video.progress > 0 && (
              <div className="flex items-center gap-1">
                <FaEye className="w-3 h-3 text-green-500" />
                <span>{progressPercentage}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {(isRemoving || isTogglingFavorite) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
        </div>
      )}
    </div>
  );
});

function VideoSection({ title, videos, showAll = false, onRemove, onToggleFavorite }: {
  title: string;
  videos: VideoLibraryItem[];
  showAll?: boolean;
  onRemove?: (videoId: string) => void;
  onToggleFavorite?: (videoId: string, isFavorite: boolean) => void;
}) {
  const [showAllVideos, setShowAllVideos] = useState(showAll);
  const displayVideos = showAllVideos ? videos : videos.slice(0, 6);

  if (videos.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {videos.length > 6 && (
          <button
            onClick={() => setShowAllVideos(!showAllVideos)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {showAllVideos ? 'Show Less' : `View All ${videos.length}`} →
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayVideos.map((video) => (
          <VideoCard
            key={video.video_id}
            video={video}
            onRemove={onRemove}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

const VirtualizedVideoGrid = memo(function VirtualizedVideoGrid({ 
  videos, 
  onRemove, 
  onToggleFavorite 
}: {
  videos: VideoLibraryItem[];
  onRemove?: (videoId: string) => void;
  onToggleFavorite?: (videoId: string, isFavorite: boolean) => void;
}) {
  // Calculate responsive grid dimensions
  const { columnCount, itemWidth, containerWidth } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { columnCount: 4, itemWidth: 320, containerWidth: 1280 };
    }
    
    const width = window.innerWidth;
    let cols = 4;
    if (width < 768) cols = 1;      // mobile
    else if (width < 1024) cols = 2; // tablet
    else if (width < 1280) cols = 3; // small desktop
    
    const padding = 32; // 2rem on each side
    const gap = 24;     // 1.5rem gap between items
    const availableWidth = Math.min(width - padding, 1280); // max-width container
    const itemW = (availableWidth - (gap * (cols - 1))) / cols;
    
    return { 
      columnCount: cols, 
      itemWidth: Math.floor(itemW), 
      containerWidth: availableWidth 
    };
  }, []);

  const rowCount = Math.ceil(videos.length / columnCount);
  const itemHeight = 420; // Height of video card

  const Cell = ({ columnIndex, rowIndex, style }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const index = rowIndex * columnCount + columnIndex;
    const video = videos[index];

    if (!video) {
      return <div style={style} />;
    }

    return (
      <div style={{
        ...style,
        padding: '12px', // Half of gap for spacing
      }}>
        <VideoCard
          video={video}
          onRemove={onRemove}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    );
  };

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Grid
        columnCount={columnCount}
        columnWidth={itemWidth}
        height={Math.min(rowCount * itemHeight, 600)} // Max height to avoid too tall grids
        rowCount={rowCount}
        rowHeight={itemHeight}
        width={containerWidth}
        className="mx-auto"
      >
        {Cell}
      </Grid>
    </div>
  );
});

export default function UnifiedDashboard() {
  const { user, initialized } = useAuth();
  const [videos, setVideos] = useState<VideoLibraryItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'progress'>('newest');

  useEffect(() => {
    // Only load dashboard when auth is initialized and user is authenticated
    if (initialized && user) {
      loadDashboard();
    }
  }, [initialized, user]);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchTerm, showFavoritesOnly, sortBy]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboard();
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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

  const handleRemoveVideo = useCallback(async (videoId: string) => {
    try {
      await apiClient.removeVideoFromLibrary(videoId);
      setVideos(prev => prev.filter(v => v.video_id !== videoId));
    } catch (err) {
      alert('Failed to remove video: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, []);

  const handleToggleFavorite = useCallback(async (videoId: string, isFavorite: boolean) => {
    try {
      await apiClient.toggleVideoFavorite(videoId, isFavorite);
      setVideos(prev => prev.map(v => 
        v.video_id === videoId ? { ...v, is_favorite: isFavorite } : v
      ));
    } catch (err) {
      alert('Failed to update favorite: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 border-t-slate-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <FaBrain className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboard}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const stats = calculateStats(videos);
  const sections = getVideoSections(videos);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
                    <FaBrain className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-slate-900">
                    Mercurious AI
                  </span>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg">
                    <FaHome className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/process" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-slate-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaPlus className="w-4 h-4" />
                    Process Video
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex items-center">
                <UserMenu />
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's your learning journey and video library
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Total Videos"
              value={stats.totalVideos}
              icon={FaYoutube}
              color="bg-blue-500"
              description="Videos in library"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressCount}
              icon={FaPlay}
              color="bg-orange-500"
              description="Currently watching"
            />
            <StatCard
              title="Favorites"
              value={stats.favoritesCount}
              icon={FaStar}
              color="bg-yellow-500"
              description="Starred videos"
            />
            <StatCard
              title="Watched"
              value={stats.watchedCount}
              icon={FaEye}
              color="bg-green-500"
              description="Videos started"
            />
            <StatCard
              title="Completed"
              value={stats.completedCount}
              icon={FaCheckCircle}
              color="bg-slate-600"
              description="Videos finished"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/process" className="group">
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <FaPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Process New Video
                    </h3>
                    <p className="text-sm text-gray-600">Add a YouTube video to your library</p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <FaChartLine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Learning Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stats.completedCount} of {stats.totalVideos} videos completed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-lg">
                  <FaChartLine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Watch Time
                  </h3>
                  <p className="text-sm text-gray-600">
                    Keep up the great learning momentum!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Sections */}
          {videos.length > 0 ? (
            <>
              {/* Continue Watching */}
              <VideoSection
                title="Continue Watching"
                videos={sections.continueWatching}
                onRemove={handleRemoveVideo}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* Favorites */}
              <VideoSection
                title="Your Favorites"
                videos={sections.favorites}
                onRemove={handleRemoveVideo}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* All Videos with Search and Filters */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">All Videos</h2>
                  <Link
                    href="/process"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaPlus className="w-4 h-4" />
                    Add Video
                  </Link>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search videos by title or author..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
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
                        <FaStar className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                        Favorites
                      </button>

                      {/* Sort dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="title">Title A-Z</option>
                        <option value="progress">Progress High-Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Virtualized Videos Grid */}
                {filteredVideos.length > 0 ? (
                  <VirtualizedVideoGrid
                    videos={filteredVideos}
                    onRemove={handleRemoveVideo}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ) : videos.length === 0 ? null : (
                  /* Empty State - No filtered results */
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                      <FaSearch className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
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
                      className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State - No videos */
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                <FaYoutube className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Welcome to Mercurious AI!
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your learning journey by processing your first YouTube video. 
                Our AI will analyze the content and help you learn more effectively.
              </p>
              <Link 
                href="/process"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FaPlus className="w-5 h-5" />
                Process Your First Video
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 