import streamlit as st
from pytube import YouTube
from typing import Dict, Optional
import re
import requests
from utils.transcript import TranscriptProcessor
import os

class VideoHandler:
    def __init__(self):
        self.transcript_processor = TranscriptProcessor()

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)'
        match = re.match(pattern, url)
        return match.group(1) if match else None

    def fetch_video_info(self, video_url: str) -> Dict:
        """Fetch video metadata from YouTube using the YouTube Data API."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return {"error": "Invalid YouTube URL"}

        api_key = os.getenv("YOUTUBE_DATA_API")  # Replace with your actual API key
        url = f"https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet,contentDetails,statistics"

        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()

            if "items" in data and len(data["items"]) > 0:
                video_data = data["items"][0]
                return {
                    "title": video_data["snippet"]["title"],
                    "author": video_data["snippet"]["channelTitle"],
                    "description": video_data["snippet"]["description"],
                    "thumbnail_url": video_data["snippet"]["thumbnails"]["high"]["url"],
                    "publish_date": video_data["snippet"]["publishedAt"],
                    "views": video_data["statistics"].get("viewCount"),
                    "length": video_data["contentDetails"]["duration"]
                }
            else:
                st.error("No video data found using the YouTube Data API.")
                return {}
        except requests.exceptions.RequestException as e:
            st.error(f"Error fetching video information with YouTube Data API: {e}")
            return {}

    def process_video(self, video_url: str) -> Dict:
        """Process video and return all relevant information."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return {"error": "Invalid YouTube URL"}

        video_info = self.fetch_video_info(video_url)
        if not video_info:
            return {"error": "Failed to fetch video information"}

        transcript = self.transcript_processor.fetch_transcript(video_id)
        if not transcript:
            return {"error": "Failed to fetch transcript"}

        processed_content = self.transcript_processor.process_transcript(transcript)
        
        return {
            "video_id": video_id,
            "info": video_info,
            "content": processed_content
        }

    def create_player_controls(self, video_info: Dict):
        """Create a simple player control with autoplay option."""
        autoplay = st.checkbox("Autoplay", value=False)
        if autoplay:
            st.video(video_info.get("video_url") + "?autoplay=1")
        else:
            st.video(video_info.get("video_url"))

    def create_learning_tools(self):
        """Create learning tool interface."""
        st.subheader("Learning Tools")
        
        # Notes
        notes = st.text_area("Notes", height=150)
        if st.button("Save Notes"):
            self._save_notes(notes)
        
        # Timestamps
        timestamp = st.text_input("Add Timestamp (MM:SS Description)")
        if timestamp:
            self._add_timestamp(timestamp)
        
        # Bookmarks
        if st.button("Add Bookmark"):
            self._add_bookmark()

    def _save_notes(self, notes: str):
        if "notes" not in st.session_state:
            st.session_state.notes = []
        st.session_state.notes.append(notes)
        st.success("Notes saved!")

    def _add_timestamp(self, timestamp: str):
        if "timestamps" not in st.session_state:
            st.session_state.timestamps = []
        st.session_state.timestamps.append(timestamp)
        st.success("Timestamp added!")

    def _add_bookmark(self):
        if "bookmarks" not in st.session_state:
            st.session_state.bookmarks = []
        # Add current time as bookmark
        st.success("Bookmark added!")
