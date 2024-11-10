from pathlib import Path
import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables at package initialization
env_path = find_dotenv()
if env_path:
    load_dotenv(env_path)
else:
    print("Warning: .env file not found")

# Package metadata
__version__ = "1.0.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"

# Ensure required directories exist
ROOT_DIR = Path(__file__).parent.parent
DATA_DIR = ROOT_DIR / "data"
MODELS_DIR = ROOT_DIR / "models"

for directory in [DATA_DIR, MODELS_DIR]:
    directory.mkdir(exist_ok=True) 