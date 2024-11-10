import streamlit as st
from typing import Dict, Any
from components.video import VideoHandler
from components.quiz import QuizGenerator
from components.chat import ChatEngine
from components.avatar import Avatar
from utils.recommendations import RecommendationEngine

class StreamlitInterface:
    def __init__(self):
        self.video_handler = VideoHandler()
        self.quiz_generator = QuizGenerator()
        self.chat_engine = ChatEngine()
        self.avatar = Avatar()
        self.recommendation_engine = RecommendationEngine()
        self._initialize_session_state()

    def _initialize_session_state(self):
        """Initialize session state variables."""
        if "current_page" not in st.session_state:
            st.session_state.current_page = "home"
        if "user_data" not in st.session_state:
            st.session_state.user_data = {}
        if "learning_progress" not in st.session_state:
            st.session_state.learning_progress = {}
        if "processed_videos" not in st.session_state:
            st.session_state.processed_videos = {}

    def setup_page(self):
        """Configure page settings."""
        st.set_page_config(
            page_title="AI Learning Assistant",
            layout="wide",
            initial_sidebar_state="expanded"
        )

    def render_navigation(self):
        """Render navigation bar."""
        with st.sidebar:
            st.title("AI Learning Assistant")
            
            if st.button("Home"):
                st.session_state.current_page = "home"
            if st.button("Learn"):
                st.session_state.current_page = "learn"
            if st.button("Quiz"):
                st.session_state.current_page = "quiz"
            if st.button("Progress"):
                st.session_state.current_page = "progress"
            if st.button("Settings"):
                st.session_state.current_page = "settings"

    def render_home(self):
        """Render home page."""
        st.title("Welcome to AI Learning Assistant")
        st.write("Enter a YouTube URL to start learning!")

        video_url = st.text_input("YouTube URL:")
        if video_url:
            if st.button("Process Video"):
                with st.spinner("Processing video..."):
                    result = self.video_handler.process_video(video_url)
                    if "error" not in result:
                        st.session_state.processed_videos[result["video_id"]] = result
                        st.session_state.current_video = result["video_id"]
                        st.success("Video processed successfully!")
                        st.session_state.current_page = "learn"
                    else:
                        st.error(result["error"])

    def render_learn(self):
        """Render learning interface."""
        if hasattr(st.session_state, 'current_video'):
            video_data = st.session_state.processed_videos[st.session_state.current_video]
            
            col1, col2 = st.columns([2, 1])
            
            with col1:
                st.title(video_data["info"]["title"])
                st.video(f"https://youtube.com/watch?v={st.session_state.current_video}")
                
                self.video_handler.create_player_controls(video_data["info"])
                
                tabs = st.tabs(["Content", "Summary", "Study Guide"])
                with tabs[0]:
                    st.write(video_data["content"]["sections"])
                with tabs[1]:
                    st.write(video_data["content"]["summary"])
                with tabs[2]:
                    st.write(video_data["content"]["study_guide"])
            
            with col2:
                self.video_handler.create_learning_tools()
                
                st.subheader("AI Chat Assistant")
                self._render_chat_interface()
        else:
            st.warning("Please process a video first!")

    def render_quiz(self):
        """Render quiz interface."""
        if hasattr(st.session_state, 'current_video'):
            video_data = st.session_state.processed_videos[st.session_state.current_video]
            
            st.title("Quiz")
            if "current_quiz" not in st.session_state:
                st.session_state.current_quiz = self.quiz_generator.generate_quiz(
                    video_data["content"]["summary"]
                )
            
            for i, question in enumerate(st.session_state.current_quiz):
                st.subheader(f"Question {i+1}")
                st.write(question["question"])
                
                answer = st.radio(
                    "Select your answer:",
                    question["options"],
                    key=f"q{i}"
                )
                
                if st.button(f"Check Answer {i+1}"):
                    if self.quiz_generator.grade_answer(question, answer):
                        st.success("Correct!")
                    else:
                        st.error(f"Incorrect. The correct answer was: {question['correct']}")
        else:
            st.warning("Please process a video first!")

    def render_progress(self):
        """Render progress tracking interface."""
        st.title("Learning Progress")
        
        if st.session_state.learning_progress:
            for topic, progress in st.session_state.learning_progress.items():
                st.subheader(topic)
                st.progress(progress)
        else:
            st.info("No learning progress recorded yet.")

    def render_settings(self):
        """Render settings interface."""
        st.title("Settings")
        
        with st.form("settings_form"):
            st.text_input("Username", key="username")
            st.selectbox("Theme", ["Light", "Dark"], key="theme")
            st.selectbox("Language", ["English", "Spanish", "French"], key="language")
            
            if st.form_submit_button("Save Changes"):
                st.success("Settings saved successfully!")

    def _render_chat_interface(self):
        """Render chat interface."""
        if "messages" not in st.session_state:
            st.session_state.messages = []

        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        if prompt := st.chat_input("Ask a question about the video"):
            st.session_state.messages.append({"role": "user", "content": prompt})
            
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                response = self.chat_engine.process_message(
                    prompt, 
                    context=st.session_state.messages
                )
                st.markdown(response)
                
            st.session_state.messages.append({"role": "assistant", "content": response})

    def run(self):
        """Run the main application."""
        self.setup_page()
        self.render_navigation()

        if st.session_state.current_page == "home":
            self.render_home()
        elif st.session_state.current_page == "learn":
            self.render_learn()
        elif st.session_state.current_page == "quiz":
            self.render_quiz()
        elif st.session_state.current_page == "progress":
            self.render_progress()
        elif st.session_state.current_page == "settings":
            self.render_settings() 