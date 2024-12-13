import streamlit as st
from firebase_admin import firestore
import datetime
import plotly.express as px
import pandas as pd
from typing import Dict, List

class AdminDashboard:
    def __init__(self, db):
        self.db = db
        self._initialize_session_state()
        
    def _initialize_session_state(self):
        """Initialize session state for admin dashboard."""
        if 'admin_authenticated' not in st.session_state:
            st.session_state.admin_authenticated = False
    
    def _get_total_users(self) -> int:
        """Get total number of registered users."""
        users = self.db.collection('users').get()
        return len(users)
    
    def _get_active_users(self) -> int:
        """Get number of users active in last 7 days."""
        week_ago = datetime.datetime.now() - datetime.timedelta(days=7)
        active_users = self.db.collection('users')\
            .where('last_login', '>=', week_ago)\
            .get()
        return len(active_users)
    
    def _get_video_stats(self) -> Dict:
        """Get statistics about processed videos."""
        try:
            videos = self.db.collection_group('processed_videos').stream()
            video_list = []
            
            for video in videos:
                video_data = video.to_dict()  # Convert DocumentSnapshot to dictionary
                video_list.append(video_data)
            
            total_videos = len(video_list)
            # Calculate total watch time from the video data
            total_watch_time = sum(video.get('duration', 0) for video in video_list)
            
            return {
                'total_videos': total_videos,
                'total_watch_time': total_watch_time
            }
        except Exception as e:
            print(f"Error getting video stats: {str(e)}")
            return {
                'total_videos': 0,
                'total_watch_time': 0
            }
    
    def _get_user_engagement(self) -> pd.DataFrame:
        """Get user engagement metrics over time."""
        users = self.db.collection('users').stream()
        engagement_data = []
        
        for user in users:
            user_data = user.to_dict()
            videos = self.db.collection('users').document(user.id)\
                        .collection('processed_videos').stream()
            
            engagement_data.append({
                'user_id': user.id,
                'videos_watched': len(list(videos)),
                'last_active': user_data.get('last_login', datetime.datetime.now()),
                'join_date': user_data.get('created_at', datetime.datetime.now())
            })
        
        return pd.DataFrame(engagement_data)

    def render_login(self):
        """Render admin login interface."""
        st.title("Admin Dashboard Login")
        
        admin_email = st.text_input("Admin Email")
        admin_password = st.text_input("Password", type="password")
        
        if st.button("Login as Admin"):
            # Add your admin authentication logic here
            if admin_email == "admin@mercurious.ai" and admin_password == "admin123":
                st.session_state.admin_authenticated = True
                st.rerun()
            else:
                st.error("Invalid admin credentials")

    def render_dashboard(self):
        """Render main admin dashboard."""
        st.title("📊 Admin Dashboard")
        
        # Key Metrics
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Users", self._get_total_users())
        with col2:
            st.metric("Active Users (7d)", self._get_active_users())
        with col3:
            video_stats = self._get_video_stats()
            st.metric("Total Videos", video_stats['total_videos'])
        with col4:
            st.metric("Watch Time (hrs)", f"{video_stats['total_watch_time']/3600:.1f}")
        
        # User Engagement Graph
        st.subheader("User Engagement Over Time")
        engagement_data = self._get_user_engagement()
        fig = px.line(engagement_data, 
                     x='join_date', 
                     y='videos_watched',
                     title='User Activity Trend')
        st.plotly_chart(fig)
        
        # User Table
        st.subheader("Recent User Activity")
        users_df = self._get_user_engagement()
        st.dataframe(
            users_df.sort_values('last_active', ascending=False)
            .head(10)
            .style.format({
                'last_active': lambda x: x.strftime('%Y-%m-%d %H:%M'),
                'join_date': lambda x: x.strftime('%Y-%m-%d')
            })
        )
        
        # Video Analytics
        st.subheader("Most Watched Videos")
        video_stats = self._get_popular_videos()
        st.bar_chart(video_stats)

    def _get_popular_videos(self) -> pd.DataFrame:
        """Get most popular videos."""
        videos = self.db.collection_group('processed_videos').stream()
        video_data = []
        
        for video in videos:
            data = video.to_dict()
            video_data.append({
                'title': data.get('title', 'Unknown'),
                'views': data.get('views', 0),
                'completion_rate': data.get('progress', 0) * 100
            })
        
        return pd.DataFrame(video_data)

    def run(self):
        """Run the admin dashboard."""
        if not st.session_state.admin_authenticated:
            self.render_login()
        else:
            self.render_dashboard() 