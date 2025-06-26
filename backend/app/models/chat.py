from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str  
    content: str
    timestamp: datetime

class ChatRequest(BaseModel):
    message: str
    video_id: str

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

class ChatHistory(BaseModel):
    video_id: str
    messages: List[ChatMessage]

class ChatClearRequest(BaseModel):
    video_id: str