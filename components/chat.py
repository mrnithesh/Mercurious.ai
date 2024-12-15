import streamlit as st
import google.generativeai as genai
from typing import List, Dict, Optional
from config import GEMINI_API_KEY, MODEL_CONFIG
import time
from datetime import datetime

class ChatEngine:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
        self.history = []
        self._initialize_session_state()

    def _initialize_session_state(self):
        """Initialize session state for chat history."""
        if "chat_history" not in st.session_state:
            st.session_state.chat_history = []
        if "context" not in st.session_state:
            st.session_state.context = None

    def set_context(self, video_data: Dict):
        """Set video context for the chat."""
        if video_data and 'content' in video_data:
            context = f"""
            Video Title: {video_data.get('title', '')}
            
            Transcript:
            {video_data.get('content', {}).get('transcript', '')}
            
            Summary:
            {video_data.get('content', {}).get('summary', '')}
            
            Key Points:
            {', '.join(video_data.get('content', {}).get('key_points', []))}
        