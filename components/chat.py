import streamlit as st
from google.generativeai import GenerativeModel
import time
from datetime import datetime
from typing import Dict, List, Optional
import json

class Chat:
    def __init__(self, api_key: str):
        """Initialize chat with Gemini Pro model."""
        self.api_key = api_key
        self.model = GenerativeModel('gemini-pro')
        self.chat_history = []
        self.initialize_session_state()

    def initialize_session_state(self):
        """Initialize or reset session state variables."""
        if 'messages' not in st.session_state:
            st.session_state.messages = []
        if 'chat_context' not in st.session_state:
            st.session_state.chat_context = None

    def set_context(self, video_data: Dict):
        """Set the context for the chat based on video data."""
        context = f"""Video Title: {video_data.get('title', 'Unknown')}
        Description: {video_data.get('description', 'No description available')}
        Topic: {video_data.get('topic', 'General')}
        Key Points: {', '.join(video_data.get('key_points', ['No key points available']))}
        """
        st.session_state.chat_context = context
        return context

    def process_message(self, user_input: str, context: List[Dict] = None) -> str:
        """Process user message and generate response."""
        try:
            # Create chat context
            video_context = st.session_state.chat_context or "You are a helpful AI assistant."
            
            # Prepare chat history for context
            history_context = "\n".join([
                f"User: {msg['content']}" if msg['role'] == 'user' else f"Assistant: {msg['content']}"
                for msg in (context or [])[-5:]  # Include last 5 messages for context
            ])

            # Combine context, history, and current input
            full_prompt = f"{video_context}\n\nChat History:\n{history_context}\n\nUser: {user_input}\nAssistant:"

            # Add rate limiting
            current_time = time.time()
            if hasattr(self, 'last_api_call'):
                time_since_last_call = current_time - self.last_api_call
                if time_since_last_call < 1:  # 1 second minimum delay
                    time.sleep(1 - time_since_last_call)
            
            # Generate response
            chat = self.model.start_chat(history=[])
            response = chat.send_message(full_prompt)
            self.last_api_call = time.time()
            
            if response and response.text:
                return response.text
            else:
                return "I apologize, but I couldn't generate a response. Please try asking your question differently."

        except Exception as e:
            if "ResourceExhausted" in str(e):
                st.warning("API quota reached. Please wait a moment before trying again.")
                time.sleep(2)  # Wait for 2 seconds before allowing next request
                return "I'm currently experiencing high traffic. Please try your question again in a moment."
            else:
                st.error(f"Error generating response: {str(e)}")
                return "I encountered an error while processing your request. Please try again."

    def add_message(self, role: str, content: str):
        """Add a message to the chat history."""
        timestamp = datetime.now().strftime("%H:%M")
        message = {
            "role": role,
            "content": content,
            "timestamp": timestamp
        }
        st.session_state.messages.append(message)

    def clear_chat(self):
        """Clear the chat history."""
        st.session_state.messages = []

    def display_chat_interface(self, video_data: Optional[Dict] = None):
        """Display the chat interface with styling."""
        # Add custom CSS
        st.markdown("""
            <style>
                /* Chat container */
                .chat-container {
                    background: linear-gradient(180deg, rgba(74, 144, 226, 0.05) 0%, rgba(74, 144, 226, 0.02) 100%);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border: 1px solid rgba(74, 144, 226, 0.1);
                }

                /* Message styles */
                .message {
                    padding: 1rem;
                    border-radius: 12px;
                    margin: 0.5rem 0;
                    max-width: 80%;
                    position: relative;
                }

                .message.user {
                    background: rgba(74, 144, 226, 0.1);
                    margin-left: auto;
                    border-bottom-right-radius: 4px;
                }

                .message.assistant {
                    background: rgba(69, 183, 209, 0.1);
                    margin-right: auto;
                    border-bottom-left-radius: 4px;
                }
            </style>
        """, unsafe_allow_html=True)

        # Set video context if provided
        if video_data:
            self.set_context(video_data)

        # Display chat header
        st.subheader("💬 Chat Assistant")

        # Display chat messages
        for message in st.session_state.messages:
            with st.container():
                if message["role"] == "user":
                    st.markdown(f"<div class='message user'>You: {message['content']}<br><small>{message['timestamp']}</small></div>", unsafe_allow_html=True)
                else:
                    st.markdown(f"<div class='message assistant'>Assistant: {message['content']}<br><small>{message['timestamp']}</small></div>", unsafe_allow_html=True)

        # Chat input
        with st.container():
            col1, col2 = st.columns([6, 1])
            with col1:
                user_input = st.text_input("Type your message...", key="chat_input", placeholder="Ask me anything about the video...")
            with col2:
                clear_button = st.button("Clear", key="clear_chat")

            if clear_button:
                self.clear_chat()
                st.rerun()

            if user_input:
                # Add user message
                self.add_message("user", user_input)
                
                # Show typing indicator
                with st.spinner("Thinking..."):
                    # Generate and add assistant response
                    response = self.process_message(user_input, st.session_state.messages)
                    self.add_message("assistant", response)
                
                # Clear input and rerun to update chat
                st.session_state.chat_input = ""
                st.rerun()

    def get_chat_history(self) -> List[Dict]:
        """Return the chat history."""
        return st.session_state.messages