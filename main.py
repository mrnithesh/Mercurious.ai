import streamlit as st
from interfaces.streamlit_ui import StreamlitInterface
from dotenv import load_dotenv
import os

def main():
    # Load environment variables
    load_dotenv()
    
    # Check for required environment variables
    if not os.getenv("GEMINI_API_KEY"):
        st.error("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")
        st.stop()
    
    # Initialize and run the interface
    interface = StreamlitInterface()
    interface.run()

if __name__ == "__main__":
    main() 