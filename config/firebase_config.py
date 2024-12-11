import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
from config import FIREBASE_CONFIG

def initialize_firebase():
    """Initialize Firebase Admin SDK and return Firestore client."""
    if not firebase_admin._apps:
        cred = credentials.Certificate(str(FIREBASE_CONFIG["credentials_path"]))
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

# Initialize Firestore DB
db = initialize_firebase() 