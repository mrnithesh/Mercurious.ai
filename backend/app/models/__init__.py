# User models
from .user import (
    UserBase,
    UserCreate,
    UserResponse,
    UserLogin,
    UserUpdate,
    UserSettings
)

# Video models
from .video import (
    VideoProcessRequest,
    VideoInfo,
    VideoContent,
    VideoResponse,
    VideoProgressUpdate,
    VideoNotes,
    VideoMetadata,
    GlobalVideo,
    UserVideoMetadata,
    UserVideoReference,
    VideoLibraryItem,
    VideoFavoriteUpdate,
    VideoNotesUpdate
)

# Chat models
from .chat import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ChatHistory
)

# Quiz models
from .quiz import (
    QuizQuestion,
    QuizGenerateRequest,
    QuizResponse,
    QuizAnswer,
    QuizSubmission,
    QuizResult,
    QuizResultResponse
)

__all__ = [
    # User
    "UserBase", "UserCreate", "UserResponse", "UserLogin", "UserUpdate", "UserSettings",
    # Video
    "VideoProcessRequest", "VideoInfo", "VideoContent", "VideoResponse", 
    "VideoProgressUpdate", "VideoNotes", "VideoMetadata", "GlobalVideo",
    "UserVideoMetadata", "UserVideoReference", "VideoLibraryItem",
    "VideoFavoriteUpdate", "VideoNotesUpdate",
    # Chat
    "ChatMessage", "ChatRequest", "ChatResponse", "ChatHistory",
    # Quiz
    "QuizQuestion", "QuizGenerateRequest", "QuizResponse", "QuizAnswer", 
    "QuizSubmission", "QuizResult", "QuizResultResponse"
]
