import streamlit as st
import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import Dict, List, Optional

# Load environment variables
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "learning_progress" not in st.session_state:
    st.session_state.learning_progress = {}
if "current_page" not in st.session_state:
    st.session_state.current_page = "home"

def extract_video_id(url: str) -> Optional[str]:
    """Extract video ID from YouTube URL"""
    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)'
    match = re.match(pattern, url)
    return match.group(1) if match else None

def fetch_transcript(video_id: str) -> Optional[str]:
    """Fetch video transcript"""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return ' '.join(entry['text'] for entry in transcript)
    except Exception as e:
        st.error(f"Error fetching transcript: {str(e)}")
        return None

def generate_quiz(transcript: str) -> List[Dict]:
    """Generate quiz questions from transcript"""
    prompt = f"""Generate 3 multiple choice questions based on this transcript:
    {transcript[:2000]}... # Limiting transcript length for API
    
    Format each question as:
    Question: [question text]
    A) [option]
    B) [option]
    C) [option]
    D) [option]
    Correct: [A/B/C/D]
    """
    
    response = genai.generate_content(prompt)
    quiz_text = response.text
    
    # Parse quiz text into structured format
    questions = []
    current_question = {}
    
    for line in quiz_text.split('\n'):
        if line.startswith('Question:'):
            if current_question:
                questions.append(current_question)
            current_question = {'question': line[9:].strip(), 'options': []}
        elif line.startswith(('A)', 'B)', 'C)', 'D)')):
            current_question['options'].append(line[3:].strip())
        elif line.startswith('Correct:'):
            current_question['correct'] = line[9:].strip()
    
    if current_question:
        questions.append(current_question)
    
    return questions

def navigation_bar():
    """Create navigation bar"""
    cols = st.columns([1, 1, 1, 1])
    with cols[0]:
        if st.button("Home"):
            st.session_state.current_page = "home"
    with cols[1]:
        if st.button("Learn"):
            st.session_state.current_page = "learn"
    with cols[2]:
        if st.button("Quiz"):
            st.session_state.current_page = "quiz"
    with cols[3]:
        if st.button("Progress"):
            st.session_state.current_page = "progress"