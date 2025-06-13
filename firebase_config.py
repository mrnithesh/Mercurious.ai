import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
from config import FIREBASE_CONFIG
import json

def initialize_firebase():
    """Initialize Firebase Admin SDK and return Firestore client."""
    if not firebase_admin._apps:
        try:
            creds_json_str = FIREBASE_CONFIG["credentials"]
            if not creds_json_str:
                raise ValueError("Missing Firebase credentials in environment variable.")
            
            cred_dict = json.loads(creds_json_str)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred, {
                'projectId': FIREBASE_CONFIG["project_id"],
                'storageBucket': FIREBASE_CONFIG["storage_bucket"],
                'databaseURL': f'https://{FIREBASE_CONFIG["project_id"]}.firebaseio.com'
            })
        except Exception as e:
            raise Exception(f"Failed to initialize Firebase: {str(e)}")
    
    try:
        db = firestore.client()
        # Test the connection
        db.collection('users').limit(1).get()
        return db
    except Exception as e:
        raise Exception(f"Failed to connect to Firestore: {str(e)}") 