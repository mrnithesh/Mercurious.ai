from youtube_transcript_api import YouTubeTranscriptApi
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from config import GEMINI_API_KEY, MODEL_CONFIG
import time
import streamlit as st
import json

class TranscriptProcessor:
    def __init__(self):
        """Initialize the transcript processor."""
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
        self.last_api_call = time.time()
        self.min_delay = 1  # Minimum delay between API calls
        self.max_retries = 3  # Maximum number of retries

    def fetch_transcript(self, video_id: str) -> Optional[str]:
        """Fetch transcript from YouTube."""
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            formatted_transcript = []
            
            # Process transcript with timestamps
            current_time = 0
            for entry in transcript:
                timestamp = time.strftime('%M:%S', time.gmtime(entry['start']))
                formatted_transcript.append(f"[{timestamp}] {entry['text']}")
                current_time = entry['start']
            
            return '\n'.join(formatted_transcript)
            
        except Exception as e:
            st.error(f"Error fetching transcript: {str(e)}")
            return None

    def _make_api_call(self, prompt: str, retry_count: int = 0) -> Optional[str]:
        """Make an API call with rate limiting and retries."""
        try:
            current_time = time.time()
            time_since_last_call = current_time - self.last_api_call
            if time_since_last_call < self.min_delay:
                time.sleep(self.min_delay - time_since_last_call)

            # Show processing message
            with st.spinner("Processing content..."):
                response = self.model.generate_content(prompt)
                self.last_api_call = time.time()
                
                if response and response.text:
                    return response.text.strip()
                return None

        except Exception as e:
            if "ResourceExhausted" in str(e) and retry_count < self.max_retries:
                wait_time = (retry_count + 1) * 2
                st.warning(f"API quota reached. Waiting {wait_time} seconds before retrying...")
                time.sleep(wait_time)
                return self._make_api_call(prompt, retry_count + 1)
            else:
                st.error(f"Error processing content: {str(e)}")
                return None

    def process_transcript(self, transcript: str) -> Dict[str, Any]:
        """Process transcript and generate enhanced content."""
        try:
            # Generate content using AI
            prompt = f"""Analyze this video transcript and provide:
            1. A concise summary
            2. Main points (as a list)
            3. Key concepts (as a list)
            4. A study guide
            5. Important terms/vocabulary (as a list)
            6. Detailed analysis

            Transcript:
            {transcript}

            Format your response as valid JSON with these exact keys:
            {{
                "summary": "A concise summary...",
                "main_points": ["Point 1", "Point 2", ...],
                "key_concepts": ["Concept 1", "Concept 2", ...],
                "study_guide": "A detailed study guide...",
                "vocabulary": ["Term 1", "Term 2", ...],
                "analysis": "A detailed analysis..."
            }}
            """

            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            
            # Clean the response text
            response_text = response.text.replace('```json', '').replace('```', '').strip()
            
            try:
                content = json.loads(response_text)
                
                # Ensure all fields are present with proper types
                processed_content = {
                    "summary": str(content.get("summary", "")),
                    "main_points": list(content.get("main_points", [])),
                    "key_concepts": list(content.get("key_concepts", [])),
                    "study_guide": str(content.get("study_guide", "")),
                    "vocabulary": list(content.get("vocabulary", [])),
                    "analysis": str(content.get("analysis", "")),
                    "transcript": transcript,  # Include original transcript
                    "text": transcript  # For compatibility
                }
                
                return processed_content
                
            except json.JSONDecodeError as e:
                st.error(f"Failed to parse content: {str(e)}")
                # Return a basic structure if parsing fails
                return {
                    "summary": "Content processing failed",
                    "main_points": [],
                    "key_concepts": [],
                    "study_guide": "",
                    "vocabulary": [],
                    "analysis": "",
                    "transcript": transcript,
                    "text": transcript
                }
                
        except Exception as e:
            st.error(f"Error processing transcript: {str(e)}")
            return None

    def _generate_summary(self, transcript: str) -> Optional[str]:
        """Generate a concise summary of the transcript."""
        prompt = f"""Create a comprehensive yet concise summary of this video transcript. 
        Focus on the main ideas, key arguments, and important conclusions.
        Format the summary in clear paragraphs with proper transitions.

        TRANSCRIPT:
        {transcript[:4000]}  # Using more content for better context

        FORMAT:
        - 2-3 paragraphs
        - Clear topic sentences
        - Logical flow between ideas
        - Concluding statement"""

        return self._make_api_call(prompt)

    def _extract_key_points(self, transcript: str) -> Optional[List[str]]:
        """Extract key points from the transcript."""
        prompt = f"""Extract the most important points from this video content. 
        Each point should be a complete, self-contained idea.

        TRANSCRIPT:
        {transcript[:4000]}

        FORMAT:
        1. [Key Point 1]
        2. [Key Point 2]
        3. [Key Point 3]
        4. [Key Point 4]
        5. [Key Point 5]

        Make each point:
        - Clear and specific
        - Independent of other points
        - Directly supported by the content"""

        response = self._make_api_call(prompt)
        if response:
            points = []
            for line in response.split('\n'):
                line = line.strip()
                if line and any(line.startswith(str(i)) for i in range(1, 6)):
                    points.append(line.split('.', 1)[1].strip())
            return points if len(points) == 5 else None
        return None

    def _create_study_guide(self, transcript: str) -> Optional[str]:
        """Create a comprehensive study guide."""
        prompt = f"""Create a detailed study guide for this video content. Include the following sections:

        TRANSCRIPT:
        {transcript[:4000]}

        FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

        🎯 MAIN TOPICS
        1. [Topic 1]: Brief description
        2. [Topic 2]: Brief description
        3. [Topic 3]: Brief description

        📚 KEY CONCEPTS
        1. [Concept 1]
           - Definition/Explanation
           - Key points
           - Example (if applicable)

        2. [Concept 2]
           - Definition/Explanation
           - Key points
           - Example (if applicable)

        3. [Concept 3]
           - Definition/Explanation
           - Key points
           - Example (if applicable)

        💡 IMPORTANT DETAILS
        • [Detail 1]: Explanation
        • [Detail 2]: Explanation
        • [Detail 3]: Explanation

        📝 REVIEW QUESTIONS
        1. [Question 1]
        2. [Question 2]
        3. [Question 3]

        🔑 KEY TAKEAWAYS
        1. [Main takeaway 1]
        2. [Main takeaway 2]
        3. [Main takeaway 3]"""

        return self._make_api_call(prompt)

    def _extract_vocabulary(self, transcript: str) -> Optional[List[str]]:
        """Extract important vocabulary and definitions."""
        prompt = f"""Identify 5 important terms or concepts from this video content and provide clear, concise definitions.

        TRANSCRIPT:
        {transcript[:4000]}

        FORMAT:
        1. [Term]: [Definition]
        2. [Term]: [Definition]
        3. [Term]: [Definition]
        4. [Term]: [Definition]
        5. [Term]: [Definition]"""
        
        response = self._make_api_call(prompt)
        if response:
            terms = []
            for line in response.split('\n'):
                line = line.strip()
                if line and ':' in line and any(line.startswith(str(i)) for i in range(1, 6)):
                    terms.append(line.split('.', 1)[1].strip())
            return terms if len(terms) == 5 else None
        return None

    def _generate_quiz(self, transcript: str) -> Optional[Dict]:
        """Generate a quiz based on the video content."""
        prompt = f"""Create a quiz based on this video transcript. Format the response exactly as shown:

        TRANSCRIPT:
        {transcript[:4000]}

        Generate a quiz with 5 multiple choice questions. Format your response EXACTLY like this JSON structure:
        {{
            "questions": [
                {{
                    "question": "What is the main topic discussed in the video?",
                    "options": [
                        "A) Option 1",
                        "B) Option 2",
                        "C) Option 3",
                        "D) Option 4"
                    ],
                    "correct_answer": "A",
                    "explanation": "Brief explanation of why this is correct"
                }},
                // ... more questions following the same format
            ]
        }}

        Make sure:
        1. Each question has exactly 4 options
        2. Options are prefixed with A), B), C), D)
        3. Correct answer is just the letter (A, B, C, or D)
        4. Questions test understanding, not just recall
        5. Include brief explanations for correct answers
        """

        try:
            response = self._make_api_call(prompt)
            if response:
                # Clean the response to ensure it's valid JSON
                cleaned_response = response.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.endswith("```"):
                    cleaned_response = cleaned_response[:-3]
                
                # Parse the JSON response
                import json
                quiz_data = json.loads(cleaned_response)
                
                # Validate quiz structure
                if not self._validate_quiz_structure(quiz_data):
                    st.warning("Quiz generation failed validation. Using fallback quiz.")
                    return self._get_fallback_quiz()
                
                return quiz_data
            
        except Exception as e:
            st.error(f"Error generating quiz: {str(e)}")
        
        return self._get_fallback_quiz()

    def _validate_quiz_structure(self, quiz_data: Dict) -> bool:
        """Validate the structure of generated quiz data."""
        try:
            if not isinstance(quiz_data, dict) or "questions" not in quiz_data:
                return False
                
            questions = quiz_data["questions"]
            if not isinstance(questions, list) or len(questions) != 5:
                return False
                
            for q in questions:
                if not all(key in q for key in ["question", "options", "correct_answer", "explanation"]):
                    return False
                if not isinstance(q["options"], list) or len(q["options"]) != 4:
                    return False
                if q["correct_answer"] not in ["A", "B", "C", "D"]:
                    return False
                    
            return True
            
        except Exception:
            return False

    def _get_fallback_quiz(self) -> Dict:
        """Return a fallback quiz when generation fails."""
        return {
            "questions": [
                {
                    "question": "What is the main topic of the video?",
                    "options": [
                        "A) The content is not available",
                        "B) Please try processing the video again",
                        "C) Quiz generation failed",
                        "D) Check the video URL"
                    ],
                    "correct_answer": "C",
                    "explanation": "The quiz could not be generated from the video content. Please try processing the video again."
                }
            ]
        }

    def _get_empty_response(self) -> Dict:
        """Return empty response structure."""
        return {
            "summary": "Content processing failed. Please try again.",
            "key_points": ["Content processing failed. Please try again."],
            "vocabulary": ["Content processing failed. Please try again."],
            "study_guide": "Content processing failed. Please try again.",
            "quiz": self._get_fallback_quiz(),
            "transcript": ""
        }

    def _generate_detailed_analysis(self, transcript: str) -> Optional[str]:
        """Generate detailed content analysis."""
        prompt = f"""Provide a detailed analysis of this video content. Include:
        1. Main arguments and their support
        2. Key relationships between concepts
        3. Important implications
        4. Real-world applications
        5. Critical insights

        TRANSCRIPT:
        {transcript[:4000]}

        FORMAT:
        - Clear sections with headers
        - Specific examples from content
        - Logical connections
        - Practical applications"""

        return self._make_api_call(prompt)

    def _extract_key_concepts(self, transcript: str) -> Optional[List[str]]:
        """Extract key concepts and their relationships."""
        prompt = f"""Identify and explain the key concepts from this video content.
        For each concept, provide:
        1. Clear definition
        2. Importance in context
        3. Relationship to other concepts
        4. Practical application

        TRANSCRIPT:
        {transcript[:4000]}

        FORMAT:
        1. [Concept 1]: Definition and explanation
        2. [Concept 2]: Definition and explanation
        3. [Concept 3]: Definition and explanation"""

        response = self._make_api_call(prompt)
        if response:
            concepts = []
            for line in response.split('\n'):
                if line.strip() and any(line.startswith(str(i)) for i in range(1, 4)):
                    concepts.append(line.split('.', 1)[1].strip())
            return concepts if concepts else None
        return None

    def _generate_main_content(self, transcript: str) -> Optional[str]:
        """Generate comprehensive main content."""
        prompt = f"""Create a comprehensive analysis of this video content. Include:

        1. DETAILED OVERVIEW
        - Main topic and scope
        - Core arguments and evidence
        - Key relationships between concepts

        2. CRITICAL ANALYSIS
        - Strengths of arguments
        - Important implications
        - Real-world applications

        3. PRACTICAL INSIGHTS
        - Key takeaways
        - Application scenarios
        - Best practices

        TRANSCRIPT:
        {transcript[:4000]}

        FORMAT:
        - Clear section headers
        - Detailed explanations
        - Specific examples
        - Practical applications"""

        return self._make_api_call(prompt)