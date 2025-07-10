import { BaseAPIClient } from '../base';
import { ChatRequest, ChatResponse, ChatHistory } from '../types/chat';

export class ChatAPIService extends BaseAPIClient {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.makePostRequest<ChatResponse>('/api/chat/send', request);
  }

  async getHistory(videoId: string): Promise<ChatHistory> {
    return this.makeGetRequest<ChatHistory>(`/api/chat/history/${videoId}`);
  }

  async clearHistory(videoId: string): Promise<{ success: boolean; message: string }> {
    return this.makePostRequest<{ success: boolean; message: string }>('/api/chat/clear', { 
      video_id: videoId 
    });
  }

  async setVideoContext(videoId: string, context: any): Promise<{ success: boolean; message: string }> {
    return this.makePostRequest<{ success: boolean; message: string }>(`/api/chat/context/${videoId}`, context);
  }
} 