import streamlit as st
from firebase_admin import auth
from firebase_admin import firestore
import datetime
from typing import Optional, Dict, Any

class AuthManager:
    def __init__(self, db):
        self.db = db
        if 'authentication_status' not in st.session_state:
            st.session_state.authentication_status = False
        if 'user' not in st.session_state:
            st.session_state.user = None

    def register_user(self, email: str, password: str, name: str) -> bool:
        """Register a new user."""
        try:
            # Create the user in Firebase Auth
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            
            # Create user document in Firestore
            self.db.collection('users').document(user.uid).set({
                'email': email,
                'name': name,
                'created_at': datetime.datetime.now(),
                'last_login': datetime.datetime.now()
            })
            
            return True
            
        except auth.EmailAlreadyExistsError:
            st.error("Email already registered. Please login instead.")
            return False
        except Exception as e:
            st.error(f"Error creating user: {str(e)}")
            return False

    def login_user(self, email: str, password: str) -> bool:
        """Login a user."""
        try:
            # Get user by email
            user = auth.get_user_by_email(email)
            
            # Update last login
            self.db.collection('users').document(user.uid).update({
                'last_login': datetime.datetime.now()
            })
            
            # Set session state
            st.session_state.authentication_status = True
            st.session_state.user = user
            
            return True
            
        except auth.UserNotFoundError:
            st.error("User not found. Please register first.")
            return False
        except Exception as e:
            st.error(f"Error logging in: {str(e)}")
            return False

    def logout_user(self):
        """Logout the current user."""
        st.session_state.authentication_status = False
        st.session_state.user = None

    def get_current_user(self) -> Optional[Dict[str, Any]]:
        """Get the current user's data."""
        if st.session_state.user:
            user_doc = self.db.collection('users').document(st.session_state.user.uid).get()
            return user_doc.to_dict() if user_doc.exists else None
        return None 