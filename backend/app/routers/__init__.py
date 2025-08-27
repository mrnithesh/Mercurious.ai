from .videos import app as videos_router
from .chat import app as chat_router
from .quiz import app as quiz_router

__all__ = ["videos_router", "chat_router", "quiz_router"]