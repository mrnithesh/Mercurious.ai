from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models import (
    VideoProcessRequest, VideoResponse, VideoLibraryItem,
    VideoProgressUpdate, VideoFavoriteUpdate, VideoNotesUpdate
)
from ..services import VideoService
from ..dependencies import get_current_user

app = APIRouter()
video_service = VideoService()

# Video Processing
@app.post("/api/videos/process", response_model=VideoResponse)
async def process_video(request: VideoProcessRequest, current_user: dict = Depends(get_current_user)):
    """Process a video and add it to user's library"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        content = await video_service.process_video(request.url, user_id)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User Library Management
@app.get("/api/videos/library", response_model=List[VideoLibraryItem])
async def get_user_library(current_user: dict = Depends(get_current_user)):
    """Get user's video library"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        library = await video_service.get_user_library(user_id)
        return library
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/videos/{video_id}", response_model=VideoResponse)
async def get_video(video_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific video from user's library"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        video = await video_service.get_user_video(user_id, video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        return video
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/videos/{video_id}")
async def remove_video_from_library(video_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a video from user's library"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        success = await video_service.remove_video_from_library(user_id, video_id)
        if not success:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        return {"message": "Video removed from library successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/videos/{video_id}/progress")
async def update_video_progress(
    video_id: str, 
    progress_update: VideoProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user's video progress"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        # Validate progress range
        if not 0 <= progress_update.progress <= 1:
            raise HTTPException(status_code=400, detail="Progress must be between 0 and 1")
        
        success = await video_service.update_video_progress(user_id, video_id, progress_update.progress)
        if not success:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        return {"message": "Video progress updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/videos/{video_id}/favorite")
async def toggle_video_favorite(
    video_id: str,
    favorite_update: VideoFavoriteUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Toggle video favorite status"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        success = await video_service.toggle_video_favorite(user_id, video_id, favorite_update.is_favorite)
        if not success:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        action = "added to" if favorite_update.is_favorite else "removed from"
        return {"message": f"Video {action} favorites successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/videos/{video_id}/notes")
async def update_video_notes(
    video_id: str,
    notes_update: VideoNotesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user's video notes"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        success = await video_service.update_video_notes(user_id, video_id, notes_update.notes)
        if not success:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        return {"message": "Video notes updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard/Stats endpoints
@app.get("/api/videos/stats")
async def get_user_video_stats(current_user: dict = Depends(get_current_user)):
    """Get user's video processing statistics"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        library = await video_service.get_user_library(user_id)
        
        # Calculate stats
        total_videos = len(library)
        favorites_count = sum(1 for video in library if video.is_favorite)
        watched_count = sum(1 for video in library if video.progress > 0)
        completed_count = sum(1 for video in library if video.progress >= 0.9)
        
        # Get recent videos (last 5)
        recent_videos = library[:5] if library else []
        
        return {
            "total_videos": total_videos,
            "favorites_count": favorites_count,
            "watched_count": watched_count,
            "completed_count": completed_count,
            "recent_videos": recent_videos
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

