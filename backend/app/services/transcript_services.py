import asyncio
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import GenericProxyConfig
from typing import Dict, List, Optional
import google.genai as genai
from dotenv import load_dotenv
import os
from fastapi import HTTPException
load_dotenv()

class ProxyManager:
    """Manages proxy servers with ScraperAPI priority and free proxy fallbacks"""
    
    # List of free public proxies as fallback (these change frequently)
    FALLBACK_PROXIES = [
        "http://20.111.54.16:8123",
        "http://8.219.97.248:80",
        "http://47.88.3.19:8080",
        "http://47.251.43.115:33333",
        "http://165.154.226.242:80",
    ]
    
    def __init__(self):
        self.scraperapi_key = os.getenv("SCRAPERAPI_KEY")
        self.fallback_index = 0
        
    def get_scraperapi_config(self) -> Optional[GenericProxyConfig]:
        """Get ScraperAPI proxy configuration (priority method)"""
        if not self.scraperapi_key:
            return None
        
        # ScraperAPI proxy format
        proxy_url = f"http://scraperapi:{self.scraperapi_key}@proxy-server.scraperapi.com:8001"
        return GenericProxyConfig(
            http_url=proxy_url,
            https_url=proxy_url
        )
    
    def get_fallback_proxy_config(self) -> Optional[GenericProxyConfig]:
        """Get next free proxy configuration (fallback method)"""
        if not self.FALLBACK_PROXIES:
            return None
        
        # Rotate through fallback proxies
        if self.fallback_index >= len(self.FALLBACK_PROXIES):
            self.fallback_index = 0
        
        proxy_url = self.FALLBACK_PROXIES[self.fallback_index]
        self.fallback_index += 1
        
        return GenericProxyConfig(
            http_url=proxy_url,
            https_url=proxy_url
        )
    
    def has_scraperapi(self) -> bool:
        """Check if ScraperAPI key is available"""
        return bool(self.scraperapi_key)

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
        """Fetch transcript from YouTube using ScraperAPI, then free proxies, then direct connection"""
        last_error = None
        
        print(f"📥 Fetching transcript for video: {video_id}")
        
        # Method 1: Try ScraperAPI (most reliable for cloud deployments)
        if self.proxy_manager.has_scraperapi():
            try:
                print("🔄 Method 1: Trying ScraperAPI (residential proxies)...")
                scraperapi_config = self.proxy_manager.get_scraperapi_config()
                ytt_api = YouTubeTranscriptApi(proxy_config=scraperapi_config)
                
                loop = asyncio.get_event_loop()
                transcript = await loop.run_in_executor(
                    None,
                    lambda: ytt_api.get_transcript(video_id)
                )
                
                result = ' '.join(entry['text'] for entry in transcript)
                if not result.strip():
                    raise HTTPException(
                        status_code=404,
                        detail="Transcript is empty or not available"
                    )
                
                print("✅ SUCCESS: Transcript fetched using ScraperAPI")
                return result
                
            except HTTPException:
                raise
            except Exception as e:
                last_error = str(e)
                print(f"❌ ScraperAPI failed: {last_error}")
                print("⚠️ Falling back to free proxies...")
        else:
            print("⚠️ SCRAPERAPI_KEY not found - skipping ScraperAPI")
            print("💡 Tip: Add SCRAPERAPI_KEY to .env for reliable cloud deployment")
        
        # Method 2: Try free proxy fallbacks
        print("🔄 Method 2: Trying free proxy servers...")
        for attempt in range(3):
            try:
                fallback_config = self.proxy_manager.get_fallback_proxy_config()
                if fallback_config:
                    print(f"  Attempt {attempt + 1}/3: Trying free proxy...")
                    ytt_api = YouTubeTranscriptApi(proxy_config=fallback_config)
                    
                    loop = asyncio.get_event_loop()
                    transcript = await loop.run_in_executor(
                        None,
                        lambda: ytt_api.get_transcript(video_id)
                    )
                    
                    result = ' '.join(entry['text'] for entry in transcript)
                    if not result.strip():
                        raise HTTPException(
                            status_code=404,
                            detail="Transcript is empty or not available"
                        )
                    
                    print("✅ SUCCESS: Transcript fetched using free proxy")
                    return result
                    
            except HTTPException:
                raise
            except Exception as e:
                last_error = str(e)
                print(f"  ❌ Free proxy attempt {attempt + 1} failed: {last_error}")
                if attempt < 2:
                    await asyncio.sleep(1)
        
        # Method 3: Try direct connection (works locally, may fail on cloud)
        print("🔄 Method 3: Trying direct connection (no proxy)...")
        try:
            ytt_api = YouTubeTranscriptApi()
            
            loop = asyncio.get_event_loop()
            transcript = await loop.run_in_executor(
                None,
                lambda: ytt_api.get_transcript(video_id)
            )
            
            result = ' '.join(entry['text'] for entry in transcript)
            if not result.strip():
                raise HTTPException(
                    status_code=404,
                    detail="Transcript is empty or not available"
                )
            
            print("✅ SUCCESS: Transcript fetched using direct connection")
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            last_error = str(e)
            print(f"❌ Direct connection failed: {last_error}")
        
        # All methods failed
        error_msg = (
            f"Failed to fetch transcript after trying all methods. "
            f"Last error: {last_error}. "
            f"{'Consider adding SCRAPERAPI_KEY for cloud deployment.' if not self.proxy_manager.has_scraperapi() else 'ScraperAPI may have rate limits.'}"
        )
        raise HTTPException(status_code=500, detail=error_msg)

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