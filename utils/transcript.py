from youtube_transcript_api import YouTubeTranscriptApi
from typing import Dict, Optional
import google.generativeai as genai
from config import GEMINI_API_KEY, MODEL_CONFIG
import time

class TranscriptProcessor:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
        self.last_api_call = time.time()
        self.min_delay = 1  # Minimum delay between API calls in seconds
        self.max_retries = 5  # Maximum number of retries for API calls

    def fetch_transcript(self, video_id: str) -> Optional[str]:
        """Fetch transcript from YouTube."""
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return ' '.join(entry['text'] for entry in transcript)
        except Exception as e:
            print(f"Error fetching transcript: {e}")
            return None

    def process_transcript(self, transcript: str) -> Dict:
        """Process transcript and generate learning content."""
        return {
            "summary": self._generate_summary(transcript),
            "key_points": self._extract_key_points(transcript),
            "sections": self._segment_content(transcript),
            "study_guide": self._create_study_guide(transcript),
            "vocabulary": self._extract_vocabulary(transcript)
        }

    def _make_api_call(self, prompt: str, retry_count: int = 0) -> str:
        """Make an API call with rate limiting and retries."""
        try:
            # Implement rate limiting
            current_time = time.time()
            time_since_last_call = current_time - self.last_api_call
            if time_since_last_call < self.min_delay:
                time.sleep(self.min_delay - time_since_last_call)

            # Make the API call
            response = self.model.generate_content(prompt)
            self.last_api_call = time.time()
            
            if response and response.text:
                return response.text
            return ""

        except Exception as e:
            if "ResourceExhausted" in str(e) and retry_count < self.max_retries:
                # If we hit the quota limit, wait longer and retry
                wait_time = (retry_count + 1) * 2  # Exponential backoff
                print(f"API quota reached. Waiting {wait_time} seconds before retrying...")
                time.sleep(wait_time)
                return self._make_api_call(prompt, retry_count + 1)
            elif retry_count >= self.max_retries:
                print("Maximum retries reached. Please try again later.")
                return "Content processing temporarily unavailable."
            else:
                print(f"Error processing content: {str(e)}")
                return "Error processing content. Please try again."

    def _generate_summary(self, transcript: str) -> str:
        """Generate a concise summary of the transcript."""
        prompt = f"Generate a concise summary of the following transcript:\n\n{transcript[:2000]}"
        return self._make_api_call(prompt)

    def _extract_key_points(self, transcript: str) -> list:
        """Extract key points from the transcript."""
        prompt = f"Extract 5-7 key points from the following transcript:\n\n{transcript[:2000]}"
        response = self._make_api_call(prompt)
        return response.split('\n')

    def _segment_content(self, transcript: str) -> list:
        """Segment transcript into logical sections."""
        prompt = f"""Divide this transcript into logical sections. For each section, provide:
        1. Section title
        2. Brief summary
        3. Key concepts covered

        Transcript:
        {transcript[:2000]}"""
        response = self._make_api_call(prompt)
        return response.split('\n\n')

    def _create_study_guide(self, transcript: str) -> str:
        """Create a comprehensive study guide."""
        prompt = f"""Create a study guide from this transcript. Include:
        1. Main topics
        2. Key concepts
        3. Important definitions
        4. Example questions

        Transcript:
        {transcript[:2000]}"""
        return self._make_api_call(prompt)

    def _extract_vocabulary(self, transcript: str) -> list:
        """Extract important vocabulary and definitions."""
        prompt = f"""Extract important terms and their definitions from this transcript:
        {transcript[:2000]}"""
        response = self._make_api_call(prompt)
        return response.split('\n') 