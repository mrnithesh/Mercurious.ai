from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from ..models.quiz import (
    QuizGenerateRequest, QuizResponse, QuizSubmission, 
    QuizResult, QuizResultResponse
)
from ..services.quiz_service import QuizService
from ..dependencies import get_current_user

app = APIRouter()

# Initialize quiz service with error handling
quiz_service = None
try:
    quiz_service = QuizService()
    print("QuizService initialized successfully")
except Exception as e:
    print(f"Error initializing QuizService: {e}")
    # Don't fail the entire router if QuizService fails to initialize

# Test endpoint to verify router is working
@app.get("/api/quiz/health")
async def quiz_health():
    """Health check for quiz service"""
    return {
        "status": "ok",
        "service": "quiz_router",
        "quiz_service_available": quiz_service is not None
    }

@app.post("/api/quiz/generate", response_model=QuizResponse)
async def generate_quiz(
    request: QuizGenerateRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Generate AI-powered quiz for a video"""
    try:
        if quiz_service is None:
            raise HTTPException(status_code=500, detail="Quiz service is not available")
            
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        # Validate request
        if request.num_questions < 1 or request.num_questions > 20:
            raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 20")
        
        quiz_response = await quiz_service.generate_quiz(request, user_id)
        return quiz_response
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Quiz generation error: {str(e)}")
        print(f"Full traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@app.post("/api/quiz/submit", response_model=QuizResultResponse)
async def submit_quiz(
    submission: QuizSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit quiz answers and get results with detailed feedback"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        # Validate submission
        if not submission.answers:
            raise HTTPException(status_code=400, detail="No answers provided")
        
        result_response = await quiz_service.submit_quiz(submission, user_id)
        return result_response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing quiz submission: {str(e)}")

@app.get("/api/quiz/history/{video_id}", response_model=List[QuizResult])
async def get_quiz_history(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get user's quiz attempt history for a specific video"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        if not video_id or not video_id.strip():
            raise HTTPException(status_code=400, detail="Video ID is required")
        
        history = await quiz_service.get_quiz_history(user_id, video_id)
        return history
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quiz history: {str(e)}")

@app.get("/api/quiz/statistics", response_model=Dict[str, Any])
async def get_quiz_statistics(
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive quiz statistics for the current user"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        statistics = await quiz_service.get_quiz_statistics(user_id)
        return statistics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating quiz statistics: {str(e)}")

@app.delete("/api/quiz/reset/{video_id}")
async def reset_quiz_attempts(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Reset all quiz attempts for a specific video"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        if not video_id or not video_id.strip():
            raise HTTPException(status_code=400, detail="Video ID is required")
        
        success = await quiz_service.reset_quiz_attempts(user_id, video_id)
        
        if success:
            return {"message": "Quiz attempts reset successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to reset quiz attempts")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting quiz attempts: {str(e)}")

@app.get("/api/quiz/check/{video_id}")
async def check_quiz_availability(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if a quiz is available or cached for a video"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        if not video_id or not video_id.strip():
            raise HTTPException(status_code=400, detail="Video ID is required")
        
        # Check if user has access to the video
        from ..services.video_database_service import VideoDatabase
        video_db = VideoDatabase()
        has_access = await video_db.check_video_in_user_library(user_id, video_id)
        
        if not has_access:
            raise HTTPException(status_code=403, detail="User does not have access to this video")
        
        # Check if quiz exists and is cached
        cached_quiz = await quiz_service._get_cached_quiz(video_id)
        is_available = cached_quiz is not None
        is_fresh = quiz_service._is_quiz_fresh(cached_quiz) if cached_quiz else False
        
        return {
            "video_id": video_id,
            "quiz_available": is_available,
            "quiz_fresh": is_fresh,
            "generated_at": cached_quiz.generated_at.isoformat() if cached_quiz else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking quiz availability: {str(e)}")

# Additional endpoint for getting quiz without generating (if cached)
@app.get("/api/quiz/{video_id}", response_model=QuizResponse)
async def get_quiz(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get existing quiz for a video (must be already generated)"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        if not video_id or not video_id.strip():
            raise HTTPException(status_code=400, detail="Video ID is required")
        
        # Check if user has access to the video
        from ..services.video_database_service import VideoDatabase
        video_db = VideoDatabase()
        has_access = await video_db.check_video_in_user_library(user_id, video_id)
        
        if not has_access:
            raise HTTPException(status_code=403, detail="User does not have access to this video")
        
        # Get cached quiz
        cached_quiz = await quiz_service._get_cached_quiz(video_id)
        
        if not cached_quiz:
            raise HTTPException(status_code=404, detail="Quiz not found. Please generate a quiz first.")
        
        return cached_quiz
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quiz: {str(e)}")
