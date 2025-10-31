import asyncio
from youtube_transcript_api import YouTubeTranscriptApi
from typing import Dict, List
import google.genai as genai
from dotenv import load_dotenv
import os
from fastapi import HTTPException
load_dotenv()

class TranscriptService:
    def __init__(self):
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=500, 
                detail="GEMINI_API_KEY not found in environment variables"
            )
        
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model_name = 'gemini-2.5-flash'

    async def fetch_transcript(self, video_id: str) -> str:
        #fetch transcript from YouTube
        try:
            loop = asyncio.get_event_loop()
            transcript = await loop.run_in_executor(
                None, 
                lambda: YouTubeTranscriptApi.get_transcript(video_id)
            )
            result = ' '.join(entry['text'] for entry in transcript)
            if not result.strip():
                raise HTTPException(
                    status_code=404, 
                    detail="Transcript is empty or not available"
                )
            return result
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error fetching transcript: {str(e)}"
            )

    async def process_transcript(self, transcript: str) -> Dict:
        #process transcript and generate learning content matching VideoContent model
        if not transcript or not transcript.strip():
            raise HTTPException(
                status_code=400, 
                detail="Transcript content is empty or invalid"
            )

        try:
            tasks = [
                self._generate_summary(transcript),
                self._extract_main_points(transcript),
                self._extract_key_concepts(transcript),
                self._create_study_guide(transcript),
                self._extract_vocabulary(transcript),
                self._generate_analysis(transcript)
            ]
            
            results = await asyncio.gather(*tasks)
            
            return {
                "summary": results[0],
                "main_points": results[1],
                "key_concepts": results[2],
                "study_guide": results[3],
                "vocabulary": results[4],
                "analysis": results[5]
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error processing transcript with AI: {str(e)}"
            )

    async def _generate_summary(self, transcript: str) -> str:
        #generate a concise summary of the transcript
        try:
            prompt = f"""Generate a concise 2-3 paragraph summary of the following transcript. 
            Focus on the main ideas, key arguments, and important conclusions:
            
            {transcript[:4000]}"""
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            )
            if not response or not response.text:
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to generate summary - empty AI response"
                )
            return response.text.strip()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error generating summary: {str(e)}"
            )

    async def _extract_main_points(self, transcript: str) -> List[str]:
        #extract main points from the transcript
        try:
            prompt = f"""Extract 5-7 main points from the following transcript. 
            Return each point as a clear, concise statement on a new line:
            
            {transcript[:4000]}"""
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            )
            if not response or not response.text:
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to extract main points - empty AI response"
                )
            
            points = [point.strip() for point in response.text.split('\n') if point.strip()]
            if not points:
                raise HTTPException(
                    status_code=500, 
                    detail="No main points could be extracted from transcript"
                )
            return points[:7]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error extracting main points: {str(e)}"
            )

    async def _extract_key_concepts(self, transcript: str) -> List[str]:
        #extract key concepts from the transcript
        try:
            prompt = f"""Extract key concepts, terms, and important topics from the following transcript. Extract only the main 5 topics only.
            Return each concept on a new line:
            
            {transcript[:4000]}"""
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            )
            if not response or not response.text:
                return []  # Key concepts are optional, return empty list
            
            concepts = [concept.strip() for concept in response.text.split('\n') if concept.strip()]
            return concepts
        except Exception as e:
            # Log error but don't fail the entire process for optional field
            print(f"Warning: Error extracting key concepts: {str(e)}")
            return []

    async def _create_study_guide(self, transcript: str) -> str:
        #create a comprehensive study guide
        try:
            prompt = f"""Create a comprehensive study guide from this transcript. Include:
            
            🎯 MAIN TOPICS
            📚 KEY CONCEPTS  
            💡 IMPORTANT DEFINITIONS
            ❓ STUDY QUESTIONS

            Transcript:
            {transcript[:4000]}"""
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            )
            if not response or not response.text:
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to generate study guide - empty AI response"
                )
            return response.text.strip()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error creating study guide: {str(e)}"
            )

    async def _extract_vocabulary(self, transcript: str) -> List[str]:
        #extract important vocabulary and definitions
        try:
            prompt = f"""Extract important terms and their definitions from this transcript. 
            Format as 'Term: Definition' on separate lines:
            
            {transcript[:4000]}"""
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            )
            if not response or not response.text:
                return []  # Vocabulary is optional, return empty list
            
            vocab_items = [item.strip() for item in response.text.split('\n') if item.strip()]
            return vocab_items
        except Exception as e:
            # Log error but don't fail the entire process for optional field
            print(f"Warning: Error extracting vocabulary: {str(e)}")
            return []

    async def _generate_analysis(self, transcript: str) -> str:
        #generate detailed analysis of the transcript content
        try:
            prompt = f"""Provide a detailed educational analysis of this transcript including:
            
            📊 Main themes and topics
            🎯 Learning objectives  
            📈 Difficulty level
            👥 Target audience
            ⭐ Educational value and insights
            
            Transcript:
            {transcript[:4000]}"""
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            )
            if not response or not response.text:
                return "Analysis could not be generated for this transcript."  # Graceful fallback
            
            return response.text.strip()
        except Exception as e:
            # Log error but provide fallback for optional field
            print(f"Warning: Error generating analysis: {str(e)}")
            return f"Analysis unavailable due to processing error: {str(e)}" 