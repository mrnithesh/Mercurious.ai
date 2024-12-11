import streamlit as st
from interfaces.streamlit_ui import StreamlitInterface
from firebase_config import initialize_firebase
from components.auth_manager import AuthManager
from components.data_manager import DataManager

def main():
    # Initialize Firebase
    db = initialize_firebase()
    
    # Initialize managers
    auth_manager = AuthManager(db)
    data_manager = DataManager(db)
    
    # Initialize interface
    interface = StreamlitInterface(auth_manager=auth_manager, data_manager=data_manager)
    
    # Check authentication status
    if not st.session_state.authentication_status:
        interface.render_login()
    else:
        interface.run()

if __name__ == "__main__":
    main() 