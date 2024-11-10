import streamlit as st
from pytube import YouTube
from typing import Dict, Optional
import re
from utils.transcript import TranscriptProcessor

class VideoHandler:
    def __init__(self):
        self.transcript_processor = TranscriptProcessor()

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)'
        match = re.match(pattern, url)
        return match.group(1) if match else None

    def fetch_video_info(self, video_url: str) -> Dict:
        """Fetch video metadata from YouTube."""
        try:
            yt = YouTube(video_url)
            return {
                "title": yt.title,
                "author": yt.author,
                "length": yt.length,
                "views": yt.views,
                "description": yt.description,
                "thumbnail_url": yt.thumbnail_url,
                "publish_date": yt.publish_date,
                "qualities": [stream.resolution for stream in yt.streams.filter(progressive=True)]
            }
        except Exception as e:
            st.error(f"Error fetching video information: {str(e)}")
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
        """Create custom video player controls."""
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.selectbox("Quality", video_info.get('qualities', []))
        
        with col2:
            st.select_slider("Playback Speed", 
                           options=[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
                           value=1)
        
        with col3:
            st.checkbox("Autoplay", value=False)

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