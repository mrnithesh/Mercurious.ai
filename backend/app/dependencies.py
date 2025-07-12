from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from .config.firebase_config import firebase_config
from .models.user import UserResponse

# Security scheme for Bearer token
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    #Dependency to get current authenticated user from Firebase token
    try:
        # Extract token from Authorization header
        token = credentials.credentials
        
        # Verify Firebase token
        decoded_token = firebase_config.verify_token(token)
        if not decoded_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return decoded_token
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[dict]:
    #Optional dependency to get current user (for endpoints that work with or without auth)
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        decoded_token = firebase_config.verify_token(token)
        return decoded_token
    except:
        return None

def get_firestore_db():
    #Dependency to get Firestore database instance
    return firebase_config.get_firestore() 