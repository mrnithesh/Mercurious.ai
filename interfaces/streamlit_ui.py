import streamlit as st
from typing import Dict, Any
from components.video import VideoHandler
from components.quiz import QuizGenerator
from components.chat import Chat
from components.avatar import Avatar
from utils.recommendations import RecommendationEngine
import time
import os

# Set page config at the very beginning, before any other st commands
st.set_page_config(
    page_title="Mercurious.ai",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://docs.streamlit.io',
        'Report a bug': "https://github.com/your-repo/issues",
        'About': "# AI Learning Assistant v1.0"
    }
)

class StreamlitInterface:
    def __init__(self, auth_manager, data_manager):
        self.video_handler = VideoHandler()
        self.quiz_generator = QuizGenerator()
        self.chat = Chat(api_key=os.getenv('GEMINI_API_KEY'))
        self.recommendation_engine = RecommendationEngine()
        self.auth_manager = auth_manager
        self.data_manager = data_manager
        self.avatar = None
        self._initialize_session_state()
        self._load_custom_css()
        self._apply_theme()

    def _initialize_session_state(self):
        """Initialize session state variables."""
        default_states = {
            "current_page": "home",
            "user_data": {},
            "learning_progress": {},
            "processed_videos": {},
            "theme": "light",
            "language": "English",
            "settings_changed": False
        }
        
        for key, value in default_states.items():
            if key not in st.session_state:
                st.session_state[key] = value

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
        """Render enhanced chat interface."""
        if "messages" not in st.session_state:
            st.session_state.messages = []

        chat_container = st.container()
        
        with chat_container:
            for message in st.session_state.messages:
                message_style = "user-message" if message["role"] == "user" else "assistant-message"
                with st.chat_message(message["role"]):
                    st.markdown(f'<div class="chat-message {message_style}">{message["content"]}</div>', 
                              unsafe_allow_html=True)

        if prompt := st.chat_input("Ask about the video..."):
            st.session_state.messages.append({"role": "user", "content": prompt})
            
            with st.chat_message("user"):
                st.markdown(f'<div class="chat-message user-message">{prompt}</div>', 
                          unsafe_allow_html=True)

            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    response = self.chat.process_message(prompt, context=st.session_state.messages)
                    st.markdown(f'<div class="chat-message assistant-message">{response}</div>', 
                              unsafe_allow_html=True)
                
            st.session_state.messages.append({"role": "assistant", "content": response})

    def render_quiz(self):
        """Render enhanced quiz interface."""
        st.title("✍️ Knowledge Check")
        
        if hasattr(st.session_state, 'current_video'):
            video_data = st.session_state.processed_videos[st.session_state.current_video]
            
            if "current_quiz" not in st.session_state:
                with st.spinner("Generating quiz..."):
                    full_content = f"""
                    Video Title: {video_data.get('title', '')}
                    
                    Transcript:
                    {video_data.get('content', {}).get('transcript', '')}
                    
                    Summary:
                    {video_data.get('content', {}).get('summary', '')}
                    
                    Key Points:
                    {video_data.get('content', {}).get('key_points', [])}
                    """
                    st.session_state.current_quiz = self.quiz_generator.generate_quiz(
                        content=full_content,
                        num_questions=5
                    )
            
            for i, question in enumerate(st.session_state.current_quiz):
                with st.container():
                    st.markdown(f"### Question {i+1}")
                    st.markdown(question["question"])
                    
                    answer = st.radio(
                        "Select your answer:",
                        question["options"],
                        key=f"q{i}"
                    )
                    
                    check_col, next_col = st.columns([1, 4])
                    with check_col:
                        if st.button(f"Check Answer", key=f"check_{i}"):
                            if self.quiz_generator.grade_answer(question, answer):
                                st.success("✅ Correct!")
                            else:
                                st.error(f"❌ Incorrect. The correct answer was: {question['correct']}")
                    
                    st.markdown("---")
        else:
            st.warning("⚠️ Please process a video first!")
            if st.button("↩️ Go to Home"):
                st.session_state.current_page = "home"
                st.rerun()

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
        st.title("Welcome to Mercurious.ai")
        
        tab1, tab2 = st.tabs(["Login", "Register"])
        
        with tab1:
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            if st.button("Login"):
                if self.auth_manager.login_user(email, password):
                    st.success("Login successful!")
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
        """Initialize avatar after user authentication"""
        if not self.avatar:
            if not hasattr(st.session_state, 'user') or not st.session_state.user:
                return  # Skip avatar initialization if user is not authenticated
            
            try:
                user_data = self.auth_manager.get_current_user()
                if user_data:
                    self.avatar = Avatar(
                        user_id=st.session_state.user.uid,
                        db=self.data_manager.db
                    )
            except Exception as e:
                st.error(f"Failed to initialize avatar: {str(e)}")

    def run(self):
        """Run the main application."""
        # Handle settings changes at the start of the run
        if st.session_state.get("settings_changed", False):
            new_settings = st.session_state.get("new_settings", {})
            st.session_state.theme = new_settings.get("theme", st.session_state.theme)
            st.session_state.language = new_settings.get("language", st.session_state.language)
            st.session_state.user_data["username"] = new_settings.get("username", 
                st.session_state.user_data.get("username", ""))
            st.session_state.settings_changed = False
            del st.session_state.new_settings
        
        # Initialize avatar only if user is authenticated
        if hasattr(st.session_state, 'user') and st.session_state.user:
            self._initialize_avatar()

        # Apply theme before rendering anything
        self._apply_theme()
        
        # Render navigation
        self.render_navigation()

        # Render current page
        if not st.session_state.user:
            self.render_login()
        else:
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
