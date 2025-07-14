from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List
from ..models.chat import ChatRequest, ChatResponse, ChatHistory, ChatMessage
from ..services.chat_service import ChatService
from ..services.video_database_service import VideoDatabase
from ..dependencies import get_current_user

app = APIRouter()
chat_service = ChatService()
video_db = VideoDatabase()

@app.post("/api/chat/send", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Send a message to the chat assistant with persistent history"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        # Check if user has this video in their library
        video_exists = await video_db.check_video_in_user_library(user_id, request.video_id)
        if not video_exists:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        # Get video context from global collection
        global_video = await video_db.get_global_video(request.video_id)
        if not global_video:
            raise HTTPException(status_code=404, detail="Video content not found")
        
        # Convert to context format for chat service
        video_context = {
            "video_id": request.video_id,
            "title": global_video.info.title,
            "author": global_video.info.author,
            "transcript": global_video.content.transcript,
            "summary": global_video.content.summary,
            "main_points": global_video.content.main_points,
            "key_concepts": global_video.content.key_concepts,
            "study_guide": global_video.content.study_guide,
            "analysis": global_video.content.analysis,
            "vocabulary": global_video.content.vocabulary
        }
        
        # Get chat history from Firestore
        chat_history = await video_db.get_chat_history(user_id, request.video_id)
        
        # Send message using chat service
        response = await chat_service.send_message(request, video_context, chat_history)
        
        # Save user message to Firestore
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": response.timestamp.isoformat()
        }
        await video_db.save_chat_message(user_id, request.video_id, user_message)
        
        # Save AI response to Firestore
        ai_message = {
            "role": "assistant",
            "content": response.response,
            "timestamp": response.timestamp.isoformat()
        }
        await video_db.save_chat_message(user_id, request.video_id, ai_message)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history/{video_id}")
async def get_chat_history(video_id: str, current_user: dict = Depends(get_current_user)):
    """Get chat history for a specific video"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        # Check if user has this video in their library
        video_exists = await video_db.check_video_in_user_library(user_id, video_id)
        if not video_exists:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        # Get chat history from Firestore
        chat_history = await video_db.get_chat_history(user_id, video_id)
        
        return {
            "video_id": video_id,
            "messages": chat_history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chat/history/{video_id}")
async def clear_chat_history(video_id: str, current_user: dict = Depends(get_current_user)):
    """Clear chat history for a specific video"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        # Check if user has this video in their library
        video_exists = await video_db.check_video_in_user_library(user_id, video_id)
        if not video_exists:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        # Clear chat history in Firestore
        success = await video_db.clear_chat_history(user_id, video_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to clear chat history")
        
        return {"message": "Chat history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/stats/{video_id}")
async def get_chat_stats(video_id: str, current_user: dict = Depends(get_current_user)):
    """Get chat statistics for a specific video"""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        
        # Check if user has this video in their library
        video_exists = await video_db.check_video_in_user_library(user_id, video_id)
        if not video_exists:
            raise HTTPException(status_code=404, detail="Video not found in user's library")
        
        # Get chat history from Firestore
        chat_history = await video_db.get_chat_history(user_id, video_id)
        
        # Calculate stats
        total_messages = len(chat_history)
        user_messages = sum(1 for msg in chat_history if msg.get("role") == "user")
        ai_messages = sum(1 for msg in chat_history if msg.get("role") == "assistant")
        
        return {
            "video_id": video_id,
            "total_messages": total_messages,
            "user_messages": user_messages,
            "ai_messages": ai_messages,
            "has_history": total_messages > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 