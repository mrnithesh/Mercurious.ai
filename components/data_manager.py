from firebase_admin import firestore
import datetime
from typing import Dict, Any, List, Optional

class DataManager:
    def __init__(self, db):
        self.db = db

    def save_processed_video(self, user_id: str, video_data: Dict[str, Any]) -> bool:
        """Save processed video data for a user."""
        try:
            video_ref = self.db.collection('users').document(user_id)\
                          .collection('processed_videos').document(video_data['video_id'])
            
            video_ref.set({
                'title': video_data['info']['title'],
                'video_id': video_data['video_id'],
                'content': video_data['content'],
                'info': video_data['info'],
                'progress': 0,
                'last_watched': datetime.datetime.now(),
                'created_at': datetime.datetime.now()
            }, merge=True)
            
            return True
        except Exception as e:
            print(f"Error saving video data: {str(e)}")
            return False

    def update_video_progress(self, user_id: str, video_id: str, progress: float) -> bool:
        """Update progress for a specific video."""
        try:
            video_ref = self.db.collection('users').document(user_id)\
                          .collection('processed_videos').document(video_id)
            
            video_ref.update({
                'progress': progress,
                'last_watched': datetime.datetime.now()
            })
            
            return True
        except Exception as e:
            print(f"Error updating progress: {str(e)}")
            return False

    def save_quiz_result(self, user_id: str, video_id: str, quiz_data: Dict[str, Any]) -> bool:
        """Save quiz results for a user."""
        try:
            quiz_ref = self.db.collection('users').document(user_id)\
                         .collection('quiz_results').document()
            
            quiz_ref.set({
                'video_id': video_id,
                'score': quiz_data['score'],
                'total_questions': quiz_data['total_questions'],
                'completed_at': datetime.datetime.now()
            })
            
            return True
        except Exception as e:
            print(f"Error saving quiz result: {str(e)}")
            return False

    def get_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Get overall user progress."""
        try:
            # Get processed videos
            videos = self.db.collection('users').document(user_id)\
                        .collection('processed_videos').stream()
            
            # Get quiz results
            quiz_results = self.db.collection('users').document(user_id)\
                             .collection('quiz_results').stream()
            
            progress_data = {
                'videos': [doc.to_dict() for doc in videos],
                'quiz_results': [doc.to_dict() for doc in quiz_results],
                'total_videos': 0,
                'average_progress': 0,
                'total_quizzes': 0,
                'average_score': 0
            }
            
            # Calculate statistics
            if progress_data['videos']:
                progress_data['total_videos'] = len(progress_data['videos'])
                progress_data['average_progress'] = sum(
                    video['progress'] for video in progress_data['videos']
                ) / progress_data['total_videos']
            
            if progress_data['quiz_results']:
                progress_data['total_quizzes'] = len(progress_data['quiz_results'])
                progress_data['average_score'] = sum(
                    result['score'] for result in progress_data['quiz_results']
                ) / progress_data['total_quizzes']
            
            return progress_data
        except Exception as e:
            print(f"Error getting user progress: {str(e)}")
            return {}

    def save_notes(self, user_id: str, video_id: str, notes: str) -> bool:
        """Save user notes for a video."""
        try:
            notes_ref = self.db.collection('users').document(user_id)\
                          .collection('notes').document(video_id)
            
            notes_ref.set({
                'content': notes,
                'video_id': video_id,
                'updated_at': datetime.datetime.now()
            }, merge=True)
            
            return True
        except Exception as e:
            print(f"Error saving notes: {str(e)}")
            return False

    def get_notes(self, user_id: str, video_id: str) -> Optional[str]:
        """Get user notes for a video."""
        try:
            notes_doc = self.db.collection('users').document(user_id)\
                          .collection('notes').document(video_id).get()
            
            if notes_doc.exists:
                return notes_doc.to_dict().get('content')
            return None
        except Exception as e:
            print(f"Error getting notes: {str(e)}")
            return None

    def get_all_processed_videos(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all processed videos for a user."""
        try:
            videos = self.db.collection('users').document(user_id)\
                        .collection('processed_videos')\
                        .order_by('last_watched', direction=firestore.Query.DESCENDING)\
                        .stream()
            
            return [doc.to_dict() for doc in videos]
        except Exception as e:
            print(f"Error fetching processed videos: {str(e)}")
            return []

    def delete_video(self, user_id: str, video_id: str) -> bool:
        """Delete a video and its associated data (notes, quiz results) for a user."""
        try:
            # Delete video document
            self.db.collection('users').document(user_id)\
                .collection('processed_videos').document(video_id).delete()
            
            # Delete associated notes
            self.db.collection('users').document(user_id)\
                .collection('notes').document(video_id).delete()
            
            # Delete associated quiz results
            quiz_refs = self.db.collection('users').document(user_id)\
                .collection('quiz_results')\
                .where('video_id', '==', video_id)\
                .stream()
            
            for quiz in quiz_refs:
                quiz.reference.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting video: {str(e)}")
            return False