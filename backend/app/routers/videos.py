from fastapi import APIRouter, HTTPException
from ..models import VideoProcessRequest
from ..services import VideoService


app = APIRouter()
video_service = VideoService()

@app.post("/api/videos/process")
async def process_video(request: VideoProcessRequest):
    try:
        content = await video_service.process_video(request.url)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

