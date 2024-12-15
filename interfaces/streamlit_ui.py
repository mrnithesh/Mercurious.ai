import streamlit as st
from typing import Dict, Any
from components.video import VideoHandler
from components.quiz import QuizGenerator
from components.chat import Chat
from components.data_manager import DataManager
import os
import time
import datetime

class StreamlitInterface:
    def __init__(self, auth_manager, data_manager):
        self.video_handler = VideoHandler()
        self.quiz_generator = QuizGenerator()
        self.chat = Chat(api_key=os.getenv('GEMINI_API_KEY'))
        self.auth_manager = auth_manager
        self.data_manager = data_manager
        self._initialize_session_state()
        self._load_custom_css()
        self._apply_theme()

    def _initialize_session_state(self):
        """Initialize session state variables."""
        if 'authenticated' not in st.session_state:
            st.session_state.authenticated = False
        if 'current_page' not in st.session_state:
            st.session_state.current_page = 'home'
        if 'theme' not in st.session_state:
            st.session_state.theme = 'light'
        if 'user_data' not in st.session_state:
            st.session_state.user_data = {}
        if 'processed_videos' not in st.session_state:
            st.session_state.processed_videos = {}
        if 'current_video' not in st.session_state:
            st.session_state.current_video = None
        if 'quiz_state' not in st.session_state:
            st.session_state.quiz_state = {
                "current_question": 0,
                "total_questions": 0,
                "current_score": 0,
                "user_answers": {}
            }

    def _load_custom_css(self):
        """Load custom CSS for better styling."""
        st.markdown("""
            <style>
                /* Color Variables */
                :root {
                    --primary-color: #4A90E2;
                    --secondary-color: #45B7D1;
                    --accent-color: #FF6B6B;
                    --success-color: #2ECC71;
                    --warning-color: #F1C40F;
                    --error-color: #E74C3C;
                }

                /* Global Styles */
                .main .block-container {
                    padding: 2rem 3rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Sidebar */
                [data-testid="stSidebar"] {
                    background: linear-gradient(180deg, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.05) 100%);
                    padding: 2rem 1rem;
                }

                [data-testid="stSidebar"] .stRadio label {
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                [data-testid="stSidebar"] .stRadio label:hover {
                    background: rgba(74, 144, 226, 0.1);
                }

                /* Headers */
                h1, h2, h3 {
                    color: var(--primary-color) !important;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                /* Buttons */
                .stButton button {
                    width: 100%;
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    border: none;
                    background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    color: white !important;
                }

                .stButton button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
                }

                /* Input fields */
                .stTextInput input, .stSelectbox select, .stTextArea textarea {
                    border-radius: 8px;
                    border: 2px solid rgba(74, 144, 226, 0.2);
                    padding: 0.5rem;
                    transition: all 0.3s ease;
                    background-color: rgba(255, 255, 255, 0.9);
                }

                .stTextInput input:focus, .stSelectbox select:focus, .stTextArea textarea:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
                }

                /* Chat messages */
                .stChatMessage {
                    border-radius: 12px !important;
                    padding: 1rem !important;
                    margin: 0.5rem 0 !important;
                    transition: transform 0.2s ease;
                    border: 1px solid rgba(74, 144, 226, 0.1);
                }

                .stChatMessage:hover {
                    transform: translateX(4px);
                }

                /* Expanders */
                .streamlit-expanderHeader {
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .streamlit-expanderHeader:hover {
                    background: rgba(74, 144, 226, 0.1);
                }

                /* Metrics */
                [data-testid="stMetricValue"] {
                    font-size: 1.8rem !important;
                    color: var(--primary-color) !important;
                }

                /* Dark mode specific styles */
                @media (prefers-color-scheme: dark) {
                    :root {
                        --primary-color: #5B9FE8;
                        --secondary-color: #56C7E1;
                    }

                    .main .block-container {
                        background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
                    }

                    [data-testid="stSidebar"] {
                        background: linear-gradient(180deg, rgba(91, 159, 232, 0.1) 0%, rgba(91, 159, 232, 0.05) 100%);
                    }

                    .stTextInput input, .stSelectbox select, .stTextArea textarea {
                        background-color: rgba(0, 0, 0, 0.2);
                        color: white;
                        border-color: rgba(91, 159, 232, 0.3);
                    }

                    .stChatMessage {
                        background-color: rgba(91, 159, 232, 0.1) !important;
                        border-color: rgba(91, 159, 232, 0.2);
                    }

                    .streamlit-expanderHeader {
                        background: rgba(91, 159, 232, 0.1);
                    }

                    .streamlit-expanderHeader:hover {
                        background: rgba(91, 159, 232, 0.2);
                    }
                }

                /* Alert boxes */
                .stAlert {
                    border-radius: 8px;
                    border: none;
                    padding: 1rem;
                }

                .stAlert.success {
                    background-color: rgba(46, 204, 113, 0.1);
                    border-left: 4px solid var(--success-color);
                }

                .stAlert.warning {
                    background-color: rgba(241, 196, 15, 0.1);
                    border-left: 4px solid var(--warning-color);
                }

                .stAlert.error {
                    background-color: rgba(231, 76, 60, 0.1);
                    border-left: 4px solid var(--error-color);
                }

                /* Progress bars */
                .stProgress > div > div {
                    background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    border-radius: 10px;
                }

                /* Tooltips */
                .tooltip {
                    position: relative;
                    display: inline-block;
                }

                .tooltip .tooltiptext {
                    visibility: hidden;
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    text-align: center;
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    position: absolute;
                    z-index: 1;
                    bottom: 125%;
                    left: 50%;
                    transform: translateX(-50%);
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .tooltip:hover .tooltiptext {
                    visibility: visible;
                    opacity: 1;
                }
            </style>
        """, unsafe_allow_html=True)

    def _apply_theme(self):
        """Apply the current theme."""
        if st.session_state.theme == "dark":
            # Dark theme configuration
            st.markdown("""
                <style>
                    [data-testid="stAppViewContainer"] {
                        background-color: #1E1E1E;
                    }
                    [data-testid="stSidebar"] {
                        background-color: #2D2D2D;
                    }
                    .stMarkdown, .stText, p, h1, h2, h3 {
                        color: #FFFFFF !important;
                    }
                    .stButton > button {
                        background-color: #4A4A4A;
                        color: #FFFFFF;
                    }
                    .stTextInput > div > div > input {
                        background-color: #2D2D2D;
                        color: #FFFFFF;
                    }
                    .stSelectbox > div > div > select {
                        background-color: #2D2D2D;
                        color: #FFFFFF;
                    }
                    div[data-baseweb="select"] > div {
                        background-color: #2D2D2D;
                        color: #FFFFFF;
                    }
                    .stChatMessage {
                        background-color: #2D2D2D !important;
                    }
                    .stChatMessage [data-testid="stMarkdownContainer"] {
                        color: #FFFFFF !important;
                    }
                    div[data-testid="stChatMessageContent"] {
                        background-color: #2D2D2D !important;
                        color: #FFFFFF !important;
                    }
                    div[data-testid="stChatMessageContent"] code {
                        background-color: #1E1E1E !important;
                    }
                    .stAlert {
                        background-color: #2D2D2D;
                        color: #FFFFFF;
                    }
                    .stSpinner > div {
                        border-color: #FFFFFF !important;
                    }
                </style>
            """, unsafe_allow_html=True)
        else:
            # Light theme configuration (default Streamlit theme)
            st.markdown("""
                <style>
                    .stChatMessage {
                        background-color: #F0F2F6 !important;
                    }
                    div[data-testid="stChatMessageContent"] {
                        background-color: #F0F2F6 !important;
                    }
                </style>
            """, unsafe_allow_html=True)

    def render_navigation(self):
        """Render enhanced navigation bar."""
        with st.sidebar:
            st.image("logo.jpg", width=150)  
            st.title("Mercurious.AI")
            
            # Show user info if logged in
            if st.session_state.user:
                st.markdown(f"👤 **{st.session_state.user.display_name}**")
            
            nav_items = {
                "home": "🏠 Home",
                "learn": "📚 Learn",
                "quiz": "✍️ Quiz",
                "progress": "📊 Progress",
                "settings": "⚙️ Settings"
            }
            
            st.markdown("---")
            
            for page, label in nav_items.items():
                button_style = "nav-button-active" if st.session_state.current_page == page else ""
                if st.button(label, key=f"nav_{page}", help=f"Go to {page} page"):
                    st.session_state.current_page = page
                    st.rerun()

            st.markdown("---")
            with st.expander("🌟 Quick Stats", expanded=True):
                st.metric(label="Videos Watched", value=len(st.session_state.processed_videos))
                st.metric(label="Hours Learned", value=f"{len(st.session_state.processed_videos) * 0.5:.1f}")
            
            # Add logout button at the bottom
            st.markdown("---")
            if st.session_state.user:
                if st.button("🚪 Logout", type="secondary", use_container_width=True):
                    self.auth_manager.logout_user()
                    # Clear session state
                    for key in list(st.session_state.keys()):
                        del st.session_state[key]
                    st.rerun()

    def render_home(self):
        """Render enhanced home page."""
        st.title("🎓 Welcome to Mercurious your AI Learning Assistant")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.markdown("""
                ### Start Your Learning Journey
                Enter a YouTube URL below to begin learning with AI-powered tools:
                - 📝 Smart Notes
                - 🤖 AI Chat Assistant
                - 📊 Progress Tracking
                - 🎯 Personalized Quizzes
            """)
            
            video_url = st.text_input("YouTube URL:", placeholder="https://youtube.com/watch?v=...")
            
            if video_url:
                if st.button("🚀 Process Video", use_container_width=True):
                    with st.spinner("Processing video..."):
                        progress_bar = st.progress(0)
                        for i in range(100):
                            time.sleep(0.01)
                            progress_bar.progress(i + 1)
                        
                        result = self.video_handler.process_video(video_url)
                        if "error" not in result:
                            st.session_state.processed_videos[result["video_id"]] = result
                            st.session_state.current_video = result["video_id"]
                            st.success("✨ Video processed successfully!")
                            time.sleep(1)
                            st.session_state.current_page = "learn"
                            st.rerun()
                        else:
                            st.error(f"❌ {result['error']}")

        # Learning Library Section
        if st.session_state.user:
            st.markdown("---")
            st.markdown("### 📚 Your Learning Library")
            processed_videos = self.data_manager.get_all_processed_videos(st.session_state.user.uid)
            
            if processed_videos:
                for video in processed_videos:
                    with st.expander(f"🎥 {video['title']}", expanded=False):
                        st.progress(video.get('progress', 0))
                        st.markdown(f"Last watched: {video['last_watched'].strftime('%Y-%m-%d %H:%M')}")
                        
                        col1, col2, col3 = st.columns([1, 1, 1])
                        with col1:
                            if st.button("▶️ Continue Learning", key=f"continue_{video['video_id']}"):
                                st.session_state.current_video = video['video_id']
                                st.session_state.processed_videos[video['video_id']] = {
                                    'info': video['info'],
                                    'video_id': video['video_id'],
                                    'content': video['content']
                                }
                                st.session_state.current_page = "learn"
                                st.rerun()
                        with col2:
                            if st.button("📊 View Progress", key=f"progress_{video['video_id']}"):
                                st.session_state.current_page = "progress"
                                st.rerun()
                        with col3:
                            if st.button("🗑️ Delete", 
                                key=f"delete_{video['video_id']}", 
                                type="secondary",
                                help="Delete this video from your library"
                            ):
                                if self._delete_video(video['video_id']):
                                    if video['video_id'] in st.session_state.processed_videos:
                                        del st.session_state.processed_videos[video['video_id']]
                                    if hasattr(st.session_state, 'current_video') and st.session_state.current_video == video['video_id']:
                                        delattr(st.session_state, 'current_video')
                                    st.success("Video deleted successfully!")
                                    st.rerun()
                                else:
                                    st.error("Failed to delete video")
            else:
                st.info("No processed videos yet. Start by processing a video! 🎥")

    def render_learn(self):
        """Render enhanced learning interface."""
        if hasattr(st.session_state, 'current_video'):
            video_data = st.session_state.processed_videos[st.session_state.current_video]
            
            # Save processed video data for the current user
            if st.session_state.user:
                self.data_manager.save_processed_video(
                    st.session_state.user.uid,
                    video_data
                )
                
                # Update progress based on video position
                progress = st.session_state.get('video_progress', 0)
                self.data_manager.update_video_progress(
                    st.session_state.user.uid,
                    st.session_state.current_video,
                    progress
                )
            
            col1, col2 = st.columns([2, 1])
            
            with col1:
                st.title(video_data["info"]["title"])
                
                metrics_col1, metrics_col2, metrics_col3 = st.columns(3)
                with metrics_col1:
                    st.metric("👤 Author", video_data['info'].get('author', 'Unknown'))
                with metrics_col2:
                    st.metric("👀 Views", f"{int(video_data['info'].get('views', 0)):,}")
                with metrics_col3:
                    st.metric("📅 Published", video_data['info'].get('publish_date', 'Unknown')[:10])
                
                with st.container():
                    st.video(f"https://youtube.com/watch?v={st.session_state.current_video}")
                
                tabs = st.tabs(["📑 Content", "📝 Summary", "📚 Study Guide"])
                
                with tabs[0]:
                    # Display each section string using markdown
                    sections = video_data["content"].get("sections", [])
                    if isinstance(sections, list):
                        for section in sections:
                            st.markdown(section)
                    else:
                        st.write("No content available")
                
                with tabs[1]:
                    st.markdown(video_data["content"].get("summary", "No summary available"))
                
                with tabs[2]:
                    st.markdown(video_data["content"].get("study_guide", "No study guide available"))
            
            with col2:
                with st.container():
                    st.subheader("📝 Learning Tools")
                    
                    # Load existing notes if available
                    existing_notes = ""
                    if st.session_state.user:
                        existing_notes = self.data_manager.get_notes(
                            st.session_state.user.uid,
                            st.session_state.current_video
                        ) or ""
                    
                    with st.expander("✏️ Notes", expanded=True):
                        notes = st.text_area(
                            "Your Notes",
                            value=existing_notes,
                            placeholder="Take notes here...",
                            height=300
                        )
                        
                        col1, col2 = st.columns([1, 1])
                        with col1:
                            if st.button("💾 Save Notes", use_container_width=True):
                                if self._save_notes(notes):
                                    st.success("✅ Notes saved!")
                                else:
                                    st.error("Failed to save notes")
                        with col2:
                            if st.button("📋 Copy", use_container_width=True):
                                st.code(notes)  # This adds a copy button automatically
                                st.success("Notes ready to copy!")
                    
                    
                st.markdown("---")
                
                with st.container():
                    st.subheader("🤖 AI Chat Assistant")
                    self._render_chat_interface()
        
        else:
            st.warning("⚠️ Please process a video first!")
            if st.button("↩️ Go to Home"):
                st.session_state.current_page = "home"
                st.rerun()

    def _render_chat_interface(self):
        """Render the chat interface."""
        if not st.session_state.user:
            st.warning("Please login to use the chat feature")
            return

        if "current_video" not in st.session_state or not st.session_state.current_video:
            st.warning("⚠️ Please select a video to chat about")
            return

        # Get the current video data
        video_data = st.session_state.processed_videos.get(st.session_state.current_video)
        if not video_data or not video_data.get('content'):
            st.warning("⚠️ Video content not available. Please process the video first.")
            return

        # Display chat interface
        self.chat.display_chat_interface()

    def render_quiz(self):
        """Render enhanced quiz interface."""
        if not st.session_state.user:
            st.warning("Please login to use the quiz feature")
            return

        if "current_video" not in st.session_state or not st.session_state.current_video:
            st.warning("⚠️ Please select a video first")
            return

        # Get video content from processed videos
        video_data = st.session_state.processed_videos.get(st.session_state.current_video)
        if not video_data:
            st.warning("⚠️ Video data not found. Please process the video first.")
            return

        video_content = video_data.get('content', {})
        if not video_content:
            st.warning("⚠️ No content available. Please process the video first.")
            return
        
        # Extract content for quiz generation
        content = {
            'transcript': video_content.get('transcript', ''),
            'summary': video_content.get('summary', ''),
            'main_points': video_content.get('main_points', []),
            'key_concepts': video_content.get('key_concepts', []),
            'study_guide': video_content.get('study_guide', '')
        }
        
        # Check if we have enough content
        if not content['transcript'] and not content['summary']:
            st.warning("⚠️ No content available for quiz generation. Please process the video first.")
            return

        # Initialize quiz state if not exists
        if "quiz_state" not in st.session_state:
            st.session_state.quiz_state = {
                "current_score": 0,
                "total_questions": 0,
                "submitted": False,
                "user_answers": {}
            }

        try:
            # Generate quiz data if not already generated
            if "quiz_data" not in st.session_state:
                quiz_generator = QuizGenerator()
                quiz_data = quiz_generator.generate_quiz(content)
                if quiz_data:
                    st.session_state.quiz_data = quiz_data
                    st.session_state.quiz_state["total_questions"] = len(quiz_data)
                else:
                    st.error("Failed to generate quiz questions")
                    return
            
            # Display quiz header
            st.markdown("### 📝 Video Quiz")
            st.markdown("Test your understanding of the video content:")
            
            # Display questions
            for i, question in enumerate(st.session_state.quiz_data):
                self._render_quiz_question(i, question)

            # Submit and Reset buttons in columns
            col1, col2 = st.columns([1, 4])
            with col1:
                if st.button("Submit Quiz", key="submit_quiz", use_container_width=True):
                    self._process_quiz_submission(st.session_state.quiz_data)
                    st.session_state.quiz_state["submitted"] = True
                    st.rerun()

            with col2:
                if st.button("Reset Quiz", key="reset_quiz"):
                    # Clear quiz state and data
                    st.session_state.pop("quiz_data", None)
                    st.session_state.quiz_state = {
                        "current_score": 0,
                        "total_questions": 0,
                        "submitted": False,
                        "user_answers": {}
                    }
                    st.rerun()

            # Display results if quiz is submitted
            if st.session_state.quiz_state.get("submitted", False):
                self._display_quiz_results()

        except Exception as e:
            st.error(f"Error rendering quiz: {str(e)}")
            if st.button("Try Again"):
                st.session_state.pop("quiz_data", None)
                st.rerun()

    def _process_quiz_submission(self, quiz_data):
        """Process quiz submission and calculate score."""
        score = 0
        total = len(quiz_data)
        
        # Calculate score
        for i, question in enumerate(quiz_data):
            user_answer = st.session_state.quiz_state["user_answers"].get(i)
            if user_answer is not None and user_answer == question['correct_answer']:
                score += 1
        
        # Update quiz state
        st.session_state.quiz_state.update({
            "current_score": score,
            "total_questions": total,
            "submitted": True
        })
        
        # Save quiz result if user is logged in
        if st.session_state.user and st.session_state.current_video:
            self.data_manager.save_quiz_result(
                st.session_state.user.uid,
                st.session_state.current_video,
                {
                    'score': score,
                    'total': total,
                    'timestamp': datetime.datetime.now().isoformat()
                }
            )

    def _render_quiz_question(self, index, question):
        """Render a single quiz question with improved formatting."""
        st.markdown(f"**Question {index + 1}:** {question['question']}")
        
        # Create unique key for radio button
        radio_key = f"question_{index}"
        
        # Get user's previous answer if it exists
        previous_answer = st.session_state.quiz_state["user_answers"].get(index)
        
        # Display options as radio buttons
        selected_option = st.radio(
            "Select your answer:",
            options=question['options'],
            key=radio_key,
            index=None if previous_answer is None else question['options'].index(previous_answer)
        )
        
        # Store user's answer in session state
        if selected_option is not None:
            st.session_state.quiz_state["user_answers"][index] = selected_option
        
        st.markdown("---")

    def render_progress(self):
        """Render enhanced progress tracking interface."""
        st.title("📊 Learning Progress")
        
        if not st.session_state.user:
            st.warning("Please login to view your progress")
            return
        
        # Get user progress data
        progress_data = self.data_manager.get_user_progress(st.session_state.user.uid)
        
        if progress_data:
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("Overall Progress")
                st.metric("Videos Watched", progress_data['total_videos'])
                if progress_data['total_videos'] > 0:
                    st.progress(progress_data['average_progress'])
                    st.metric("Average Progress", f"{progress_data['average_progress']:.1%}")
            
            with col2:
                st.subheader("Quiz Performance")
                st.metric("Quizzes Completed", progress_data['total_quizzes'])
                if progress_data['total_quizzes'] > 0:
                    st.metric("Average Score", f"{progress_data['average_score']:.1%}")
            
            # Show recent activity
            st.markdown("---")
            st.subheader("Recent Activity")
            
            for video in progress_data['videos'][:5]:  # Show last 5 videos
                with st.expander(f"🎥 {video['title']}", expanded=False):
                    st.progress(video['progress'])
                    st.markdown(f"Last watched: {video['last_watched'].strftime('%Y-%m-%d %H:%M')}")
                    
                    # Show associated quiz results
                    quiz_results = [
                        q for q in progress_data['quiz_results'] 
                        if q['video_id'] == video['video_id']
                    ]
                    if quiz_results:
                        st.markdown("Quiz Results:")
                        for quiz in quiz_results:
                            st.metric(
                                "Score", 
                                f"{quiz['score']}/{quiz['total_questions']}"
                            )
        else:
            st.info("📚 No learning progress recorded yet. Start by watching some videos!")

    def render_settings(self):
        """Render enhanced settings interface."""
        st.title("⚙️ Settings")
        
        # Store current values before form
        current_theme = st.session_state.theme
        current_language = st.session_state.get("language", "English")
        
        with st.form("settings_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                username = st.text_input("👤 Username", 
                             value=st.session_state.user_data.get("username", ""),
                             key="settings_username")
                new_theme = st.selectbox("🎨 Theme",
                            ["Light", "Dark"],
                            index=0 if current_theme == "light" else 1,
                            key="settings_theme")
            
            with col2:
                new_language = st.selectbox("🌍 Language",
                            ["English", "Spanish", "French"],
                            index=["English", "Spanish", "French"].index(current_language),
                            key="settings_language")
            
            # Add submit button
            if st.form_submit_button("Save Settings"):
                try:
                    # Update user settings in database
                    user_id = st.session_state.user.uid
                    settings = {
                        "username": username,
                        "theme": new_theme.lower(),
                        "language": new_language
                    }
                    
                    if self.data_manager.update_user_settings(user_id, settings):
                        # Set flag to update theme on next rerun
                        st.session_state.settings_changed = True
                        st.session_state.new_settings = settings
                        st.success("✅ Settings saved successfully!")
                        st.rerun()
                    else:
                        st.error("Failed to save settings to database")
                except Exception as e:
                    st.error(f"Failed to save settings: {str(e)}")

    def render_login(self):
        """Render login/register interface."""
        st.title("Welcome to Mercurious.ai")
        
        tab1, tab2 = st.tabs(["Login", "Register"])
        
        with tab1:
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            if st.button("Login"):
                if self.auth_manager.login_user(email, password):
                    st.session_state.authenticated = True
                    st.success("Login successful!")
                    time.sleep(1)  # Give time for success message
                    st.rerun()
                else:
                    st.error("Invalid credentials")
        
        with tab2:
            reg_email = st.text_input("Email", key="reg_email")
            reg_password = st.text_input("Password", type="password", key="reg_pass")
            name = st.text_input("Full Name")
            if st.button("Register"):
                if self.auth_manager.register_user(reg_email, reg_password, name):
                    st.success("Registration successful! Please login.")

    def _initialize_avatar(self):
        """Initialize avatar settings."""
        if "avatar_style" not in st.session_state:
            st.session_state.avatar_style = "default"
        if "avatar_color" not in st.session_state:
            st.session_state.avatar_color = "#000000"

    def run(self):
        """Run the main application."""
        try:
            # Initialize basic settings
            self._initialize_session_state()
            self._initialize_avatar()
            
            # Handle authentication
            if not st.session_state.authenticated:
                self.render_login()
                return

            # Render navigation and content
            self.render_navigation()
            
            # Get current page from session state
            current_page = st.session_state.current_page
            
            # Render appropriate page
            if current_page == "home":
                self.render_home()
            elif current_page == "learn":
                self.render_learn()
            elif current_page == "quiz":
                self.render_quiz()
            elif current_page == "progress":
                self.render_progress()
            elif current_page == "settings":
                self.render_settings()
            else:
                st.error("Invalid page selected")

        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
            st.error("Please try refreshing the page or contact support if the issue persists.")

    def _save_notes(self, notes: str) -> bool:
        """Save notes with DataManager."""
        if "current_video" in st.session_state and st.session_state.user:
            try:
                success = self.data_manager.save_notes(
                    st.session_state.user.uid,
                    st.session_state.current_video,
                    notes
                )
                return success
            except Exception as e:
                print(f"Error saving notes: {str(e)}")
                return False
        return False

    def _delete_video(self, video_id: str) -> bool:
        """Delete a video from user's library."""
        if st.session_state.user:
            try:
                return self.data_manager.delete_video(
                    st.session_state.user.uid,
                    video_id
                )
            except Exception as e:
                print(f"Error deleting video: {str(e)}")
                return False
        return False

    def _generate_fallback_quiz(self, content):
        """Generate a challenging quiz with complex questions from video content."""
        try:
            # Extract relevant content for quiz generation
            quiz_content = {
                'summary': content.get('summary', ''),
                'main_points': content.get('main_points', []),
                'key_concepts': content.get('key_concepts', []),
                'study_guide': content.get('study_guide', '')
            }
            
            # Generate quiz using QuizGenerator
            quiz_data = self.quiz_generator.generate_quiz(quiz_content)
            
            # Validate quiz data
            if not quiz_data or not isinstance(quiz_data, list):
                raise ValueError("Invalid quiz data format")
            
            # Ensure each question has required fields
            for question in quiz_data:
                if not isinstance(question, dict):
                    raise ValueError("Invalid question format")
                if not all(key in question for key in ['question', 'options', 'correct_answer']):
                    raise ValueError("Missing required question fields")
            
            return quiz_data
            
        except Exception as e:
            st.error(f"Failed to generate quiz: {str(e)}")
            # Return a simple default quiz
            return [{
                'question': 'What is the main topic of this video?',
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct_answer': 'Option A',
                'explanation': 'This is a default question.'
            }]

    def _display_quiz_results(self):
        """Display quiz results with explanations."""
        score = st.session_state.quiz_state["current_score"]
        total = st.session_state.quiz_state["total_questions"]
        
        # Display score
        st.markdown(f"### Quiz Results")
        st.markdown(f"Your score: **{score}/{total}** ({(score/total*100):.1f}%)")
        
        # Display each question with correct answer and explanation
        st.markdown("### Review")
        for i, question in enumerate(st.session_state.quiz_data):
            user_answer = st.session_state.quiz_state["user_answers"].get(i)
            correct = user_answer == question['correct_answer']
            
            # Question container
            with st.container():
                # Question text
                st.markdown(f"**Question {i+1}:** {question['question']}")
                
                # User's answer with color-coded result
                if user_answer:
                    color = "green" if correct else "red"
                    st.markdown(f"Your answer: <span style='color: {color}'>{user_answer}</span>", unsafe_allow_html=True)
                else:
                    st.markdown("Your answer: Not answered")
                
                # Correct answer if user was wrong
                if not correct:
                    st.markdown(f"Correct answer: **{question['correct_answer']}**")
                
                # Explanation
                st.markdown(f"*Explanation: {question['explanation']}*")
                
                st.markdown("---")

    def _render_quiz_question(self, index, question):
        """Render a single quiz question with improved formatting."""
        st.markdown(f"**Question {index + 1}:** {question['question']}")
        
        # Create unique key for radio button
        radio_key = f"question_{index}"
        
        # Get user's previous answer if it exists
        previous_answer = st.session_state.quiz_state["user_answers"].get(index)
        
        # Display options as radio buttons
        selected_option = st.radio(
            "Select your answer:",
            options=question['options'],
            key=radio_key,
            index=None if previous_answer is None else question['options'].index(previous_answer)
        )
        
        # Store user's answer in session state
        if selected_option is not None:
            st.session_state.quiz_state["user_answers"][index] = selected_option
        
        st.markdown("---")

    def _render_fallback_quiz(self, content):
        """Render a simple fallback quiz based on video content."""
        st.markdown("### 📝 Video Understanding Check")
        st.info("This is a basic quiz to check your understanding of the video content.")
        
        # Create simple questions based on available content
        if content.get('summary'):
            st.markdown("**Question 1:** What is the main topic discussed in this video?")
            st.text_area("Your answer:", key="q1_answer", height=100)
            
        if content.get('key_points'):
            st.markdown("**Question 2:** List three key points you learned from this video:")
            st.text_area("Your answer:", key="q2_answer", height=150)
        
        if st.button("Submit Answers"):
            st.success("Thank you for completing the quiz! Review the video content to check your understanding.")

    def _process_video_content(self, video_data):
        """Process and structure video content for display."""
        if not video_data or 'content' not in video_data:
            return None

        content = video_data['content']
        processed_content = {
            'summary': content.get('summary', ''),
            'key_points': content.get('key_points', []),
            'study_guide': content.get('study_guide', ''),
            'transcript': content.get('transcript', ''),
            'analysis': content.get('analysis', ''),
            'key_concepts': content.get('key_concepts', []),
            'vocabulary': content.get('vocabulary', []),
            'text': content.get('text', ''),
            'content': self._format_main_content(content)  # Use dedicated formatter
        }
        return processed_content

    def _format_main_content(self, content):
        """Format the main content section with all available information."""
        formatted_parts = []

        # Add main content if available
        if content.get('content'):
            formatted_parts.append("# Summary\n" + content['content'] + "\n")

        # Add detailed analysis if available
        if content.get('analysis'):
            formatted_parts.append("\n# Detailed Analysis\n" + content['analysis'] + "\n")

        # Add key concepts if available
        if content.get('key_concepts'):
            formatted_parts.append("\n# Key Concepts\n")
            for concept in content['key_concepts']:
                formatted_parts.append(f"• {concept}\n")

        # Add vocabulary if available
        if content.get('vocabulary'):
            formatted_parts.append("\n# Important Terms\n")
            for term in content['vocabulary']:
                formatted_parts.append(f"• {term}\n")

        # Add transcript excerpts if available
        if content.get('transcript'):
            formatted_parts.append("\n# Transcript Highlights\n")
            transcript_preview = content['transcript'][:1000] + "..." if len(content['transcript']) > 1000 else content['transcript']
            formatted_parts.append(transcript_preview + "\n")

        # If no specific content is available, create a comprehensive overview
        if not formatted_parts:
            formatted_parts = [
                "# Content Overview\n",
                f"Summary:\n{content.get('summary', 'No summary available.')}\n\n",
                "Key Points:\n" + "\n".join(f"• {point}" for point in content.get('key_points', ['No key points available.'])) + "\n\n",
                f"Study Focus:\n{content.get('study_guide', 'No study guide available.')}\n"
            ]

        return "\n".join(formatted_parts)

    def _display_video_content(self, video_data):
        """Display the video content in a structured format."""
        if not video_data:
            st.warning("⚠️ No video content available")
            return

        processed_content = self._process_video_content(video_data)
        if not processed_content:
            st.warning("⚠️ Could not process video content")
            return

        # Display main sections
        with st.expander("📝 Summary", expanded=True):
            if processed_content['summary']:
                st.markdown(processed_content['summary'])
            else:
                st.info("No summary available")

        with st.expander("🔑 Key Points", expanded=True):
            if processed_content['key_points']:
                for point in processed_content['key_points']:
                    st.markdown(f"• {point}")
            else:
                st.info("No key points available")

        with st.expander("📚 Study Guide", expanded=True):
            if processed_content['study_guide']:
                st.markdown(processed_content['study_guide'])
            else:
                st.info("No study guide available")

        with st.expander("📑 Content", expanded=True):
            if processed_content['content']:
                st.markdown(processed_content['content'])
            else:
                # Generate comprehensive content from available information
                fallback_content = [
                    "# Content Overview",
                    f"**Main Topic Analysis**\n{processed_content['summary']}",
                    "\n**Key Points Analysis**"
                ]
                for point in processed_content['key_points']:
                    fallback_content.append(f"• Detailed Analysis: {point}")
                
                if processed_content['study_guide']:
                    fallback_content.append(f"\n**Study Guide Analysis**\n{processed_content['study_guide']}")
                
                if processed_content['key_concepts']:
                    fallback_content.append("\n**Key Concepts Analysis**")
                    for concept in processed_content['key_concepts']:
                        fallback_content.append(f"• {concept}")
                
                st.markdown("\n\n".join(fallback_content))

    def render_content(self):
        """Render the video content page."""
        if "current_video" not in st.session_state or not st.session_state.current_video:
            st.warning("⚠️ Please select a video first")
            return

        video_data = st.session_state.processed_videos.get(st.session_state.current_video)
        if not video_data:
            st.warning("⚠️ Video data not found")
            return

        st.markdown("## 📺 Video Content")
        
        # Display video information
        if 'info' in video_data:
            st.markdown(f"### {video_data['info'].get('title', 'Untitled Video')}")
            if 'description' in video_data['info']:
                st.markdown(f"_{video_data['info']['description']}_")

        # Display processed content
        self._display_video_content(video_data)

    def process_video(self, video_path: str):
        """Process video and extract content."""
        try:
            if not os.path.exists(video_path):
                st.error(f"❌ Video file not found: {video_path}")
                return False

            with st.spinner("Processing video..."):
                # Get video info
                video_info = self.video_handler.get_video_info(video_path)
                if not video_info:
                    st.error("❌ Failed to get video information")
                    return False

                # Extract audio and generate transcript
                transcript = self.video_handler.extract_transcript(video_path)
                if not transcript:
                    st.error("❌ Failed to generate transcript")
                    return False

                # Generate content from transcript
                content = self.video_handler.generate_content(transcript)
                if not content:
                    st.error("❌ Failed to generate content")
                    return False

                # Generate additional analysis
                try:
                    analysis = self.video_handler.analyze_content(transcript, content)
                except:
                    analysis = None

                # Combine all content
                processed_content = {
                    'summary': content.get('summary', ''),
                    'key_points': content.get('key_points', []),
                    'study_guide': content.get('study_guide', ''),
                    'transcript': transcript,
                    'analysis': analysis,
                    'key_concepts': content.get('key_concepts', []),
                    'vocabulary': content.get('vocabulary', []),
                    'text': content.get('text', ''),
                    'content': content.get('content', '')
                }

                # Store processed video data
                video_key = os.path.basename(video_path)
                st.session_state.processed_videos[video_key] = {
                    'path': video_path,
                    'info': video_info,
                    'content': processed_content
                }
                st.session_state.current_video = video_key

                return True

        except Exception as e:
            st.error(f"❌ Error processing video: {str(e)}")
            return False

    def _generate_full_content(self, content, transcript):
        """Generate comprehensive content from all available information."""
        content_parts = []

        # Add summary if available
        if content.get('summary'):
            content_parts.append("# Summary\n" + content['summary'])

        # Add key points if available
        if content.get('key_points'):
            content_parts.append("\n# Key Points\n" + "\n".join(f"• {point}" for point in content['key_points']))

        # Add study guide if available
        if content.get('study_guide'):
            content_parts.append("\n# Study Guide\n" + content['study_guide'])

        # Add main content or transcript
        main_content = content.get('text', content.get('content', ''))
        if main_content:
            content_parts.append("\n# Detailed Content\n" + main_content)
        elif transcript:
            content_parts.append("\n# Transcript\n" + transcript)

        # Join all parts with proper spacing
        return "\n\n".join(content_parts)
