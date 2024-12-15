import streamlit as st
import time
from datetime import datetime
from typing import Dict, List, Optional
import google.generativeai as genai

class Chat:
    def __init__(self, api_key: str = None):
        """Initialize chat with API key."""
        if not api_key:
            raise ValueError("API key is required for chat functionality")
            
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.chat = self.model.start_chat(history=[])
        self.last_api_call = time.time()
        self.min_delay = 1  # Minimum delay between API calls
        self.max_retries = 3
        self.retry_delay = 2
        self.initialize_session_state()
        self._setup_chat_styling()

    def initialize_session_state(self):
        """Initialize session state variables."""
        if "messages" not in st.session_state:
            st.session_state.messages = []
        if "chat_history" not in st.session_state:
            st.session_state.chat_history = []
        if "error_count" not in st.session_state:
            st.session_state.error_count = 0

    def _setup_chat_styling(self):
        """Setup custom CSS for chat interface."""
        st.markdown("""
            <style>
                .chat-message {
                    padding: 1rem;
                    border-radius: 12px;
                    margin: 0.5rem 0;
                    max-width: 80%;
                    position: relative;
                }

                .user-message {
                    background: rgba(74, 144, 226, 0.1);
                    margin-left: auto;
                    border-bottom-right-radius: 4px;
                }

                .assistant-message {
                    background: rgba(69, 183, 209, 0.1);
                    margin-right: auto;
                    border-bottom-left-radius: 4px;
                }

                .message-timestamp {
                    font-size: 0.8em;
                    color: rgba(0, 0, 0, 0.5);
                    margin-top: 0.25rem;
                }
            </style>
        """, unsafe_allow_html=True)

    def _make_api_call(self, prompt: str, retry_count: int = 0) -> Optional[str]:
        """Make an API call with rate limiting and retries."""
        try:
            current_time = time.time()
            time_since_last_call = current_time - self.last_api_call
            if time_since_last_call < self.min_delay:
                time.sleep(self.min_delay - time_since_last_call)

            response = self.chat.send_message(prompt)
            self.last_api_call = time.time()
            st.session_state.error_count = 0

            if response and response.text:
                return response.text.strip()

        except Exception as e:
            st.session_state.error_count += 1
            if retry_count < self.max_retries:
                time.sleep(self.retry_delay * (retry_count + 1))
                return self._make_api_call(prompt, retry_count + 1)
            st.error(f"❌ Error in API call: {str(e)}")
            return None

    def process_message(self, message: str) -> str:
        """Process a message and generate a response."""
        try:
            # Validate video selection and processing
            if "processed_videos" not in st.session_state or not st.session_state.processed_videos:
                return "⚠️ Please process a video first before asking questions."

            if "current_video" not in st.session_state or not st.session_state.current_video:
                return "⚠️ Please select a video to discuss."

            # Get current video data
            video_data = st.session_state.processed_videos.get(st.session_state.current_video)
            if not video_data or not video_data.get('content'):
                return "⚠️ Video content not found. Please try processing the video again."

            # Check error count
            if st.session_state.error_count >= 5:
                return "⚠️ Too many errors occurred. Please try again later."

            # Create context from video data
            video_context = f"""
            VIDEO CONTENT:
            Title: {video_data.get('info', {}).get('title', 'Unknown Title')}
            
            Summary:
            {video_data.get('content', {}).get('summary', '')}
            
            Key Points:
            {' '.join(['• ' + point for point in video_data.get('content', {}).get('key_points', [])])}
            
            Study Guide:
            {video_data.get('content', {}).get('study_guide', '')}
            """

            # Create prompt with context and chat history
            chat_history = "\n".join([
                f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
                for msg in st.session_state.chat_history[-5:]  # Last 5 messages for context
            ])

            prompt = f"""You are a helpful AI assistant analyzing video content. Answer the following question 
            based on the video content and chat history provided. Be specific and reference the video content 
            when possible.

            QUESTION: {message}

            CHAT HISTORY:
            {chat_history}

            VIDEO CONTEXT:
            {video_context}

            Please provide a clear, accurate response that directly addresses the question using information 
            from the video. If the answer cannot be found in the video content, clearly state that."""

            # Generate response
            response = self._make_api_call(prompt)
            if not response:
                return "😔 I apologize, but I encountered an error. Please try again."

            # Update chat history
            timestamp = datetime.now().strftime("%I:%M %p")
            new_messages = [
                {"role": "user", "content": message, "timestamp": timestamp},
                {"role": "assistant", "content": response, "timestamp": timestamp}
            ]
            
            st.session_state.messages.extend(new_messages)
            st.session_state.chat_history.extend(new_messages)
            
            return response

        except Exception as e:
            st.error(f"❌ Error processing message: {str(e)}")
            return "😔 I encountered an error while processing your message. Please try again."

    def display_chat_interface(self):
        """Display the chat interface."""
        st.markdown("### 💬 Chat Assistant")
        
        # Display chat messages
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(
                    f'<div class="chat-message {"user-message" if message["role"] == "user" else "assistant-message"}">'
                    f'{message["content"]}<br>'
                    f'<div class="message-timestamp">{message["timestamp"]}</div>'
                    f'</div>',
                    unsafe_allow_html=True
                )

        # Chat input
        if prompt := st.chat_input("Ask about the video..."):
            # Add and display user message
            with st.chat_message("user"):
                st.markdown(
                    f'<div class="chat-message user-message">{prompt}</div>', 
                    unsafe_allow_html=True
                )

            # Generate and display assistant response
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    response = self.process_message(prompt)
                    st.markdown(
                        f'<div class="chat-message assistant-message">{response}</div>', 
                        unsafe_allow_html=True
                    )

        # Clear chat button
        if st.session_state.messages:
            if st.button("🗑️ Clear Chat"):
                st.session_state.messages = []
                st.session_state.chat_history = []
                st.session_state.error_count = 0
                self.chat = self.model.start_chat(history=[])  # Reset chat
                st.rerun()

    def get_chat_history(self) -> List[Dict]:
        """Return the chat history."""
        return st.session_state.chat_history