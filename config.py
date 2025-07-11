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
    "name": "Mercurious.ai - AI Learning Assistant",
    "version": "1.0.0",
    "description": "An AI-powered learning assistant for video content",
    "author": "Nithesh",
}

# Model Configuration
MODEL_CONFIG = {
    "gemini_model": "gemini-2.0-flash",
    "temperature": 0.7,
    "max_output_tokens": 2048,
}

# UI Configuration
UI_CONFIG = {
    "theme": "light",
    "layout": "wide",
    "initial_sidebar_state": "expanded",
}

# Firebase Configuration
FIREBASE_CONFIG = {
    "api_key": os.getenv("FIREBASE_API_KEY"),
    "auth_domain": os.getenv("FIREBASE_AUTH_DOMAIN"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "storage_bucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
    #"credentials_path": ROOT_DIR / "config" / "firebase-credentials.json"  #credential path
    "credentials": os.getenv("FIREBASE_CREDENTIALS") #for deployment
}

# Validate Firebase configuration
required_firebase_vars = ["FIREBASE_API_KEY", "FIREBASE_AUTH_DOMAIN", "FIREBASE_PROJECT_ID"]
missing_vars = [var for var in required_firebase_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing Firebase environment variables: {', '.join(missing_vars)}") 