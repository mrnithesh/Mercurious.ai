import google.generativeai as genai
import json
import time
import streamlit as st
from typing import List, Dict, Any

class QuizGenerator:
    def __init__(self):
        """Initialize quiz generator with rate limiting."""
        self.model = genai.GenerativeModel('gemini-pro')
        self.last_api_call = time.time()
        self.min_delay = 1  # Minimum delay between API calls in seconds
        self.max_retries = 3  # Maximum number of retries

    def _make_api_call(self, prompt: str, retry_count: int = 0) -> str:
        """Make API call to generate quiz questions."""
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            
            # Clean the response text
            response_text = response.text
            
            # Remove markdown code block indicators if present
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            return response_text
            
        except Exception as e:
            if retry_count < self.max_retries:
                time.sleep(1)  # Wait before retrying
                return self._make_api_call(prompt, retry_count + 1)
            elif retry_count >= self.max_retries:
                st.error("Maximum retries reached. Please try again later.")
                return self._get_default_quiz()
            else:
                st.error(f"Error generating quiz: {str(e)}")
                return self._get_default_quiz()

    def _get_default_quiz(self) -> List[Dict[str, Any]]:
        """Return a default quiz when generation fails."""
        return [
            {
                "question": "What was the main topic of the video?",
                "options": [
                    "A) Unable to determine - please try again",
                    "B) Video content not available",
                    "C) Processing error occurred",
                    "D) Quiz generation failed"
                ],
                "correct_answer": "A) Unable to determine - please try again",
                "explanation": "The quiz could not be generated. Please try processing the video again."
            }
        ]

    def generate_quiz(self, content: Dict[str, Any], num_questions: int = 5) -> List[Dict[str, Any]]:
        """Generate a quiz based on the content."""
        try:
            # Validate content
            if not content or not isinstance(content, dict):
                st.warning("Invalid content provided for quiz generation")
                return self._get_default_quiz()

            # Ensure we have the minimum required content
            if not content.get('transcript') and not content.get('summary'):
                st.warning("Insufficient content for quiz generation")
                return self._get_default_quiz()

            # Format content for the prompt, ensuring all fields are strings or lists
            content_str = f"""
            Video Content:
            {str(content.get('transcript', ''))}
            
            Summary:
            {str(content.get('summary', ''))}
            
            Main Points:
            {' • '.join(str(point) for point in (content.get('main_points', []) or []) if point)}
            
            Key Concepts:
            {' • '.join(str(concept) for concept in (content.get('key_concepts', []) or []) if concept)}
            
            Study Guide:
            {str(content.get('study_guide', ''))}
            """

            prompt = f"""Based on the video content and summary below, generate {num_questions} multiple choice questions.
            
            CONTENT:
            {content_str}

            INSTRUCTIONS:
            1. Generate exactly {num_questions} questions based on the main points and key concepts
            2. Each question must have exactly 4 options
            3. One option must be the correct answer
            4. Include a brief explanation for the correct answer
            5. Return ONLY a valid JSON array, no markdown formatting
            6. Use this exact structure for each question:
            {{
                "question": "What is...",
                "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
                "correct_answer": "A) First option",
                "explanation": "This is correct because..."
            }}

            IMPORTANT:
            - Questions should test understanding of key concepts
            - The correct_answer must match one of the options exactly
            - All options should start with A), B), C), or D)
            - Return ONLY the JSON array, no other text
            """

            # Make API call
            response = self._make_api_call(prompt)
            if not response:
                st.warning("Failed to generate quiz content")
                return self._get_default_quiz()
            
            try:
                # Try to parse the response as JSON
                quiz_data = json.loads(response)
                
                if isinstance(quiz_data, list) and len(quiz_data) > 0:
                    # Validate and fix each question
                    valid_questions = []
                    for i, question in enumerate(quiz_data):
                        if self._validate_question(question):
                            valid_questions.append(question)
                        else:
                            st.warning(f"Question {i + 1} failed validation")
                    
                    if valid_questions:
                        return valid_questions
                    else:
                        st.warning("No valid questions generated")
                        return self._get_default_quiz()
                else:
                    st.warning("Invalid quiz format received")
                    return self._get_default_quiz()
            except json.JSONDecodeError as e:
                st.warning(f"Failed to parse quiz data: {str(e)}")
                return self._get_default_quiz()

        except Exception as e:
            st.error(f"Error generating quiz: {str(e)}")
            return self._get_default_quiz()

    def _validate_question(self, question: Dict[str, Any]) -> bool:
        """Validate a quiz question has all required fields in correct format."""
        try:
            # Check required fields exist
            required_fields = ['question', 'options', 'correct_answer', 'explanation']
            for field in required_fields:
                if field not in question:
                    st.warning(f"Missing required field: {field}")
                    return False
            
            # Check options is a list with exactly 4 options
            if not isinstance(question['options'], list):
                st.warning("Options is not a list")
                return False
            
            if len(question['options']) != 4:
                st.warning(f"Wrong number of options: {len(question['options'])}")
                return False
            
            # Check correct_answer is one of the options
            if question['correct_answer'] not in question['options']:
                st.warning(f"Correct answer '{question['correct_answer']}' not in options: {question['options']}")
                return False
            
            return True
        except Exception as e:
            st.warning(f"Validation error: {str(e)}")
            return False

    def grade_answer(self, question: Dict[str, Any], user_answer: str) -> bool:
        """Grade a user's answer to a quiz question."""
        try:
            return user_answer == question.get('correct_answer', '')
        except Exception as e:
            st.error(f"Error grading answer: {str(e)}")
            return False