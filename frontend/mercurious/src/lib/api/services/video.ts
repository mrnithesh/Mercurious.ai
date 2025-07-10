import { BaseAPIClient } from '../base';
import { VideoResponse } from '../types/video';

export class VideoAPIService extends BaseAPIClient {
  async processVideo(videoUrl: string): Promise<VideoResponse> {
    return this.makePostRequest<VideoResponse>('/api/videos/process', { url: videoUrl });
  }

  isValidYouTubeUrl(url: string): boolean {
    return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(url);
  }
} 