import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
from config import FIREBASE_CONFIG
import json

def initialize_firebase():
    """Initialize Firebase Admin SDK and return Firestore client."""
    if not firebase_admin._apps:
        creds_json_str = FIREBASE_CONFIG["credentials"]
        if not creds_json_str:
            raise ValueError("Missing Firebase credentials in environment variable.")
        
        cred_dict = json.loads(creds_json_str)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

# Initialize Firestore DB
db = initialize_firebase() 