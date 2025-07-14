from datetime import datetime
from typing import Dict, List, Optional
import json
from fastapi import HTTPException
from google.cloud.firestore_v1 import FieldFilter
from google.cloud import firestore
from ..config.firebase_config import firebase_config
from ..models.video import (
    GlobalVideo, UserVideoReference, VideoLibraryItem, 
    UserVideoMetadata, VideoResponse, VideoInfo, VideoContent, VideoMetadata
)

class VideoDatabase:
    def __init__(self):
        self.db = firebase_config.get_firestore()
    

    
    # Global Videos Collection Operations
    async def get_global_video(self, video_id: str) -> Optional[GlobalVideo]:
        """Get video from global videos collection"""
        try:
            doc_ref = self.db.collection('videos').document(video_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return GlobalVideo(**data)
            return None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching global video: {str(e)}")
    
    async def batch_get_global_videos(self, video_ids: List[str]) -> Dict[str, GlobalVideo]:
        """Batch fetch multiple videos from global collection - eliminates N+1 query problem"""
        try:
            if not video_ids:
                return {}
            
            # Firestore has a limit of 10 documents per get_all call, so we batch them
            batch_size = 10
            global_videos = {}
            
            for i in range(0, len(video_ids), batch_size):
                batch_ids = video_ids[i:i + batch_size]
                doc_refs = [self.db.collection('videos').document(video_id) for video_id in batch_ids]
                docs = self.db.get_all(doc_refs)
                
                for doc in docs:
                    if doc.exists:
                        data = doc.to_dict()
                        global_videos[doc.id] = GlobalVideo(**data)
            
            return global_videos
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error batch fetching global videos: {str(e)}")
    
    async def save_global_video(self, global_video: GlobalVideo) -> bool:
        """Save video to global videos collection"""
        try:
            doc_ref = self.db.collection('videos').document(global_video.video_id)
            
            # Use Pydantic's json() method to properly serialize, then parse back to dict
            # This ensures HttpUrl objects are converted to strings
            video_json = global_video.json()
            video_data = json.loads(video_json)
            
            doc_ref.set(video_data)
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving global video: {str(e)}")
    
    async def update_global_video_access(self, video_id: str) -> bool:
        """Update last accessed time and increment processed count"""
        try:
            doc_ref = self.db.collection('videos').document(video_id)
            doc_ref.update({
                'metadata.last_accessed': datetime.now(),
                'metadata.processed_count': firestore.Increment(1)
            })
            return True
        except Exception as e:
            # If increment fails, try to get current count and update
            try:
                doc = doc_ref.get()
                if doc.exists:
                    current_count = doc.to_dict().get('metadata', {}).get('processed_count', 0)
                    doc_ref.update({
                        'metadata.last_accessed': datetime.now(),
                        'metadata.processed_count': current_count + 1
                    })
                    return True
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Error updating video access: {str(e)}")
    
    # User Library Operations
    async def add_video_to_user_library(self, user_id: str, video_id: str) -> bool:
        """Add video reference to user's library"""
        try:
            user_metadata = UserVideoMetadata(
                added_at=datetime.now(),
                last_watched=None,
                progress=0.0,
                is_favorite=False,
                notes=""
            )
            
            user_video_ref = UserVideoReference(
                video_id=video_id,
                user_metadata=user_metadata
            )
            
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            # Use Pydantic's json() method to properly serialize
            user_json = user_video_ref.json()
            user_data = json.loads(user_json)
            doc_ref.set(user_data)
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error adding video to user library: {str(e)}")
    
    async def check_video_in_user_library(self, user_id: str, video_id: str) -> bool:
        """Check if video exists in user's library"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc = doc_ref.get()
            return doc.exists
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error checking user library: {str(e)}")
    
    async def get_user_video_metadata(self, user_id: str, video_id: str) -> Optional[UserVideoMetadata]:
        """Get user's metadata for a specific video"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return UserVideoMetadata(**data.get('user_metadata', {}))
            return None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user video metadata: {str(e)}")
    
    async def get_user_library(self, user_id: str, limit: int = 50) -> List[VideoLibraryItem]:
        """Get user's video library with pagination - optimized with batch fetching"""
        try:
            # Step 1: Get all user video metadata (1 query)
            user_videos_ref = self.db.collection('users').document(user_id).collection('videos')
            docs = user_videos_ref.order_by('user_metadata.added_at', direction='DESCENDING').limit(limit).get()
            
            # Step 2: Extract video IDs and prepare user metadata mapping
            video_ids = []
            user_metadata_map = {}
            
            for doc in docs:
                data = doc.to_dict()
                video_id = data.get('video_id')
                if video_id:
                    video_ids.append(video_id)
                    user_metadata_map[video_id] = data.get('user_metadata', {})
            
            if not video_ids:
                return []
            
            # Step 3: Batch fetch all global videos (1-5 queries depending on batch size)
            global_videos = await self.batch_get_global_videos(video_ids)
            
            # Step 4: Combine user metadata with global video data (in memory)
            library_items = []
            for video_id in video_ids:  # Maintain original order
                global_video = global_videos.get(video_id)
                user_metadata = user_metadata_map.get(video_id, {})
                
                if global_video:
                    library_item = VideoLibraryItem(
                        video_id=video_id,
                        title=global_video.info.title,
                        author=global_video.info.author,
                        duration=global_video.info.duration,
                        thumbnail_url=global_video.info.thumbnail_url,
                        added_at=user_metadata.get('added_at'),
                        last_watched=user_metadata.get('last_watched'),
                        progress=user_metadata.get('progress', 0.0),
                        is_favorite=user_metadata.get('is_favorite', False),
                        notes=user_metadata.get('notes', "")
                    )
                    library_items.append(library_item)
            
            return library_items
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user library: {str(e)}")
    
    async def remove_video_from_user_library(self, user_id: str, video_id: str) -> bool:
        """Remove video reference from user's library"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc_ref.delete()
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error removing video from user library: {str(e)}")
    
    async def update_user_video_progress(self, user_id: str, video_id: str, progress: float) -> bool:
        """Update user's video progress"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc_ref.update({
                'user_metadata.progress': progress,
                'user_metadata.last_watched': datetime.now()
            })
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error updating video progress: {str(e)}")
    
    async def update_user_video_favorite(self, user_id: str, video_id: str, is_favorite: bool) -> bool:
        """Update user's video favorite status"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc_ref.update({
                'user_metadata.is_favorite': is_favorite
            })
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error updating video favorite: {str(e)}")
    
    async def update_user_video_notes(self, user_id: str, video_id: str, notes: str) -> bool:
        """Update user's video notes"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc_ref.update({
                'user_metadata.notes': notes
            })
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error updating video notes: {str(e)}")
    
    async def get_combined_video_response(self, user_id: str, video_id: str) -> Optional[VideoResponse]:
        """Get combined video response (global video + user metadata)"""
        try:
            # Get global video
            global_video = await self.get_global_video(video_id)
            if not global_video:
                return None
            
            # Get user metadata
            user_metadata = await self.get_user_video_metadata(user_id, video_id)
            if not user_metadata:
                return None
            
            # Combine into VideoResponse
            return VideoResponse(
                video_id=video_id,
                info=global_video.info,
                content=global_video.content,
                progress=user_metadata.progress,
                created_at=global_video.metadata.created_at,
                last_watched=user_metadata.last_watched,
                is_favorite=user_metadata.is_favorite,
                notes=user_metadata.notes
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching combined video response: {str(e)}")
    
    # Chat History Operations
    async def get_chat_history(self, user_id: str, video_id: str) -> List[Dict]:
        """Get chat history for a specific video"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return data.get('chat_history', [])
            return []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")
    
    async def save_chat_message(self, user_id: str, video_id: str, message: Dict) -> bool:
        """Add a message to chat history"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc_ref.update({
                'chat_history': firestore.ArrayUnion([message])
            })
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving chat message: {str(e)}")
    
    async def clear_chat_history(self, user_id: str, video_id: str) -> bool:
        """Clear chat history for a specific video"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('videos').document(video_id)
            doc_ref.update({
                'chat_history': []
            })
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}") 