import { BaseAPIClient } from '../base';
import { VideoResponse, VideoLibraryItem } from '../types/video';

export class VideoAPIService extends BaseAPIClient {
  async processVideo(videoUrl: string): Promise<VideoResponse> {
    return this.makePostRequest<VideoResponse>('/api/videos/process', { url: videoUrl });
  }

  async getLibrary(): Promise<VideoLibraryItem[]> {
    return this.makeGetRequest<VideoLibraryItem[]>('/api/videos/library');
  }

  async getVideo(videoId: string): Promise<VideoResponse> {
    return this.makeGetRequest<VideoResponse>(`/api/videos/${videoId}`);
  }

  async removeFromLibrary(videoId: string): Promise<{ message: string }> {
    return this.makeDeleteRequest<{ message: string }>(`/api/videos/${videoId}`);
  }

  async updateProgress(videoId: string, progress: number): Promise<{ message: string }> {
    return this.makePutRequest<{ message: string }>(`/api/videos/${videoId}/progress`, { progress });
  }

  async toggleFavorite(videoId: string, is_favorite: boolean): Promise<{ message: string }> {
    return this.makePutRequest<{ message: string }>(`/api/videos/${videoId}/favorite`, { is_favorite });
  }

  async updateNotes(videoId: string, notes: string): Promise<{ message: string }> {
    return this.makePutRequest<{ message: string }>(`/api/videos/${videoId}/notes`, { notes });
  }

  async getStats(): Promise<{
    total_videos: number;
    favorites_count: number;
    watched_count: number;
    completed_count: number;
    recent_videos: VideoLibraryItem[];
  }> {
    return this.makeGetRequest('/api/videos/stats');
  }

  isValidYouTubeUrl(url: string): boolean {
    return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(url);
  }
} 