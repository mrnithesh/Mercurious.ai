import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
from config import FIREBASE_CONFIG

def initialize_firebase():
    """Initialize Firebase Admin SDK and return Firestore client."""
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(str(FIREBASE_CONFIG["credentials_path"]))
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