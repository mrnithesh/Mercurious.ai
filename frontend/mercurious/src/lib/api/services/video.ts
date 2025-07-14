import { BaseAPIClient } from '../base';
import { VideoResponse, VideoLibraryItem } from '../types/video';

export class VideoAPIService extends BaseAPIClient {
  async processVideo(videoUrl: string): Promise<VideoResponse> {
    return this.makePostRequest<VideoResponse>('/api/videos/process', { url: videoUrl });
  }

  async getDashboard(): Promise<VideoLibraryItem[]> {
    return this.makeGetRequest<VideoLibraryItem[]>('/api/videos/dashboard');
  }

  // Legacy method for backward compatibility
  async getLibrary(): Promise<VideoLibraryItem[]> {
    return this.getDashboard();
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



  isValidYouTubeUrl(url: string): boolean {
    return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(url);
  }
} 