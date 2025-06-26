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


class VideoResponse(BaseModel):
    video_id: str
    info: VideoInfo
    content: VideoContent
    progress: float = 0.0
    created_at: datetime
    last_watched: Optional[datetime] = None

class VideoProgressUpdate(BaseModel):
    progress: float

class VideoNotes(BaseModel):
    content: str
    video_id: str
    updated_at: datetime