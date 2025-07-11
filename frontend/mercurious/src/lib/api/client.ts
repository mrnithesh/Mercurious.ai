import { BaseAPIClient } from './base';
import { VideoAPIService } from './services/video';
import { ChatAPIService } from './services/chat';
import { AuthAPIService } from './services/auth';

export class APIClient extends BaseAPIClient {
  public readonly video: VideoAPIService;
  public readonly chat: ChatAPIService;
  public readonly auth: AuthAPIService;

  constructor(baseURL?: string) {
    super(baseURL);
    this.video = new VideoAPIService(baseURL);
    this.chat = new ChatAPIService(baseURL);
    this.auth = new AuthAPIService(baseURL);
  }

  // Legacy methods for backward compatibility
  async processVideo(videoUrl: string) {
    return this.video.processVideo(videoUrl);
  }

  isValidYouTubeUrl(url: string): boolean {
    return this.video.isValidYouTubeUrl(url);
  }

  async sendChatMessage(request: any) {
    return this.chat.sendMessage(request);
  }

  async getChatHistory(videoId: string) {
    return this.chat.getHistory(videoId);
  }

  async clearChatHistory(videoId: string) {
    return this.chat.clearHistory(videoId);
  }

  async setVideoContext(videoId: string, context: any) {
    return this.chat.setVideoContext(videoId, context);
  }
} 