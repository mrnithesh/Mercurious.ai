'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Brain, 
  Video, 
  Star, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  List, 
  Lightbulb, 
  SpellCheck,
  BarChart3,
  Clock,
  Eye,
  Edit3,
  Save,
  X,
  Home,
  Library,
  Play,
  Pause,
  Download,
  Share,
  Heart,
  Plus,
  ThumbsUp,
  Users,
  Calendar,
  Bookmark,
  ExternalLink,
  Target,
  Trophy,
  History
} from 'lucide-react';
import { apiClient, VideoResponse, QuizResponse, QuizResultResponse, QuizAvailability } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ChatAssistant from '@/components/ChatAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { QuizGenerator, QuizInterface, QuizResults, QuizHistory, QuizStatistics } from '@/components/Quiz';

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
}

function YouTubePlayer({ videoId, className = '' }: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : videoId;
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const actualVideoId = extractYouTubeId(videoId);

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-fuchsia-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}
      <iframe
        src={`https://www.youtube.com/embed/${actualVideoId}?rel=0&modestbranding=1&showinfo=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
        onLoad={handleLoad}
      />
    </div>
  );
}

interface NotesModalProps {
  isOpen: boolean;
  notes: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

function NotesModal({ isOpen, notes, onSave, onClose }: NotesModalProps) {
  const [editedNotes, setEditedNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedNotes(notes);
  }, [notes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedNotes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Personal Notes</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            placeholder="Add your personal notes, thoughts, and key takeaways from this video..."
            className="w-full h-80 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {editedNotes.length} characters
            </div>
            <div className="text-sm text-gray-500">
              💡 Tip: Use markdown formatting for better organization
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  onUpdate: (progress: number) => void;
}

function ProgressBar({ progress, onUpdate }: ProgressBarProps) {
  const progressPercentage = Math.round(progress * 100);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = clickX / rect.width;
    onUpdate(Math.max(0, Math.min(1, newProgress)));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{progressPercentage}%</span>
          <span className="text-sm text-gray-500">complete</span>
        </div>
      </div>
      
      <div 
        className="w-full h-4 bg-gray-200 rounded-full cursor-pointer group mb-4"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300 group-hover:shadow-lg relative"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute right-0 top-0 h-full w-1 bg-white rounded-full opacity-75"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => onUpdate(0)}
          className="text-xs text-gray-500 hover:text-purple-600 transition-colors py-1 px-2 rounded-lg hover:bg-purple-50"
        >
          Not Started
        </button>
        <button 
          onClick={() => onUpdate(0.5)}
          className="text-xs text-gray-500 hover:text-purple-600 transition-colors py-1 px-2 rounded-lg hover:bg-purple-50"
        >
          In Progress
        </button>
        <button 
          onClick={() => onUpdate(1)}
          className="text-xs text-gray-500 hover:text-purple-600 transition-colors py-1 px-2 rounded-lg hover:bg-purple-50"
        >
          Completed
        </button>
      </div>
    </div>
  );
}

export default function VideoDetail() {
  const params = useParams();
  const videoId = params.id as string;
  const { user, initialized } = useAuth();
  
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'points' | 'concepts' | 'study' | 'vocab' | 'analysis' | 'quiz'>('summary');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  // Quiz-related state
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);
  const [quizAvailability, setQuizAvailability] = useState<QuizAvailability | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizView, setQuizView] = useState<'generator' | 'interface' | 'results' | 'history' | 'statistics'>('generator');

  useEffect(() => {
    // Only load video when auth is initialized, user is authenticated, and videoId exists
    if (videoId && initialized && user) {
      loadVideo();
      checkQuizAvailability();
    }
  }, [videoId, initialized, user]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getVideo(videoId);
      setVideo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!video) return;
    
    setIsUpdatingFavorite(true);
    try {
      await apiClient.toggleVideoFavorite(videoId, !video.is_favorite);
      setVideo(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    } catch (err) {
      alert('Failed to update favorite: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleUpdateProgress = async (progress: number) => {
    if (!video) return;
    
    try {
      await apiClient.updateVideoProgress(videoId, progress);
      setVideo(prev => prev ? { ...prev, progress, last_watched: new Date().toISOString() } : null);
    } catch (err) {
      alert('Failed to update progress: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleSaveNotes = async (notes: string) => {
    if (!video) return;
    
    try {
      await apiClient.updateVideoNotes(videoId, notes);
      setVideo(prev => prev ? { ...prev, notes } : null);
    } catch (err) {
      alert('Failed to save notes: ' + (err instanceof Error ? err.message : 'Unknown error'));
      throw err;
    }
  };

  // Quiz-related functions
  const checkQuizAvailability = async () => {
    try {
      const availability = await apiClient.quiz.checkQuizAvailability(videoId);
      setQuizAvailability(availability);
    } catch (err) {
      console.error('Error checking quiz availability:', err);
      // Don't show error for quiz availability check
    }
  };

  const handleQuizGenerated = (generatedQuiz: QuizResponse) => {
    setQuiz(generatedQuiz);
    setQuizResult(null);
    setQuizView('interface');
    setIsGeneratingQuiz(false);
    setQuizError(null);
    
    // Update availability
    setQuizAvailability({
      video_id: videoId,
      quiz_available: true,
      quiz_fresh: true,
      generated_at: generatedQuiz.generated_at
    });
  };

  const handleQuizSubmitted = (result: QuizResultResponse) => {
    setQuizResult(result);
    setQuizView('results');
    setIsSubmittingQuiz(false);
    setQuizError(null);
  };

  const handleQuizError = (error: string) => {
    setQuizError(error);
    setIsGeneratingQuiz(false);
    setIsSubmittingQuiz(false);
  };

  const handleRetakeQuiz = () => {
    if (quiz) {
      setQuizResult(null);
      setQuizView('interface');
      setQuizError(null);
    } else {
      setQuizView('generator');
    }
  };

  const handleNewQuiz = () => {
    setQuiz(null);
    setQuizResult(null);
    setQuizView('generator');
    setQuizError(null);
    setQuizAvailability(null);
  };

  const handleQuizReset = () => {
    setQuiz(null);
    setQuizResult(null);
    setQuizView('generator');
    setQuizError(null);
  };

  const handleViewHistory = () => {
    setQuizView('history');
  };

  const handleViewStatistics = () => {
    setQuizView('statistics');
  };

  const handleBackToQuiz = () => {
    if (quiz && !quizResult) {
      setQuizView('interface');
    } else if (quizResult) {
      setQuizView('results');
    } else {
      setQuizView('generator');
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-3 last:mb-0 leading-relaxed">{line}</p>
    ));
  };

  const downloadContent = () => {
    if (!video) return;

    const content = `
# ${video.info.title}

**Author:** ${video.info.author}
**Duration:** ${video.info.duration}
**Views:** ${video.info.views.toLocaleString()}
**Progress:** ${Math.round(video.progress * 100)}%

${video.notes ? `## My Notes\n${video.notes}\n` : ''}

## Summary
${video.content.summary}

## Key Points
${video.content.main_points.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n')}

## Key Concepts
${video.content.key_concepts.map((concept: string) => `• ${concept}`).join('\n')}

## Study Guide
${video.content.study_guide}

## Vocabulary
${video.content.vocabulary.map((item: string) => `• ${item}`).join('\n')}

## Analysis
${video.content.analysis}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_mercurious_ai.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText, color: 'from-purple-500 to-violet-600' },
    { id: 'points', label: 'Key Points', icon: List, color: 'from-emerald-500 to-teal-600' },
    { id: 'concepts', label: 'Concepts', icon: Lightbulb, color: 'from-amber-500 to-orange-600' },
    { id: 'study', label: 'Study Guide', icon: BookOpen, color: 'from-fuchsia-500 to-pink-600' },
    { id: 'vocab', label: 'Vocabulary', icon: SpellCheck, color: 'from-violet-500 to-purple-600' },
    { id: 'analysis', label: 'Analysis', icon: BarChart3, color: 'from-rose-500 to-red-600' },
    { id: 'quiz', label: 'AI Quiz', icon: Target, color: 'from-indigo-500 to-blue-600' },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-fuchsia-200 border-t-fuchsia-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Video</h3>
            <p className="text-gray-600">Preparing your learning experience...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !video) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
              <Video className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The video you\'re looking for doesn\'t exist or has been removed.'}</p>
            <div className="flex gap-3 justify-center">
              <Link 
                href="/library"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 font-medium"
              >
                Browse Library
              </Link>
              <Link 
                href="/process"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Process New Video
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-200/50 shadow-lg shadow-purple-100/50">
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
              
              <Link 
                href="/library"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Library
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-8xl">
          {/* Video Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-start gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{video.info.title}</h1>
                        <div className="flex items-center gap-6 text-gray-600">
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {video.info.author}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {video.info.duration}
                          </span>
                          <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {video.info.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4" />
                            {video.info.likes.toLocaleString()} likes
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        onClick={handleToggleFavorite}
                        disabled={isUpdatingFavorite}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          video.is_favorite
                            ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${video.is_favorite ? 'fill-current' : ''}`} />
                        {video.is_favorite ? 'Favorited' : 'Add to Favorites'}
                      </button>
                      
                      <button
                        onClick={() => setIsNotesModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 border-2 border-blue-300 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                      >
                        <Edit3 className="w-4 h-4" />
                        {video.notes ? 'Edit Notes' : 'Add Notes'}
                      </button>
                      
                      <button
                        onClick={downloadContent}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 border-2 border-green-300 rounded-lg hover:bg-green-200 transition-colors font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download Content
                      </button>
                      
                      <a
                        href={video.info.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 border-2 border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Video Player */}
            <div className="xl:col-span-3">
              <div className="mb-8">
                <YouTubePlayer videoId={video.info.video_url} className="aspect-video" />
              </div>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <ProgressBar progress={video.progress} onUpdate={handleUpdateProgress} />
              </div>

              {/* Content Tabs */}
              <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                {/* Tab Headers */}
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-purple-500 text-purple-600 bg-white'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`p-1.5 bg-gradient-to-r ${tab.color} rounded-lg`}>
                          <tab.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === 'summary' && (
                    <div className="prose prose-lg max-w-none">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        Video Summary
                      </h3>
                      <div className="text-gray-700 leading-relaxed">
                        {formatText(video.content.summary)}
                      </div>
                    </div>
                  )}

                  {activeTab === 'points' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                          <List className="w-6 h-6 text-white" />
                        </div>
                        Key Points
                      </h3>
                      <div className="space-y-4">
                        {video.content.main_points.map((point, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-gray-800 leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'concepts' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        Key Concepts
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {video.content.key_concepts.map((concept, index) => (
                          <div
                            key={index}
                            className="p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className="text-amber-900 font-medium">{concept}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'study' && (
                    <div className="prose prose-lg max-w-none">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        Study Guide
                      </h3>
                      <div className="text-gray-700 leading-relaxed">
                        {formatText(video.content.study_guide)}
                      </div>
                    </div>
                  )}

                  {activeTab === 'vocab' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                          <SpellCheck className="w-6 h-6 text-white" />
                        </div>
                        Vocabulary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {video.content.vocabulary.map((term, index) => (
                          <div
                            key={index}
                            className="p-4 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                              <span className="text-violet-900 font-medium">{term}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div className="prose prose-lg max-w-none">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-rose-500 to-red-600 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        Analysis
                      </h3>
                      <div className="text-gray-700 leading-relaxed">
                        {formatText(video.content.analysis)}
                      </div>
                    </div>
                  )}

                  {activeTab === 'quiz' && (
                    <div className="space-y-6">
                      {/* Quiz Error Display */}
                      {quizError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="text-red-600">
                              <Target className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-red-900 mb-1">
                                Quiz Error
                              </h4>
                              <p className="text-sm text-red-700">{quizError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quiz Navigation */}
                      {(quizView === 'history' || quizView === 'statistics') && (
                        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-4">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handleBackToQuiz}
                              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Back to Quiz
                            </button>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={handleViewHistory}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                  quizView === 'history'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                              >
                                <History className="w-4 h-4" />
                                History
                              </button>
                              <button
                                onClick={handleViewStatistics}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                  quizView === 'statistics'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                              >
                                <Trophy className="w-4 h-4" />
                                Statistics
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quiz Content */}
                      {quizView === 'generator' && (
                        <QuizGenerator
                          videoId={videoId}
                          videoTitle={video.info.title}
                          onQuizGenerated={handleQuizGenerated}
                          onError={handleQuizError}
                          isLoading={isGeneratingQuiz}
                          availability={quizAvailability}
                        />
                      )}

                      {quizView === 'interface' && quiz && (
                        <QuizInterface
                          quiz={quiz}
                          onSubmit={handleQuizSubmitted}
                          onReset={handleQuizReset}
                          onError={handleQuizError}
                          isSubmitting={isSubmittingQuiz}
                        />
                      )}

                      {quizView === 'results' && quizResult && (
                        <QuizResults
                          result={quizResult}
                          onRetakeQuiz={handleRetakeQuiz}
                          onNewQuiz={handleNewQuiz}
                        />
                      )}

                      {quizView === 'history' && (
                        <QuizHistory
                          videoId={videoId}
                          onRetakeQuiz={handleRetakeQuiz}
                          onResetHistory={() => {
                            // Refresh quiz availability after reset
                            checkQuizAvailability();
                          }}
                        />
                      )}

                      {quizView === 'statistics' && (
                        <QuizStatistics />
                      )}

                      {/* Quick Actions */}
                      {(quizView === 'generator' || quizView === 'results') && (
                        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={handleViewHistory}
                              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                            >
                              <History className="w-4 h-4" />
                              View History
                            </button>
                            <button
                              onClick={handleViewStatistics}
                              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                            >
                              <Trophy className="w-4 h-4" />
                              View Statistics
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Personal Notes */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                      <Bookmark className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Personal Notes</h3>
                  </div>
                  <button
                    onClick={() => setIsNotesModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                {video.notes ? (
                  <div className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                    {video.notes}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No notes yet. Click to add your thoughts and key takeaways.
                  </div>
                )}
              </div>

              {/* Video Statistics */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Video Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium text-gray-900">{video.info.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Views:</span>
                    <span className="text-sm font-medium text-gray-900">{video.info.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Likes:</span>
                    <span className="text-sm font-medium text-gray-900">{video.info.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Added:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {video.last_watched && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last watched:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(video.last_watched).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => handleUpdateProgress(1)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => setIsNotesModalOpen(true)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Quick Note
                  </button>
                  <button
                    onClick={downloadContent}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Export Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Assistant */}
        <ChatAssistant videoId={videoId} videoContext={video} />

        {/* Notes Modal */}
        <NotesModal
          isOpen={isNotesModalOpen}
          notes={video.notes}
          onSave={handleSaveNotes}
          onClose={() => setIsNotesModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
} 