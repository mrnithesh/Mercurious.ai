import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

# Base paths
ROOT_DIR = Path(__file__).parent.parent
DATA_DIR = ROOT_DIR / "data"
MODELS_DIR = ROOT_DIR / "models"

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please check your .env file")

# App Configuration
APP_CONFIG = {
    "name": "AI Learning Assistant",
    "version": "1.0.0",
    "description": "An AI-powered learning assistant for video content",
    "author": "Your Name",
}

# Model Configuration
MODEL_CONFIG = {
    "gemini_model": "gemini-1.5-pro",
    "temperature": 0.7,
    "max_output_tokens": 1024,
}

# UI Configuration
UI_CONFIG = {
    "theme": "light",
    "layout": "wide",
    "initial_sidebar_state": "expanded",
} 