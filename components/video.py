import streamlit as st
from pytube import YouTube
from typing import Dict, Optional
import re
import requests
import os
import time
from datetime import datetime
from utils.transcript import TranscriptProcessor
from utils.recommendations import RecommendationEngine

class VideoHandler:
    def __init__(self):
        self.transcript_processor = TranscriptProcessor()
        self.recommendation_engine = RecommendationEngine()
        self.max_retries = 3
        self.retry_delay = 2
        self.supported_domains = ['youtube.com', 'youtu.be']
        self.initialize_session_state()

    def initialize_session_state(self):
        """Initialize session state variables for video handling."""
        if "video_info" not in st.session_state:
            st.session_state.video_info = None
        if "notes" not in st.session_state:
            st.session_state.notes = []
        if "timestamps" not in st.session_state:
            st.session_state.timestamps = []
        if "bookmarks" not in st.session_state:
            st.session_state.bookmarks = []
        if "error_count" not in st.session_state:
            st.session_state.error_count = 0
        if "processed_videos" not in st.session_state:
            st.session_state.processed_videos = {}
        if "current_video" not in st.session_state:
            st.session_state.current_video = None

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        try:
            # Check if URL is from supported domain
            if not any(domain in url.lower() for domain in self.supported_domains):
                st.warning("⚠️ Only YouTube videos are supported at this time.")
                return None

            patterns = [
                r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)',
                r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)',
                r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)'
            ]
            
            for pattern in patterns:
                match = re.match(pattern, url)
                if match:
                    return match.group(1)
            
            st.warning("⚠️ Invalid YouTube URL format")
            return None
            
        except Exception as e:
            st.error(f"❌ Error extracting video ID: {str(e)}")
            return None

    def fetch_video_info(self, video_url: str, retry_count: int = 0) -> Dict:
        """Fetch video metadata from YouTube using the YouTube Data API."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return {"error": "Invalid YouTube URL"}

        api_key = os.getenv("YOUTUBE_DATA_API")
        if not api_key:
            st.error("❌ YouTube Data API key not found in environment variables")
            return {}

        url = f"https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet,contentDetails,statistics"

        try:
            response = requests.get(url, timeout=10)  # Add timeout
            response.raise_for_status()
            data = response.json()

            if "items" in data and len(data["items"]) > 0:
                video_data = data["items"][0]
                
                # Format duration from ISO 8601 to readable format
                duration = video_data["contentDetails"]["duration"]
                duration_pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
                duration_match = duration_pattern.match(duration)
                if duration_match:
                    hours, minutes, seconds = duration_match.groups()
                    formatted_duration = ""
                    if hours: formatted_duration += f"{hours}h "
                    if minutes: formatted_duration += f"{minutes}m "
                    if seconds: formatted_duration += f"{seconds}s"
                else:
                    formatted_duration = duration

                return {
                    "title": video_data["snippet"]["title"],
                    "author": video_data["snippet"]["channelTitle"],
                    "description": video_data["snippet"]["description"],
                    "thumbnail_url": video_data["snippet"]["thumbnails"]["high"]["url"],
                    "publish_date": video_data["snippet"]["publishedAt"],
                    "views": int(video_data["statistics"].get("viewCount", 0)),
                    "likes": int(video_data["statistics"].get("likeCount", 0)),
                    "length": formatted_duration,
                    "video_url": f"https://www.youtube.com/watch?v={video_id}"
                }
            else:
                st.error("❌ No video data found")
                return {}

        except requests.exceptions.RequestException as e:
            st.session_state.error_count += 1
            if retry_count < self.max_retries:
                time.sleep(self.retry_delay * (retry_count + 1))
                return self.fetch_video_info(video_url, retry_count + 1)
            st.error(f"❌ Error fetching video information: {str(e)}")
            return {}

    def process_video(self, video_url: str) -> Dict:
        """Process video and return all relevant information."""
        try:
            video_id = self.extract_video_id(video_url)
            if not video_id:
                return {"error": "Invalid YouTube URL"}

            with st.spinner("🎥 Fetching video information..."):
                video_info = self.fetch_video_info(video_url)
                if not video_info:
                    return {"error": "Failed to fetch video information"}

            with st.spinner("📝 Processing transcript..."):
                transcript = self.transcript_processor.fetch_transcript(video_id)
                if not transcript:
                    return {"error": "Failed to fetch transcript"}

            with st.spinner("🧠 Analyzing content..."):
                processed_content = self.transcript_processor.process_transcript(transcript)
                if not processed_content:
                    return {"error": "Failed to process content"}

            # Create the video data structure with all required fields
            video_data = {
                "video_id": video_id,
                "info": video_info,
                "content": {
                    "transcript": transcript,
                    "summary": processed_content.get("summary", ""),
                    "main_points": processed_content.get("main_points", []),
                    "key_concepts": processed_content.get("key_concepts", []),
                    "study_guide": processed_content.get("study_guide", ""),
                    "analysis": processed_content.get("analysis", ""),
                    "vocabulary": processed_content.get("vocabulary", []),
                    "text": processed_content.get("text", "")
                },
                "timestamp": datetime.now().isoformat()
            }

            # Store the processed video data
            if "processed_videos" not in st.session_state:
                st.session_state.processed_videos = {}
            
            st.session_state.processed_videos[video_id] = video_data
            st.session_state.current_video = video_id

            return video_data

        except Exception as e:
            st.error(f"❌ Error processing video: {str(e)}")
            return {"error": str(e)}

    def create_player_controls(self, video_info: Dict):
        """Create enhanced player controls with additional features."""
        try:
            if not video_info or "video_url" not in video_info:
                st.warning("⚠️ Video information not available")
                return

            col1, col2 = st.columns([3, 1])
            with col1:
                autoplay = st.checkbox("🔄 Autoplay", value=False)
                video_url = video_info["video_url"]
                if autoplay:
                    video_url += "?autoplay=1"
                st.video(video_url)

            with col2:
                st.markdown("### 📊 Video Stats")
                st.markdown(f"**Duration:** {video_info.get('length', 'N/A')}")
                st.markdown(f"**Views:** {video_info.get('views', 0):,}")
                st.markdown(f"**Likes:** {video_info.get('likes', 0):,}")

        except Exception as e:
            st.error(f"❌ Error creating player controls: {str(e)}")

    def create_learning_tools(self):
        """Create enhanced learning tools interface."""
        try:
            st.subheader("📚 Learning Tools")
            
            # Notes with auto-save
            notes = st.text_area(
                "📝 Notes",
                value=st.session_state.notes[-1] if st.session_state.notes else "",
                height=150,
                placeholder="Take notes here... (Auto-saves as you type)"
            )
            
            if notes:
                self._save_notes(notes)
            
            # Timestamps with validation
            col1, col2 = st.columns([3, 1])
            with col1:
                timestamp = st.text_input(
                    "⏱️ Add Timestamp",
                    placeholder="Format: MM:SS Description"
                )
            with col2:
                if st.button("➕ Add"):
                    self._add_timestamp(timestamp)
            
            # Display timestamps
            if st.session_state.timestamps:
                st.markdown("### ⌚ Timestamps")
                for ts in st.session_state.timestamps:
                    st.markdown(f"- {ts}")
            
            # Bookmarks
            if st.button("🔖 Add Bookmark"):
                self._add_bookmark()
            
            # Display bookmarks
            if st.session_state.bookmarks:
                st.markdown("### 📑 Bookmarks")
                for i, bookmark in enumerate(st.session_state.bookmarks):
                    col1, col2 = st.columns([4, 1])
                    with col1:
                        st.markdown(f"- {bookmark}")
                    with col2:
                        if st.button("🗑️", key=f"del_bookmark_{i}"):
                            st.session_state.bookmarks.pop(i)
                            st.rerun()

        except Exception as e:
            st.error(f"❌ Error in learning tools: {str(e)}")

    def _save_notes(self, notes: str):
        """Save notes with timestamp."""
        try:
            if notes and (not st.session_state.notes or notes != st.session_state.notes[-1]):
                timestamp = datetime.now().strftime("%I:%M %p")
                st.session_state.notes.append(notes)
                st.success("✅ Notes saved!")
        except Exception as e:
            st.error(f"❌ Error saving notes: {str(e)}")

    def _add_timestamp(self, timestamp: str):
        """Add validated timestamp."""
        try:
            if not timestamp:
                st.warning("⚠️ Please enter a timestamp")
                return

            # Validate timestamp format
            pattern = r'^\d{1,2}:\d{2}\s+\S+.*$'
            if not re.match(pattern, timestamp):
                st.warning("⚠️ Invalid format. Use MM:SS Description")
                return

            if timestamp not in st.session_state.timestamps:
                st.session_state.timestamps.append(timestamp)
                st.success("✅ Timestamp added!")
            else:
                st.info("ℹ️ Timestamp already exists")

        except Exception as e:
            st.error(f"❌ Error adding timestamp: {str(e)}")

    def _add_bookmark(self):
        """Add bookmark with current video position."""
        try:
            if not st.session_state.video_info:
                st.warning("⚠️ No video is currently playing")
                return

            video_title = st.session_state.video_info["info"]["title"]
            timestamp = datetime.now().strftime("%I:%M %p")
            bookmark = f"{video_title} (Added at {timestamp})"
            
            if bookmark not in st.session_state.bookmarks:
                st.session_state.bookmarks.append(bookmark)
                st.success("✅ Bookmark added!")
            else:
                st.info("ℹ️ Bookmark already exists")

        except Exception as e:
            st.error(f"❌ Error adding bookmark: {str(e)}")
