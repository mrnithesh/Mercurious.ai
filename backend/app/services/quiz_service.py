import os
import asyncio
import json
import google.genai as genai
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
from fastapi import HTTPException
from ..models.quiz import (
    QuizQuestion, QuizGenerateRequest, QuizResponse, 
    QuizSubmission, QuizResult, QuizResultResponse
)
from ..models.video import VideoContent
from .video_database_service import VideoDatabase

load_dotenv()


class QuizService:
    def __init__(self):
        # Configure Gemini API (same pattern as ChatService)
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500, 
                detail="GEMINI_API_KEY not found in environment variables"
            )
        
        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-2.5-flash'
        self.video_db = VideoDatabase()

    async def generate_quiz(self, request: QuizGenerateRequest, user_id: str) -> QuizResponse:
        """Generate AI-powered quiz based on video content"""
        try:
            # Verify user has access to this video
            has_access = await self.video_db.check_video_in_user_library(user_id, request.video_id)
            if not has_access:
                raise HTTPException(status_code=403, detail="User does not have access to this video")
            
            # Check if quiz already exists and is cached
            cached_quiz = await self._get_cached_quiz(request.video_id)
            if cached_quiz and self._is_quiz_fresh(cached_quiz):
                return cached_quiz
            
            # Get video content for quiz generation
            global_video = await self.video_db.get_global_video(request.video_id)
            if not global_video:
                raise HTTPException(status_code=404, detail="Video content not found")
            
            # Generate quiz using AI
            quiz_questions = await self._generate_quiz_with_ai(
                global_video.content, 
                global_video.info.title,
                request.num_questions
            )
            
            # Create quiz response
            quiz_response = QuizResponse(
                questions=quiz_questions,
                video_id=request.video_id,
                generated_at=datetime.now()
            )
            
            # Cache the generated quiz
            await self._cache_quiz(quiz_response)
            
            return quiz_response
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

    async def submit_quiz(self, submission: QuizSubmission, user_id: str) -> QuizResultResponse:
        """Process quiz submission and return results with detailed feedback"""
        try:
            # Verify user has access to this video
            has_access = await self.video_db.check_video_in_user_library(user_id, submission.video_id)
            if not has_access:
                raise HTTPException(status_code=403, detail="User does not have access to this video")
            
            # Get the original quiz questions for validation
            cached_quiz = await self._get_cached_quiz(submission.video_id)
            if not cached_quiz:
                raise HTTPException(status_code=400, detail="Quiz not found. Please generate a quiz first.")
            
            # Validate submission
            if len(submission.answers) != len(cached_quiz.questions):
                raise HTTPException(status_code=400, detail="Number of answers doesn't match number of questions")
            
            # Calculate score and identify correct answers
            correct_answers = []
            user_answers = []
            score = 0
            
            for i, (answer, question) in enumerate(zip(submission.answers, cached_quiz.questions)):
                if answer.question_index != i:
                    raise HTTPException(status_code=400, detail=f"Answer index mismatch at question {i}")
                
                user_answers.append(answer.selected_answer)
                
                if answer.selected_answer == question.correct_answer:
                    correct_answers.append(i)
                    score += 1
            
            # Calculate time taken (for now, use a placeholder of 5 minutes)
            # TODO: Implement proper timer by storing start time when quiz is generated
            time_taken = 300  # 5 minutes placeholder
            
            # Create quiz result
            quiz_result = QuizResult(
                video_id=submission.video_id,
                score=score,
                total_questions=len(cached_quiz.questions),
                correct_answers=correct_answers,
                user_answers=user_answers,
                submitted_at=datetime.now(),
                time_taken=time_taken
            )
            
            # Save quiz result to user's history
            await self._save_quiz_result(user_id, quiz_result, submission)
            
            # Return result with questions for review
            return QuizResultResponse(
                result=quiz_result,
                questions=cached_quiz.questions
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing quiz submission: {str(e)}")

    async def get_quiz_history(self, user_id: str, video_id: str) -> List[QuizResult]:
        """Get user's quiz attempt history for a specific video"""
        try:
            # Verify user has access to this video
            has_access = await self.video_db.check_video_in_user_library(user_id, video_id)
            if not has_access:
                raise HTTPException(status_code=403, detail="User does not have access to this video")
            
            return await self._get_user_quiz_history(user_id, video_id)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching quiz history: {str(e)}")

    async def get_quiz_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive quiz statistics for a user"""
        try:
            return await self._calculate_user_quiz_statistics(user_id)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error calculating quiz statistics: {str(e)}")

    async def reset_quiz_attempts(self, user_id: str, video_id: str) -> bool:
        """Reset all quiz attempts for a specific video"""
        try:
            # Verify user has access to this video
            has_access = await self.video_db.check_video_in_user_library(user_id, video_id)
            if not has_access:
                raise HTTPException(status_code=403, detail="User does not have access to this video")
            
            return await self._reset_user_quiz_attempts(user_id, video_id)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error resetting quiz attempts: {str(e)}")

    # Private helper methods

    async def _generate_quiz_with_ai(self, video_content: VideoContent, video_title: str, num_questions: int = 5) -> List[QuizQuestion]:
        """Use Gemini AI to generate contextual quiz questions"""
        try:
            prompt = self._build_quiz_generation_prompt(video_content, video_title, num_questions)
            
            # Generate response using Gemini
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
                    detail="Failed to generate quiz - empty AI response"
                )
            
            # Parse AI response into quiz questions
            quiz_questions = self._parse_quiz_response(response.text)
            
            # Validate we got the requested number of questions
            if len(quiz_questions) != num_questions:
                # If we didn't get exactly the right number, truncate or pad
                if len(quiz_questions) > num_questions:
                    quiz_questions = quiz_questions[:num_questions]
                elif len(quiz_questions) < num_questions and len(quiz_questions) > 0:
                    # Use what we got if it's at least some questions
                    pass
                else:
                    raise HTTPException(status_code=500, detail="Failed to generate valid quiz questions")
            
            return quiz_questions
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error in AI quiz generation: {str(e)}")

    def _build_quiz_generation_prompt(self, video_content: VideoContent, video_title: str, num_questions: int) -> str:
        """Build a comprehensive prompt for quiz generation"""
        prompt = f"""
You are an expert educational content creator. Generate a {num_questions}-question multiple-choice quiz based on the following video content.

📹 VIDEO TITLE: {video_title}

📝 VIDEO CONTENT:
Summary: {video_content.summary}

Main Points:
"""
        for i, point in enumerate(video_content.main_points, 1):
            prompt += f"{i}. {point}\n"
        
        prompt += f"""
Key Concepts: {', '.join(video_content.key_concepts)}

Study Guide:
{video_content.study_guide}

Important Vocabulary: {', '.join(video_content.vocabulary)}

🎯 QUIZ GENERATION REQUIREMENTS:
1. Create exactly {num_questions} multiple-choice questions
2. Each question should have 4 options (A, B, C, D)
3. Questions should test different levels of understanding:
   - Factual recall (30%)
   - Conceptual understanding (40%) 
   - Application/analysis (30%)
4. Include a clear explanation for each correct answer
5. Make questions challenging but fair
6. Avoid trick questions or ambiguous wording
7. Ensure options are plausible and roughly equal in length

📋 REQUIRED JSON FORMAT:
Return ONLY a JSON array with this exact structure:
[
  {{
    "question": "Clear, specific question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Detailed explanation of why this answer is correct and why others are wrong."
  }}
]

IMPORTANT: Return ONLY the JSON array, no additional text, formatting, or explanations outside the JSON.
"""
        return prompt

    def _parse_quiz_response(self, ai_response: str) -> List[QuizQuestion]:
        """Parse AI response into QuizQuestion objects"""
        try:
            # Clean the response - remove any markdown formatting or extra text
            cleaned_response = ai_response.strip()
            
            # Remove markdown code blocks if present
            if cleaned_response.startswith('```'):
                lines = cleaned_response.split('\n')
                # Remove first and last lines if they contain ```
                if lines[0].strip().startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].strip().endswith('```'):
                    lines = lines[:-1]
                cleaned_response = '\n'.join(lines)
            
            # Find JSON content (look for array brackets)
            start_idx = cleaned_response.find('[')
            end_idx = cleaned_response.rfind(']') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON array found in AI response")
            
            json_content = cleaned_response[start_idx:end_idx]
            
            # Clean up common JSON issues
            # Remove trailing commas before closing brackets/braces
            import re
            json_content = re.sub(r',(\s*[}\]])', r'\1', json_content)
            
            # Parse JSON
            quiz_data = json.loads(json_content)
            
            if not isinstance(quiz_data, list):
                raise ValueError("AI response is not a JSON array")
            
            quiz_questions = []
            for item in quiz_data:
                # Validate required fields
                required_fields = ['question', 'options', 'correct_answer', 'explanation']
                for field in required_fields:
                    if field not in item:
                        raise ValueError(f"Missing required field: {field}")
                
                # Validate options format
                if not isinstance(item['options'], list) or len(item['options']) < 2:
                    raise ValueError("Each question must have at least 2 options")
                
                # Ensure we have exactly 4 options (pad if necessary)
                while len(item['options']) < 4:
                    item['options'].append(f"Option {len(item['options']) + 1}")
                if len(item['options']) > 4:
                    item['options'] = item['options'][:4]
                
                # Validate correct answer is in options (case insensitive and flexible matching)
                correct_answer = item['correct_answer'].strip()
                options = [opt.strip() for opt in item['options']]
                
                # Try exact match first
                if correct_answer not in options:
                    # Try case insensitive match
                    correct_lower = correct_answer.lower()
                    options_lower = [opt.lower() for opt in options]
                    
                    if correct_lower in options_lower:
                        # Update correct_answer to match the actual option
                        match_index = options_lower.index(correct_lower)
                        item['correct_answer'] = options[match_index]
                    else:
                        # If still no match, use the first option as fallback
                        print(f"Warning: Correct answer '{correct_answer}' not found in options {options}. Using first option as fallback.")
                        item['correct_answer'] = options[0]
                
                quiz_question = QuizQuestion(
                    question=item['question'],
                    options=item['options'],
                    correct_answer=item['correct_answer'],
                    explanation=item['explanation']
                )
                quiz_questions.append(quiz_question)
            
            return quiz_questions
            
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error parsing quiz response: {str(e)}")

    async def _get_cached_quiz(self, video_id: str) -> Optional[QuizResponse]:
        """Get cached quiz from database"""
        try:
            doc_ref = self.video_db.db.collection('videos').document(video_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                cached_quiz_data = data.get('generated_quiz')
                if cached_quiz_data:
                    return QuizResponse(**cached_quiz_data)
            return None
        except Exception:
            return None

    def _is_quiz_fresh(self, quiz: QuizResponse, hours: int = 24) -> bool:
        """Check if cached quiz is still fresh (within specified hours)"""
        try:
            time_diff = datetime.now() - quiz.generated_at
            return time_diff.total_seconds() < (hours * 3600)
        except:
            return False

    async def _cache_quiz(self, quiz: QuizResponse) -> bool:
        """Cache generated quiz in database"""
        try:
            doc_ref = self.video_db.db.collection('videos').document(quiz.video_id)
            
            # Convert to dict for storage
            quiz_data = json.loads(quiz.json())
            
            doc_ref.update({
                'generated_quiz': quiz_data,
                'quiz_metadata': {
                    'generation_count': 1,  # TODO: Implement increment
                    'last_generated': datetime.now()
                }
            })
            return True
        except Exception:
            return False

    async def _save_quiz_result(self, user_id: str, result: QuizResult, submission: QuizSubmission) -> bool:
        """Save quiz result to user's history"""
        try:
            # Create attempt document
            attempt_data = {
                'submission': json.loads(submission.json()),
                'result': json.loads(result.json()),
                'timestamp': datetime.now()
            }
            
            # Save to user's quiz attempts
            doc_ref = (self.video_db.db.collection('users')
                      .document(user_id)
                      .collection('quizzes')
                      .document(result.video_id)
                      .collection('attempts')
                      .document())
            
            doc_ref.set(attempt_data)
            
            # Update quiz statistics
            await self._update_quiz_statistics(user_id, result.video_id, result)
            
            return True
        except Exception:
            return False

    async def _update_quiz_statistics(self, user_id: str, video_id: str, result: QuizResult) -> bool:
        """Update quiz statistics for user and video"""
        try:
            stats_ref = (self.video_db.db.collection('users')
                        .document(user_id)
                        .collection('quizzes')
                        .document(video_id))
            
            # Get current stats or create new
            doc = stats_ref.get()
            if doc.exists:
                current_stats = doc.to_dict().get('statistics', {})
                total_attempts = current_stats.get('total_attempts', 0) + 1
                total_score = current_stats.get('total_score', 0) + result.score
                best_score = max(current_stats.get('best_score', 0), result.score)
                average_score = total_score / total_attempts
            else:
                total_attempts = 1
                total_score = result.score
                best_score = result.score
                average_score = result.score
            
            stats_ref.set({
                'statistics': {
                    'total_attempts': total_attempts,
                    'total_score': total_score,
                    'average_score': average_score,
                    'best_score': best_score,
                    'last_attempt': datetime.now()
                }
            }, merge=True)
            
            return True
        except Exception:
            return False

    async def _get_user_quiz_history(self, user_id: str, video_id: str) -> List[QuizResult]:
        """Get user's quiz attempt history for a specific video"""
        try:
            attempts_ref = (self.video_db.db.collection('users')
                           .document(user_id)
                           .collection('quizzes')
                           .document(video_id)
                           .collection('attempts')
                           .order_by('timestamp', direction='DESCENDING')
                           .limit(10))
            
            docs = attempts_ref.get()
            history = []
            
            for doc in docs:
                data = doc.to_dict()
                result_data = data.get('result', {})
                if result_data:
                    history.append(QuizResult(**result_data))
            
            return history
        except Exception:
            return []

    async def _calculate_user_quiz_statistics(self, user_id: str) -> Dict[str, Any]:
        """Calculate comprehensive quiz statistics for a user"""
        try:
            quizzes_ref = self.video_db.db.collection('users').document(user_id).collection('quizzes')
            docs = quizzes_ref.get()
            
            total_videos = 0
            total_attempts = 0
            total_score = 0
            best_scores = []
            
            for doc in docs:
                data = doc.to_dict()
                stats = data.get('statistics', {})
                if stats:
                    total_videos += 1
                    total_attempts += stats.get('total_attempts', 0)
                    total_score += stats.get('total_score', 0)
                    best_scores.append(stats.get('best_score', 0))
            
            if total_attempts > 0:
                overall_average = total_score / total_attempts
                best_overall = max(best_scores) if best_scores else 0
            else:
                overall_average = 0
                best_overall = 0
            
            return {
                'total_videos_with_quizzes': total_videos,
                'total_quiz_attempts': total_attempts,
                'overall_average_score': round(overall_average, 2),
                'best_overall_score': best_overall,
                'completion_rate': round((total_videos / max(total_attempts, 1)) * 100, 2) if total_attempts > 0 else 0
            }
        except Exception:
            return {
                'total_videos_with_quizzes': 0,
                'total_quiz_attempts': 0,
                'overall_average_score': 0,
                'best_overall_score': 0,
                'completion_rate': 0
            }

    async def _reset_user_quiz_attempts(self, user_id: str, video_id: str) -> bool:
        """Reset all quiz attempts for a specific video"""
        try:
            # Delete all attempts
            attempts_ref = (self.video_db.db.collection('users')
                           .document(user_id)
                           .collection('quizzes')
                           .document(video_id)
                           .collection('attempts'))
            
            docs = attempts_ref.get()
            for doc in docs:
                doc.reference.delete()
            
            # Reset statistics
            stats_ref = (self.video_db.db.collection('users')
                        .document(user_id)
                        .collection('quizzes')
                        .document(video_id))
            
            stats_ref.delete()
            
            return True
        except Exception:
            return False
