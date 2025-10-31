import asyncio
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import GenericProxyConfig
from typing import Dict, List, Optional
import google.genai as genai
from dotenv import load_dotenv
import os
from fastapi import HTTPException
import requests
import random
load_dotenv()

class ProxyManager:
    """Manages free proxy servers for YouTube transcript API"""
    
    # List of free public proxies (these change frequently, but provide fallback)
    FALLBACK_PROXIES = [
        "http://20.111.54.16:8123",
        "http://8.219.97.248:80",
        "http://47.88.3.19:8080",
        "http://47.251.43.115:33333",
        "http://165.154.226.242:80",
    ]
    
    def __init__(self):
        self.proxy_list = []
        self.current_index = 0
        
    def fetch_free_proxies(self) -> List[str]:
        """Fetch free proxies from online sources"""
        proxies = []
        
        try:
            # Try fetching from free proxy API
            response = requests.get(
                "https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all",
                timeout=5
            )
            if response.status_code == 200:
                proxy_lines = response.text.strip().split('\n')
                for proxy in proxy_lines[:10]:  # Take first 10
                    if proxy.strip():
                        proxies.append(f"http://{proxy.strip()}")
        except Exception as e:
            print(f"Failed to fetch proxies from proxyscrape: {str(e)}")
        
        # Add fallback proxies
        proxies.extend(self.FALLBACK_PROXIES)
        
        # Shuffle for load distribution
        random.shuffle(proxies)
        return proxies
    
    def get_proxy_config(self, proxy_url: str) -> GenericProxyConfig:
        """Create proxy configuration for YouTubeTranscriptApi"""
        return GenericProxyConfig(
            http_url=proxy_url,
            https_url=proxy_url
        )
    
    def get_next_proxy(self) -> Optional[str]:
        """Get next proxy from the list"""
        if not self.proxy_list:
            self.proxy_list = self.fetch_free_proxies()
            self.current_index = 0
        
        if not self.proxy_list:
            return None
        
        if self.current_index >= len(self.proxy_list):
            self.current_index = 0
            
        proxy = self.proxy_list[self.current_index]
        self.current_index += 1
        return proxy

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
        self.proxy_manager = ProxyManager()

    async def fetch_transcript(self, video_id: str) -> str:
        """Fetch transcript from YouTube using proxies with retry logic"""
        max_attempts = 5
        last_error = None
        
        # Try with multiple proxies
        for attempt in range(max_attempts):
            try:
                proxy_url = self.proxy_manager.get_next_proxy()
                
                if proxy_url:
                    print(f"Attempt {attempt + 1}/{max_attempts}: Trying proxy {proxy_url}")
                    proxy_config = self.proxy_manager.get_proxy_config(proxy_url)
                    ytt_api = YouTubeTranscriptApi(proxy_config=proxy_config)
                else:
                    print(f"Attempt {attempt + 1}/{max_attempts}: Trying without proxy")
                    ytt_api = YouTubeTranscriptApi()
                
                # Fetch transcript in executor to avoid blocking
                loop = asyncio.get_event_loop()
                transcript = await loop.run_in_executor(
                    None,
                    lambda: ytt_api.get_transcript(video_id)
                )
                
                # Process transcript
                result = ' '.join(entry['text'] for entry in transcript)
                if not result.strip():
                    raise HTTPException(
                        status_code=404,
                        detail="Transcript is empty or not available"
                    )
                
                print(f"✓ Successfully fetched transcript using {'proxy ' + proxy_url if proxy_url else 'direct connection'}")
                return result
                
            except HTTPException:
                raise
            except Exception as e:
                last_error = str(e)
                print(f"✗ Attempt {attempt + 1} failed: {last_error}")
                
                # If this was the last attempt, raise error
                if attempt == max_attempts - 1:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to fetch transcript after {max_attempts} attempts. Last error: {last_error}"
                    )
                
                # Wait a bit before retrying
                await asyncio.sleep(1)
        
        # Fallback error (should not reach here)
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching transcript: {last_error}"
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