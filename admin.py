import streamlit as st
from admin.dashboard import AdminDashboard
from firebase_config import initialize_firebase

def main():
    # Initialize Firebase
    db = initialize_firebase()
    
    # Initialize admin dashboard
    dashboard = AdminDashboard(db)
    
    # Run dashboard
    dashboard.run()

if __name__ == "__main__":
    main() 