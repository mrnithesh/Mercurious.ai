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
    def __init__(self):
        self.video_handler = VideoHandler()
        self.quiz_generator = QuizGenerator()
        self.chat_engine = ChatEngine()
        self.avatar = Avatar()
        self.recommendation_engine = RecommendationEngine()
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
        
        with col2:
            st.markdown("### Recent Learning Activity")
            if st.session_state.processed_videos:
                for video_id, video_data in list(st.session_state.processed_videos.items())[-3:]:
                    with st.container():
                        st.markdown(f"""
                            🎥 **{video_data['info']['title'][:50]}...**  
                            👤 {video_data['info'].get('author', 'Unknown')}
                        """)
                        st.progress(0.7)  # Replace with actual progress
            else:
                st.info("No recent activity. Start by processing a video! 🎥")

    def render_learn(self):
        """Render enhanced learning interface."""
        if hasattr(st.session_state, 'current_video'):
            video_data = st.session_state.processed_videos[st.session_state.current_video]
            
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
                    
                    with st.expander("✏️ Notes", expanded=True):
                        notes = st.text_area("", placeholder="Take notes here...", height=150)
                        col1, col2 = st.columns([1, 1])
                        with col1:
                            if st.button("💾 Save Notes", use_container_width=True):
                                self._save_notes(notes)
                        with col2:
                            if st.button("📋 Copy", use_container_width=True):
                                st.write("Notes copied to clipboard!")
                    
                    with st.expander("⏱️ Timestamps", expanded=True):
                        timestamp = st.text_input("", placeholder="MM:SS Description")
                        if st.button("➕ Add Timestamp", use_container_width=True):
                            self._add_timestamp(timestamp)
                        
                        if "timestamps" in st.session_state:
                            for ts in st.session_state.timestamps:
                                st.markdown(f"- {ts}")
                
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
        
        if st.session_state.learning_progress:
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("Overall Progress")
                overall_progress = sum(st.session_state.learning_progress.values()) / len(st.session_state.learning_progress)
                st.progress(overall_progress)
                st.metric("Complete", f"{overall_progress:.1%}")
            
            with col2:
                st.subheader("Time Spent Learning")
                total_hours = len(st.session_state.processed_videos) * 0.5
                st.metric("Total Hours", f"{total_hours:.1f}")
            
            st.markdown("---")
            st.subheader("Topic Progress")
            
            for topic, progress in st.session_state.learning_progress.items():
                with st.container():
                    col1, col2 = st.columns([3, 1])
                    with col1:
                        st.markdown(f"**{topic}**")
                        st.progress(progress)
                    with col2:
                        st.metric("Progress", f"{progress:.1%}")
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
