from fastapi import APIRouter, HTTPException, Depends
from ..models import VideoProcessRequest
from ..services import VideoService
from ..dependencies import get_current_user


app = APIRouter()
video_service = VideoService()

@app.post("/api/videos/process")
async def process_video(request: VideoProcessRequest, current_user: dict = Depends(get_current_user)):
    try:
        content = await video_service.process_video(request.url)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

