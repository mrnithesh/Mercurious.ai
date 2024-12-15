import streamlit as st
import google.generativeai as genai
from typing import List, Dict, Optional
from config import GEMINI_API_KEY, MODEL_CONFIG
import time
from datetime import datetime

class ChatEngine:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
        self.history = []
        self._initialize_session_state()

    def _initialize_session_state(self):
        """Initialize session state for chat history."""
        if "chat_history" not in st.session_state:
            st.session_state.chat_history = []
        if "context" not in st.session_state:
            st.session_state.context = None

    def set_context(self, video_data: Dict):
        """Set video context for the chat."""
        if video_data and 'content' in video_data:
            context = f"""
            Video Title: {video_data.get('title', '')}
            
            Transcript:
            {video_data.get('content', {}).get('transcript', '')}
            
            Summary:
            {video_data.get('content', {}).get('summary', '')}
            
            Key Points:
            {', '.join(video_data.get('content', {}).get('key_points', []))}
            """
            st.session_state.context = context
            # Add system message to chat history
            self._add_message("system", "Context updated with new video content.")

    def _add_message(self, role: str, content: str):
        """Add a message to the chat history."""
        st.session_state.chat_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().strftime("%H:%M")
        })

    def _build_prompt(self, query: str) -> str:
        """Build context-aware prompt for the AI."""
        if st.session_state.context:
            return f"""As an AI learning assistant, help the user understand the video content. 
            Use this context to provide accurate, relevant answers:
            
            {st.session_state.context}
            
            User Question: {query}
            
            Remember to:
            1. Be specific and reference the video content
            2. Explain concepts clearly
            3. Provide examples when helpful
            4. Admit if something isn't covered in the video
            """
        return query

    def process_message(self, user_input: str) -> Optional[str]:
        """Process user message and generate AI response."""
        try:
            # Add user message to history
            self._add_message("user", user_input)
            
            # Build context-aware prompt
            prompt = self._build_prompt(user_input)
            
            # Get AI response
            with st.spinner("Thinking..."):
                response = self.model.send_message(prompt)
                ai_response = response.text
            
            # Add AI response to history
            self._add_message("assistant", ai_response)
            
            return ai_response
            
        except Exception as e:
            error_msg = f"Error processing message: {str(e)}"
            st.error(error_msg)
            self._add_message("system", error_msg)
            return None

    def display_chat_interface(self, video_data):
        st.markdown("""
            <style>
                .chat-container {
                    background: rgba(255, 75, 75, 0.03);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin: 1rem 0;
                }
                .chat-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .chat-header img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 1rem;
                }
                .message-time {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 0.25rem;
                }
                .typing-indicator {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border-radius: 8px;
                    background: rgba(255, 75, 75, 0.1);
                    width: fit-content;
                }
                .typing-dot {
                    width: 8px;
                    height: 8px;
                    background: #FF4B4B;
                    border-radius: 50%;
                    animation: typing 1s infinite;
                }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typing {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            </style>
        """, unsafe_allow_html=True)
        
        # Chat container
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)
        
        # Chat header
        st.markdown('''
            <div class="chat-header">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant" alt="AI Assistant"/>
                <h3>AI Learning Assistant</h3>
            </div>
        ''', unsafe_allow_html=True)
        
        # Display chat messages
        for message in st.session_state.chat_history:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
                st.markdown(f'<div class="message-time">{message["timestamp"]}</div>', 
                          unsafe_allow_html=True)
        
        # Chat input
        if prompt := st.chat_input("Ask me anything about the video..."):
            # User message
            with st.chat_message("user"):
                st.markdown(prompt)
                st.markdown(f'<div class="message-time">{datetime.now().strftime("%I:%M %p")}</div>', 
                          unsafe_allow_html=True)
            self._add_message("user", prompt)
            
            # Show typing indicator
            with st.chat_message("assistant"):
                st.markdown('''
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                ''', unsafe_allow_html=True)
            
            # Generate and display response
            response = self.process_message(prompt)
            with st.chat_message("assistant"):
                st.markdown(response)
                st.markdown(f'<div class="message-time">{datetime.now().strftime("%I:%M %p")}</div>', 
                          unsafe_allow_html=True)
        
        st.markdown('</div>', unsafe_allow_html=True)

    def clear_chat_history(self):
        """Clear the chat history."""
        st.session_state.chat_history = []
        self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
        self._add_message("system", "Chat history cleared.")