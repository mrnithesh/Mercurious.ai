export interface VideoInfo {
  title: string;
  author: string;
  description: string;
  duration: string;
  thumbnail_url: string;
  publish_date: string;
  views: number;
  likes: number;
  video_url: string;
}

export interface VideoContent {
  transcript: string;
  summary: string;
  main_points: string[];
  key_concepts: string[];
  study_guide: string;
  analysis: string;
  vocabulary: string[];
}

export interface VideoResponse {
  video_id: string;
  info: VideoInfo;
  content: VideoContent;
  progress: number;
  created_at: string;
  last_watched?: string;
  is_favorite: boolean;
  notes: string;
}

export interface VideoLibraryItem {
  video_id: string;
  title: string;
  author: string;
  duration: string;
  thumbnail_url: string;
  added_at: string;
  last_watched?: string;
  progress: number;
  is_favorite: boolean;
  notes: string;
} 