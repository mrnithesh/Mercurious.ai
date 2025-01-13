from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime
import google.generativeai as genai
import networkx as nx
import logging
import streamlit as st
from config import GEMINI_API_KEY, MODEL_CONFIG

@dataclass
class LearningStyle:
    primary_style: str
    secondary_style: str
    strength: float
    last_updated: datetime

    def __post_init__(self):
        valid_styles = {'visual', 'auditory', 'kinesthetic', 'reading/writing'}
        if not (self.primary_style in valid_styles and self.secondary_style in valid_styles):
            raise ValueError(f"Invalid learning style. Must be one of: {valid_styles}")
        if not 0 <= self.strength <= 1:
            raise ValueError("Strength must be between 0 and 1")

@dataclass
class Achievement:
    id: str
    name: str
    description: str
    difficulty: str
    progress: float
    completed: bool
    completed_at: Optional[datetime]

    def __post_init__(self):
        if self.difficulty not in {'easy', 'medium', 'hard', 'legendary'}:
            raise ValueError("Invalid difficulty level")
        if not 0 <= self.progress <= 1:
            raise ValueError("Progress must be between 0 and 1")

class Avatar:
    def __init__(self, user_id: str, db):
        if not user_id:
            raise ValueError("user_id cannot be empty")
        
        self.user_id = user_id
        self.db = db
        self.logger = logging.getLogger(__name__)
        
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
            self.knowledge_graph = nx.DiGraph()
            self.learning_style = self._load_learning_style()
            self.achievements = self._load_achievements()
            self.performance_metrics = {
                'difficulty_levels': {},
                'topic_mastery': {},
                'completion_rates': {},
                'engagement_scores': {}
            }
        except Exception as e:
            raise RuntimeError(f"Initialization failed: {e}")

    def process_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        if not content.get('text'):
            raise ValueError("Content must contain 'text' field")
            
        try:
            processed = {
                'concepts': self._extract_concepts(content['text']),
                'summary': self._generate_summary(content['text']),
                'difficulty': self._assess_difficulty(content['text']),
                'prerequisites': self._identify_prerequisites(content['text']),
                'key_points': self._extract_key_points(content['text']),
                'relationships': self._map_relationships(content['text']),
                'processed_at': datetime.now().isoformat()
            }
            
            if processed['concepts'] and processed['relationships']:
                self._update_knowledge_graph(processed['concepts'], processed['relationships'])
            
            return processed
        except Exception as e:
            self.logger.error(f"Content processing failed: {e}")
            raise

    def generate_personalized_quiz(self, topic: str, difficulty: str = "auto") -> List[Dict]:
        try:
            difficulty = self._calculate_optimal_difficulty(topic) if difficulty == "auto" else difficulty
            prompt = self._build_quiz_prompt(
                topic, 
                difficulty, 
                self._identify_weak_areas(topic), 
                self._get_user_profile()
            )
            response = self.model.generate_content(prompt)
            return self._enhance_quiz_questions(self._parse_quiz_response(response.text), topic)
        except Exception as e:
            self.logger.error(f"Quiz generation failed: {e}")
            return []

    def provide_learning_support(self, query: str, context: str) -> Dict[str, Any]:
        try:
            analysis = self._analyze_query(query)
            response = self._generate_learning_response(
                query=query,
                analysis=analysis,
                context=self._find_relevant_context(query, context),
                learning_style=self.learning_style
            )
            self._track_interaction(analysis['type'], response['effectiveness'])
            return response
        except Exception as e:
            self.logger.error(f"Learning support failed: {e}")
            return {"error": str(e)}

    def update_learning_progress(self, activity_data: Dict[str, Any]) -> None:
        try:
            self._update_performance_metrics(activity_data)
            self._check_achievements(activity_data)
            if self._should_update_learning_style():
                self._update_learning_style()
            self._save_progress_to_db()
        except Exception as e:
            self.logger.error(f"Progress update failed: {e}")

    def display(self):
        try:
            st.subheader("🎓 Learning Assistant")
            st.write(f"Learning Style: {self.learning_style.primary_style}")
            
            col1, col2, col3 = st.columns(3)
            metrics = {
                "Topics Mastered": len([t for t, v in self.performance_metrics['topic_mastery'].items() if v >= 0.8]),
                "Average Score": f"{self._calculate_average_score():.1%}",
                "Active Streak": self._calculate_streak()
            }
            
            for col, (label, value) in zip([col1, col2, col3], metrics.items()):
                with col:
                    st.metric(label, value)
            
            st.subheader("🏆 Achievements")
            self._display_achievements()
            
            st.subheader("🔍 Knowledge Map")
            self._display_knowledge_graph()
            
        except Exception as e:
            self.logger.error(f"Display failed: {e}")
            st.error("Failed to display avatar interface")

    def _load_learning_style(self) -> LearningStyle:
        try:
            # Attempt to load from database
            style_data = self.db.collection('learning_styles').document(self.user_id).get()
            if style_data.exists:
                data = style_data.to_dict()
                return LearningStyle(
                    primary_style=data['primary_style'],
                    secondary_style=data['secondary_style'],
                    strength=data['strength'],
                    last_updated=data['last_updated'].timestamp()
                )
            # Return default if not found
            return LearningStyle(
                primary_style='visual',
                secondary_style='reading/writing',
                strength=0.5,
                last_updated=datetime.now()
            )
        except Exception as e:
            self.logger.error(f"Failed to load learning style: {e}")
            # Return default on error
            return LearningStyle(
                primary_style='visual',
                secondary_style='reading/writing',
                strength=0.5,
                last_updated=datetime.now()
            )

    def _load_achievements(self) -> List[Achievement]:
        try:
            # Attempt to load from database
            achievements_data = self.db.collection('achievements').document(self.user_id).get()
            if achievements_data.exists:
                data = achievements_data.to_dict()
                return [
                    Achievement(
                        id=ach['id'],
                        name=ach['name'],
                        description=ach['description'],
                        difficulty=ach['difficulty'],
                        progress=ach['progress'],
                        completed=ach['completed'],
                        completed_at=datetime.fromtimestamp(ach['completed_at']) if ach['completed_at'] else None
                    )
                    for ach in data['achievements']
                ]
            # Return empty list if not found
            return []
        except Exception as e:
            self.logger.error(f"Failed to load achievements: {e}")
            return []