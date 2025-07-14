import { BaseAPIClient } from '../base';
import { ChatRequest, ChatResponse, ChatHistory } from '../types/chat';

export class ChatAPIService extends BaseAPIClient {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.makePostRequest<ChatResponse>('/api/chat/send', request);
  }

  async getHistory(videoId: string): Promise<ChatHistory> {
    return this.makeGetRequest<ChatHistory>(`/api/chat/history/${videoId}`);
  }

  async clearHistory(videoId: string): Promise<{ message: string }> {
    return this.makeDeleteRequest<{ message: string }>(`/api/chat/history/${videoId}`);
  }

  // Video context is now handled automatically by the backend
  async setVideoContext(videoId: string, context: any): Promise<{ success: boolean; message: string }> {
    // No-op: Backend now gets context automatically from global video collection
    return Promise.resolve({ success: true, message: "Context set automatically" });
  }
} 