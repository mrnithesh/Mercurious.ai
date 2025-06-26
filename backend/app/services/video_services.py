import re
import requests
import os
import time
from datetime import datetime
from typing import Dict, Optional, List
from fastapi import HTTPException
from dotenv import load_dotenv
from services.transcript_services import TranscriptService
from models.video import VideoInfo, VideoContent, VideoResponse
load_dotenv()

class VideoService:
    def __init__(self):
        self.max_retries = 3
        self.retry_delay = 2
        self.supported_domains = ['youtube.com', 'youtu.be']

    async def extract_video_id(self, url: str) -> str:
        """Extract video ID from YouTube URL."""
        if not any(domain in url.lower() for domain in self.supported_domains):
            raise HTTPException(status_code=400, detail="Only YouTube videos are supported")

        patterns = [
            r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)',
            r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)',
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)'
        ]
        
        for pattern in patterns:
            match = re.match(pattern, url)
            if match:
                return match.group(1)
        
        raise HTTPException(status_code=400, detail="Invalid YouTube URL format")

    async def fetch_video_info(self, video_url: str, retry_count: int = 0) -> Dict:
        video_id = await self.extract_video_id(video_url)
        
        api_key = os.getenv("YOUTUBE_DATA_API")
        if not api_key:
            raise HTTPException(status_code=500, detail="YouTube Data API key not configured")

        url = f"https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet,contentDetails,statistics"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            if "items" in data and len(data["items"]) > 0:
                video_data = data["items"][0]
                
                # Format duration from ISO 8601 to readable format
                duration = video_data["contentDetails"]["duration"]
                formatted_duration = self._format_duration(duration)

                return {
                    "video_id": video_id,
                    "title": video_data["snippet"]["title"],
                    "author": video_data["snippet"]["channelTitle"],
                    "description": video_data["snippet"]["description"],
                    "thumbnail_url": video_data["snippet"]["thumbnails"]["high"]["url"],
                    "publish_date": video_data["snippet"]["publishedAt"],
                    "views": int(video_data["statistics"].get("viewCount", 0)),
                    "likes": int(video_data["statistics"].get("likeCount", 0)),
                    "duration": formatted_duration,
                    "video_url": f"https://www.youtube.com/watch?v={video_id}"
                }
            else:
                raise HTTPException(status_code=404, detail="Video not found")

        except requests.exceptions.RequestException as e:
            if retry_count < self.max_retries:
                time.sleep(self.retry_delay * (retry_count + 1))
                return await self.fetch_video_info(video_url, retry_count + 1)
            raise HTTPException(status_code=500, detail=f"Error fetching video information: {str(e)}")

    def _format_duration(self, duration: str) -> str:
        """Format ISO 8601 duration to readable format."""
        duration_pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
        duration_match = duration_pattern.match(duration)
        if duration_match:
            hours, minutes, seconds = duration_match.groups()
            formatted_duration = ""
            if hours: formatted_duration += f"{hours}h "
            if minutes: formatted_duration += f"{minutes}m "
            if seconds: formatted_duration += f"{seconds}s"
            return formatted_duration.strip()
        return duration

    async def process_video(self, video_url: str) -> VideoResponse:
        try:
            # Get video info
            video_info_dict = await self.fetch_video_info(video_url)
            video_id = video_info_dict["video_id"]

            # Create VideoInfo model
            video_info = VideoInfo(
                title=video_info_dict["title"],
                author=video_info_dict["author"],
                description=video_info_dict["description"],
                duration=video_info_dict["duration"],  
                thumbnail_url=video_info_dict["thumbnail_url"],
                publish_date=video_info_dict["publish_date"],
                views=video_info_dict["views"],
                likes=video_info_dict["likes"],
                video_url=video_info_dict["video_url"]
            )

            transcript_service = TranscriptService()
            
            # Fetch and process transcript
            transcript = await transcript_service.fetch_transcript(video_id)
            if not transcript:
                raise HTTPException(status_code=500, detail="Failed to fetch transcript")

            processed_content = await transcript_service.process_transcript(transcript)
            if not processed_content:
                raise HTTPException(status_code=500, detail="Failed to process content")

            # Create VideoContent model
            video_content = VideoContent(
                transcript=transcript,
                summary=processed_content.get("summary", ""),
                main_points=processed_content.get("main_points", []),
                key_concepts=processed_content.get("key_concepts", []),
                study_guide=processed_content.get("study_guide", ""),
                analysis=processed_content.get("analysis", ""),
                vocabulary=processed_content.get("vocabulary", [])
            )

            # Return proper VideoResponse model
            return VideoResponse(
                video_id=video_id,
                info=video_info,
                content=video_content,
                progress=0.0,
                created_at=datetime.now(),
                last_watched=None
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
