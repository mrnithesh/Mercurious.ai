from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from ..models.user import UserCreate, UserResponse, UserLogin, UserUpdate
from ..services.auth_service import AuthService
from ..dependencies import get_current_user, get_firestore_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
auth_service = AuthService()

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    #Register a new user with Firebase Auth
    try:
        user = await auth_service.create_user(user_data)
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    #Verify Firebase token and return user information
    #This endpoint is called by the frontend after Firebase auth
    try:
        # Update last login
        await auth_service.update_last_login(current_user['uid'])
        
        # Get user from Firestore
        user = await auth_service.get_user_by_uid(current_user['uid'])
        
        if not user:
            # If user doesn't exist in Firestore, create it
            user_data = UserCreate(
                name=current_user.get('name', ''),
                email=current_user.get('email', ''),
                password=""  # Password is managed by Firebase
            )
            user = await auth_service.create_user(user_data)
        
        return {
            "success": True,
            "user": user,
            "firebase_user": {
                "uid": current_user['uid'],
                "email": current_user.get('email'),
                "name": current_user.get('name'),
                "email_verified": current_user.get('email_verified', False)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token verification failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    #Get current authenticated user information
    try:
        user = await auth_service.get_user_by_uid(current_user['uid'])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user information: {str(e)}"
        )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate, 
    current_user: dict = Depends(get_current_user)
):
    #Update current authenticated user information
    try:
        updated_user = await auth_service.update_user(current_user['uid'], user_update)
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/me")
async def delete_current_user(current_user: dict = Depends(get_current_user)):
    #Delete current authenticated user account
    try:
        await auth_service.delete_user(current_user['uid'])
        return {"success": True, "message": "User account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

@router.post("/logout")
async def logout_user():
    #Logout endpoint (primarily for frontend to call)
    #Note: Firebase tokens are stateless, so this is mainly for frontend cleanup
    return {"success": True, "message": "Logged out successfully"}

# Health check for auth service
@router.get("/health")
async def auth_health_check():
    #Health check for authentication service
    return {
        "status": "healthy",
        "service": "authentication",
        "firebase": "connected"
    } 