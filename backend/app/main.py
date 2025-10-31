import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import videos_router, chat_router, quiz_router
from .routers.auth import router as auth_router


app = FastAPI(
    title="Mercurious AI API",
    description="AI-Powered Video Learning Assistant API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend
# Allow frontend URLs from environment variable, fallback to "*" for development
# Supports multiple URLs separated by commas
frontend_urls = os.getenv("FRONTEND_URL", "*")

if frontend_urls == "*":
    allow_origins = ["*"]
else:
    # Split by comma to support multiple URLs
    # Also strip whitespace from each URL
    allow_origins = [url.strip() for url in frontend_urls.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(videos_router)
app.include_router(chat_router)
app.include_router(quiz_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Mercurious AI API", 
        "version": "1.0.0",
        "docs": "/docs"
    }

#health check
@app.get("/api/health")
async def health():

    return {
        "status": "healthy",
        "service": "mercurious_ai_api", 
        "message": "API is running successfully"
    }