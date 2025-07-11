from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from firebase_admin import auth
from google.cloud.firestore import Client as FirestoreClient
from ..config.firebase_config import firebase_config
from ..models.user import UserCreate, UserResponse, UserLogin, UserUpdate

class AuthService:
    def __init__(self):
        self.auth = firebase_config.get_auth()
        self.db = firebase_config.get_firestore()
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """
        Create a new user with Firebase Auth and store additional data in Firestore
        """
        try:
            # Create user in Firebase Auth
            firebase_user = self.auth.create_user(
                email=user_data.email,
                password=user_data.password,
                display_name=user_data.name
            )
            
            # Create user document in Firestore
            user_doc_data = {
                'name': user_data.name,
                'email': user_data.email,
                'created_at': datetime.utcnow(),
                'last_login': datetime.utcnow(),
                'settings': {
                    'theme': 'light',
                    'notifications': True,
                    'auto_save': True
                }
            }
            
            # Store in Firestore
            self.db.collection('users').document(firebase_user.uid).set(user_doc_data)
            
            return UserResponse(
                id=firebase_user.uid,
                name=user_data.name,
                email=user_data.email,
                created_at=user_doc_data['created_at'],
                last_login=user_doc_data['last_login']
            )
            
        except auth.EmailAlreadyExistsError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {str(e)}"
            )
    
    async def get_user_by_uid(self, uid: str) -> Optional[UserResponse]:
        """
        Get user data by Firebase UID
        """
        try:
            # Get user from Firestore
            user_doc = self.db.collection('users').document(uid).get()
            
            if not user_doc.exists:
                return None
            
            user_data = user_doc.to_dict()
            return UserResponse(
                id=uid,
                name=user_data.get('name', ''),
                email=user_data.get('email', ''),
                created_at=user_data.get('created_at', datetime.utcnow()),
                last_login=user_data.get('last_login', datetime.utcnow())
            )
            
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    async def update_user(self, uid: str, user_update: UserUpdate) -> UserResponse:
        """
        Update user information
        """
        try:
            update_data = {}
            
            # Update Firebase Auth user
            firebase_update = {}
            if user_update.name:
                firebase_update['display_name'] = user_update.name
                update_data['name'] = user_update.name
                
            if user_update.email:
                firebase_update['email'] = user_update.email
                update_data['email'] = user_update.email
            
            if firebase_update:
                self.auth.update_user(uid, **firebase_update)
            
            # Update Firestore document
            if update_data:
                self.db.collection('users').document(uid).update(update_data)
            
            # Return updated user
            return await self.get_user_by_uid(uid)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update user: {str(e)}"
            )
    
    async def update_last_login(self, uid: str):
        """
        Update user's last login timestamp
        """
        try:
            self.db.collection('users').document(uid).update({
                'last_login': datetime.utcnow()
            })
        except Exception as e:
            print(f"Error updating last login: {e}")
    
    async def delete_user(self, uid: str):
        """
        Delete user from Firebase Auth and Firestore
        """
        try:
            # Delete from Firebase Auth
            self.auth.delete_user(uid)
            
            # Delete from Firestore
            self.db.collection('users').document(uid).delete()
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete user: {str(e)}"
            ) 