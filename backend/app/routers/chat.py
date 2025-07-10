from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from ..models.chat import ChatRequest, ChatResponse, ChatHistory, ChatClearRequest
from ..services.chat_service import ChatService


app = APIRouter()
chat_service = ChatService()

# In-memory store for video contexts (in production, use a database)
video_contexts: Dict[str, Dict[str, Any]] = {}


@app.post("/api/chat/send", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    # Send a message to the chat assistant
    try:
        # Get video context if available
        video_context = video_contexts.get(request.video_id)
        
        response = await chat_service.send_message(request, video_context)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chat/history/{video_id}", response_model=ChatHistory)
async def get_chat_history(video_id: str):
    # Get chat history for a specific video
    try:
        history = await chat_service.get_chat_history(video_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/clear")
async def clear_chat_history(request: ChatClearRequest):
    # Clear chat history for a specific video
    try:
        success = await chat_service.clear_chat_history(request.video_id)
        return {"success": success, "message": "Chat history cleared" if success else "No history found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/context/{video_id}")
async def set_video_context(video_id: str, context: Dict[str, Any]):
    # Set video context for better chat responses
    try:
        video_contexts[video_id] = context
        return {"success": True, "message": "Video context set successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chat/context/{video_id}")
async def get_video_context(video_id: str):
    # Get video context for a specific video
    try:
        context = video_contexts.get(video_id, {})
        return {"video_id": video_id, "context": context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 