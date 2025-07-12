from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import List, Optional

class VideoProcessRequest(BaseModel):
    url: HttpUrl  

class VideoInfo(BaseModel):
    title: str
    author: str
    description: str
    duration: str  
    thumbnail_url: HttpUrl
    publish_date: str   
    views: int
    likes: int
    video_url: HttpUrl

class VideoContent(BaseModel):
    transcript: str
    summary: str
    main_points: List[str]  
    key_concepts: List[str]  
    study_guide: str
    analysis: str
    vocabulary: List[str]

# Global video metadata (stored once per video)
class VideoMetadata(BaseModel):
    created_at: datetime
    processed_count: int = 1
    last_accessed: datetime

# Global video document (stored in videos collection)
class GlobalVideo(BaseModel):
    video_id: str
    info: VideoInfo
    content: VideoContent
    metadata: VideoMetadata

# User-specific video metadata
class UserVideoMetadata(BaseModel):
    added_at: datetime
    last_watched: Optional[datetime] = None
    progress: float = 0.0
    is_favorite: bool = False
    notes: str = ""

# User's video reference (stored in users/{user_id}/videos/{video_id})
class UserVideoReference(BaseModel):
    video_id: str
    user_metadata: UserVideoMetadata

# Enhanced video response (combines global video + user metadata)
class VideoResponse(BaseModel):
    video_id: str
    info: VideoInfo
    content: VideoContent
    progress: float = 0.0
    created_at: datetime
    last_watched: Optional[datetime] = None
    is_favorite: bool = False
    notes: str = ""

# Video library item (for user's library view)
class VideoLibraryItem(BaseModel):
    video_id: str
    title: str
    author: str
    duration: str
    thumbnail_url: HttpUrl
    added_at: datetime
    last_watched: Optional[datetime] = None
    progress: float = 0.0
    is_favorite: bool = False
    notes: str = ""

# Update requests
class VideoProgressUpdate(BaseModel):
    progress: float

class VideoFavoriteUpdate(BaseModel):
    is_favorite: bool

class VideoNotesUpdate(BaseModel):
    notes: str

# Legacy support - keeping for backward compatibility
class VideoNotes(BaseModel):
    content: str
    video_id: str
    updated_at: datetime