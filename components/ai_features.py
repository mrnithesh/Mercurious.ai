import google.generativeai as genai
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import logging
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
from ratelimit import limits, sleep_and_retry
from datetime import datetime
import json
import os

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

MODEL_CONFIG = {
    "gemini_model": os.getenv('GEMINI_MODEL', 'gemini-2.0-flash'),
    "temperature": float(os.getenv('GEMINI_TEMPERATURE', 0.7)),
    "max_output_tokens": int(os.getenv('GEMINI_MAX_TOKENS', 2048)),
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ContentMetrics:
    """Metrics for content analysis"""
    readability_score: float
    complexity_level: int
    engagement_potential: float
    time_to_complete: int

    def __post_init__(self):
        if not all([
            0 <= self.readability_score <= 100,
            1 <= self.complexity_level <= 10,
            0 <= self.engagement_potential <= 1,
            self.time_to_complete >= 0
        ]):
            raise ValueError("Invalid metric values")

@dataclass
class LearningInsight:
    """Learning insights with validation"""
    strengths: List[str]
    areas_for_improvement: List[str]
    recommended_topics: List[str]
    learning_velocity: float
    engagement_score: float
    retention_rate: float
    mastery_level: Dict[str, float]
    next_steps: List[Dict[str, Any]]

    def __post_init__(self):
        if not all([
            0 <= score <= 1 for score in [
                self.learning_velocity,
                self.engagement_score,
                self.retention_rate,
                *self.mastery_level.values()
            ]
        ]):
            raise ValueError("All scores must be between 0 and 1")

class AIFeatures:
    def __init__(self, db):
        if not db:
            raise ValueError("Database connection is required")
        
        self.db = db
        self._setup_gemini()
        self.content_cache = {}
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.metrics = {'api_calls': 0, 'cache_hits': 0, 'processing_times': [], 'error_counts': {}}

    def _setup_gemini(self):
        """Initialize Gemini with error handling"""
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Gemini model: {e}")

    @sleep_and_retry
    @limits(calls=50, period=60)
    def _make_api_call(self, prompt: str) -> str:
        """Rate-limited API calls"""
        try:
            self.metrics['api_calls'] += 1
            return self.model.generate_content(prompt).text
        except Exception as e:
            error_type = type(e).__name__
            self.metrics['error_counts'][error_type] = self.metrics['error_counts'].get(error_type, 0) + 1
            logger.error(f"API call failed: {str(e)}")
            raise

    def _get_cached_content(self, content_hash: str) -> Optional[Dict]:
        """Retrieve cached content"""
        return self.content_cache.get(content_hash)

    def _cache_content(self, content_hash: str, content: Dict):
        """Cache processed content"""
        self.content_cache[content_hash] = content

    def _extract_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text"""
        prompt = f"Extract key concepts from the following text:\n{text}"
        response = self._make_api_call(prompt)
        return [concept.strip() for concept in response.split('\n') if concept.strip()]

    def _extract_topic_map(self, text: str) -> Dict[str, List[str]]:
        """Generate topic map with relationships"""
        prompt = f"Create a topic map with relationships for:\n{text}"
        response = self._make_api_call(prompt)
        return json.loads(response)

    def _extract_difficulty(self, text: str) -> int:
        """Assess content difficulty level"""
        prompt = f"Rate the difficulty level (1-10) for:\n{text}"
        response = self._make_api_call(prompt)
        return int(response.strip())

    def _extract_prerequisites(self, text: str) -> List[str]:
        """Identify prerequisites"""
        prompt = f"List prerequisites for understanding:\n{text}"
        response = self._make_api_call(prompt)
        return [prereq.strip() for prereq in response.split('\n') if prereq.strip()]

    def _extract_outcomes(self, text: str) -> List[str]:
        """Define learning outcomes"""
        prompt = f"List expected learning outcomes for:\n{text}"
        response = self._make_api_call(prompt)
        return [outcome.strip() for outcome in response.split('\n') if outcome.strip()]

    def _calculate_content_metrics(self, text: str) -> ContentMetrics:
        """Calculate content metrics"""
        # This would typically involve more sophisticated analysis
        return ContentMetrics(
            readability_score=75.0,  # Example values
            complexity_level=5,
            engagement_potential=0.8,
            time_to_complete=30
        )

    @lru_cache(maxsize=1000)
    def process_content(self, content_hash: str, content: Dict[str, Any]) -> Dict[str, Any]:
        """Process content with parallel execution"""
        if not content_hash or not content:
            raise ValueError("Content hash and content are required")

        cached = self._get_cached_content(content_hash)
        if cached:
            self.metrics['cache_hits'] += 1
            return cached

        try:
            with ThreadPoolExecutor() as executor:
                futures = {
                    key: executor.submit(getattr(self, f"_extract_{key}"), content["text"])
                    for key in ['concepts', 'topic_map', 'difficulty', 'prerequisites', 'outcomes']
                }
                
                enriched_content = {
                    "key_concepts": futures['concepts'].result(timeout=30),
                    "topic_map": futures['topic_map'].result(timeout=30),
                    "difficulty_level": futures['difficulty'].result(timeout=30),
                    "prerequisites": futures['prerequisites'].result(timeout=30),
                    "learning_outcomes": futures['outcomes'].result(timeout=30),
                    "metrics": self._calculate_content_metrics(content["text"]),
                    "processed_at": datetime.now().isoformat()
                }

            self._cache_content(content_hash, enriched_content)
            return enriched_content

        except Exception as e:
            logger.error(f"Content processing failed: {str(e)}")
            raise RuntimeError(f"Content processing failed: {e}")

    def generate_learning_insight(self, user_id: str, content_id: str) -> LearningInsight:
        """Generate personalized learning insights"""
        try:
            user_data = self.db.get_user_data(user_id)
            content_data = self.db.get_content_data(content_id)
            
            prompt = f"""
            Generate learning insights for:
            User Profile: {json.dumps(user_data)}
            Content: {json.dumps(content_data)}
            """
            
            response = self._make_api_call(prompt)
            insight_data = json.loads(response)
            
            return LearningInsight(**insight_data)
            
        except Exception as e:
            logger.error(f"Failed to generate learning insight: {str(e)}")
            raise

    def cleanup(self):
        """Cleanup resources"""
        self.executor.shutdown(wait=True)
        self.content_cache.clear()
        logger.info("AIFeatures cleanup completed")