import streamlit as st
from typing import Dict, Any
from components.video import VideoHandler
from components.quiz import QuizGenerator
from components.chat import ChatEngine
from components.avatar import Avatar
from utils.recommendations import RecommendationEngine
import time

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
        self.chat_engine = ChatEngine()
        self.avatar = Avatar()
        self.recommendation_engine = RecommendationEngine()
        self.auth_manager = auth_manager
        self.data_manager = data_manager
        self._initialize_session_state()
        self._load_custom_css()

    def _initialize_session_state(self):
        """Initialize session state variables."""
        default_states = {
            "current_page": "home",
            "user_data": {},
            "learning_progress": {},
            "processed_videos": {},
            "theme": "light",
            "sidebar_collapsed": False
        }
        
        for key, default_value in default_states.items():
            if key not in st.session_state:
                st.session_state[key] = default_value

    def _load_custom_css(self):
        """Load custom CSS for better styling."""
        st.markdown("""
            <style>
                .stButton button {
                    width: 100%;
                    border-radius: 5px;
                    height: 3em;
                    background-color: #f0f2f6;
                    border: none;
                    margin: 5px 0;
                }
                
                .stButton button:hover {
                    background-color: #e0e2e6;
                }
                
                .nav-button-active {
                    border-left: 4px solid #ff4b4b !important;
                    font-weight: bold;
                }
                
                .video-container {
                    border-radius: 10px;
                    overflow: hidden;
                    margin: 20px 0;
                }
                
                .chat-message {
                    padding: 15px;
                    border-radius: 10px;
                    margin: 10px 0;
                }
                
                .user-message {
                    background-color: #f0f2f6;
                }
                
                .assistant-message {
                    background-color: #e8f0fe;
                }
                
                .progress-card {
                    padding: 20px;
                    border-radius: 10px;
                    background-color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin: 10px 0;
                }
            </style>
        """, unsafe_allow_html=True)

    def render_navigation(self):
        """Render enhanced navigation bar."""
        with st.sidebar:
            st.image("logo.jpg", width=150)  
            st.title("Mercurious.AI")
            
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
        
        # Add section for previously processed videos
        if st.session_state.user:
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
                                    # Remove from session state if exists
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
    
        with col2:
            st.markdown("### Recent Learning Activity")
            if st.session_state.user:
                recent_activity = self.data_manager.get_user_progress(st.session_state.user.uid)
                
                if recent_activity and recent_activity['videos']:
                    for video in recent_activity['videos'][:3]:  # Show last 3 videos
                        with st.container():
                            st.markdown(f"""
                                🎥 **{video['title'][:50]}...**  
                                📅 Last watched: {video['last_watched'].strftime('%Y-%m-%d %H:%M')}
                            """)
                            st.progress(video.get('progress', 0))
                            
                            # Add quick access button
                            if st.button("▶️ Resume", key=f"resume_{video['video_id']}"):
                                st.session_state.current_video = video['video_id']
                                st.session_state.processed_videos[video['video_id']] = {
                                    'info': video['info'],
                                    'video_id': video['video_id'],
                                    'content': video['content']
                                }
                                st.session_state.current_page = "learn"
                                st.rerun()
                else:
                    st.info("No recent activity. Start by processing a video! 🎥")
            else:
                st.warning("Please login to see your learning activity")

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
                    response = self.chat_engine.process_message(prompt, context=st.session_state.messages)
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
                    st.session_state.current_quiz = self.quiz_generator.generate_quiz(
                        video_data["content"]["summary"]
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
        
        with st.form("settings_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                st.text_input("👤 Username", 
                             value=st.session_state.user_data.get("username", ""),
                             key="username")
                st.selectbox("🎨 Theme",
                            ["Light", "Dark"],
                            index=0 if st.session_state.theme == "light" else 1,
                            key="theme")
            
            with col2:
                st.selectbox("🌍 Language",
                            ["English", "Spanish", "French"],
                            key="language")

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

    def run(self):
        """Run the main application."""
        try:
            self.render_navigation()

            # Route to the appropriate page based on current_page state
            page_routes = {
                "home": self.render_home,
                "learn": self.render_learn,
                "quiz": self.render_quiz,
                "progress": self.render_progress,
                "settings": self.render_settings
            }

            # Get the current page from session state
            current_page = st.session_state.get("current_page", "home")

            # Render the appropriate page
            if current_page in page_routes:
                page_routes[current_page]()
            else:
                st.error("Page not found")
                st.session_state.current_page = "home"
                self.render_home()

        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
            st.write("Please try refreshing the page or contact support if the issue persists.")

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
