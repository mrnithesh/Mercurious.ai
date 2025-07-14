import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from typing import Optional
import json

class FirebaseConfig:
    def __init__(self):
        self.app: Optional[firebase_admin.App] = None
        self.db: Optional[firestore.Client] = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
            else:
                # Initialize from service account key
                service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
                if service_account_path and os.path.exists(service_account_path):
                    cred = credentials.Certificate(service_account_path)
                    self.app = firebase_admin.initialize_app(cred)
                else:
                    # Initialize from environment variables (for deployment)
                    service_account_info = {
                        "type": "service_account",
                        "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                        "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                        "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                        "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                        "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    }
                    
                    # Remove None values
                    service_account_info = {k: v for k, v in service_account_info.items() if v is not None}
                    
                    if service_account_info.get('project_id'):
                        cred = credentials.Certificate(service_account_info)
                        self.app = firebase_admin.initialize_app(cred)
                    else:
                        raise ValueError("Firebase credentials not properly configured")
            
            # Initialize Firestore
            self.db = firestore.client()
            print("Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            raise e
    
    def get_auth(self):
        """Get Firebase Auth instance"""
        return auth
    
    def get_firestore(self):
        """Get Firestore client"""
        return self.db
    
    def verify_token(self, id_token: str):
        """Verify Firebase ID token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None

# Global Firebase instance
firebase_config = FirebaseConfig() 